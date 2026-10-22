-- Várias equipas (Tejo, Guadiana, Douro, Mondego).
-- Engenheiros e técnicos pertencem a uma equipa; os administradores podem ser
-- de uma equipa ou globais (team_id null), que veem todas.

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position int not null default 0
);
insert into teams (name, position) values ('Tejo', 1), ('Guadiana', 2), ('Douro', 3), ('Mondego', 4);

alter table profiles add column team_id uuid references teams on delete restrict;
alter table technicians add column team_id uuid references teams on delete cascade;
alter table periods add column team_id uuid references teams on delete cascade;

-- Tudo o que existe hoje é do Tejo, excepto o administrador global
update profiles set team_id = (select id from teams where name = 'Tejo')
  where email <> 'josegmsousa@gmail.com';
update profiles set role = 'admin', team_id = null where email = 'josegmsousa@gmail.com';
update technicians set team_id = (select id from teams where name = 'Tejo');
update periods set team_id = (select id from teams where name = 'Tejo');
alter table technicians alter column team_id set not null;
-- O botão Desactivar deixa de existir: reactiva quem estava desactivado
update profiles set active = true;
update technicians set active = true;
alter table periods alter column team_id set not null;

-- O perfil criado no convite guarda a equipa
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name, role, team_id)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'engineer'),
    nullif(new.raw_user_meta_data->>'team_id', '')::uuid
  );
  return new;
end $$;

-- Funções de acesso
create function my_team() returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from profiles where id = auth.uid() and active
$$;

-- Admin global (sem equipa) gere todas; admin de equipa só a sua
create function can_admin_team(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and active and role = 'admin' and (team_id is null or team_id = t)
  )
$$;

create function period_team(p uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from periods where id = p
$$;

create function technician_team(t uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from technicians where id = t
$$;

-- Regras de acesso por equipa
drop policy "own profile or admin" on profiles;
drop policy "admin manages profiles" on profiles;
create policy "own profile or team admin" on profiles for select
  using (id = auth.uid() or can_admin_team(team_id));
create policy "team admin manages profiles" on profiles for all
  using (can_admin_team(team_id)) with check (can_admin_team(team_id));

drop policy "read technicians" on technicians;
drop policy "admin manages technicians" on technicians;
create policy "read own team technicians" on technicians for select
  using (team_id = my_team() or can_admin_team(team_id));
create policy "team admin manages technicians" on technicians for all
  using (can_admin_team(team_id)) with check (can_admin_team(team_id));

drop policy "read periods" on periods;
drop policy "admin manages periods" on periods;
create policy "read own team periods" on periods for select
  using (team_id = my_team() or can_admin_team(team_id));
create policy "team admin manages periods" on periods for all
  using (can_admin_team(team_id)) with check (can_admin_team(team_id));

drop policy "read criteria" on criteria;
drop policy "admin manages criteria" on criteria;
create policy "read own team criteria" on criteria for select
  using (period_team(period_id) = my_team() or can_admin_team(period_team(period_id)));
create policy "team admin manages criteria" on criteria for all
  using (can_admin_team(period_team(period_id))) with check (can_admin_team(period_team(period_id)));

drop policy "engineer reads own" on evaluations;
drop policy "engineer creates own while open" on evaluations;
drop policy "engineer edits own while open" on evaluations;
drop policy "admin manages evaluations" on evaluations;
create policy "engineer reads own" on evaluations for select
  using (engineer_id = auth.uid() or can_admin_team(period_team(period_id)));
create policy "engineer creates own while open" on evaluations for insert
  with check (
    engineer_id = auth.uid() and is_active() and period_open(period_id)
    and period_team(period_id) = my_team() and technician_team(technician_id) = my_team()
  );
create policy "engineer edits own while open" on evaluations for update
  using (engineer_id = auth.uid() and is_active() and period_open(period_id))
  with check (
    engineer_id = auth.uid() and is_active() and period_open(period_id)
    and period_team(period_id) = my_team() and technician_team(technician_id) = my_team()
  );
create policy "team admin manages evaluations" on evaluations for all
  using (can_admin_team(period_team(period_id))) with check (can_admin_team(period_team(period_id)));

alter table teams enable row level security;
create policy "read teams" on teams for select to authenticated using (true);

drop function is_admin();

-- As outras equipas começam com o mesmo período e critérios do Tejo
do $$
declare
  src periods;
  t teams;
  new_period uuid;
begin
  select * into src from periods order by deadline desc limit 1;
  if src.id is null then return; end if;
  for t in select * from teams where name <> 'Tejo' loop
    insert into periods (name, deadline, team_id) values (src.name, src.deadline, t.id) returning id into new_period;
    insert into criteria (period_id, position, name, description, weight)
      select new_period, position, name, description, weight from criteria where period_id = src.id;
  end loop;
end $$;

-- Técnicos das novas equipas
insert into technicians (name, team_id)
select n, (select id from teams where name = 'Guadiana') from unnest(array[
  'Rui Guilherme', 'Hugo Mendes', 'Ricardo Pereira', 'Bruno Meseiro', 'Daniel Marques',
  'José Luis Costa', 'Miguel Vital', 'Tiago Mendes', 'Sérgio Sá', 'João Feliciano',
  'David Pereirinha', 'Tiago Vieira', 'Ângela Idefonso'
]) as n;

insert into technicians (name, team_id)
select n, (select id from teams where name = 'Douro') from unnest(array[
  'Diogo Olo', 'Miguel Senra', 'José Agostinho', 'Bruno Miguel', 'Hugo Rocha',
  'Ivo Fangueiro', 'Ricardo Oliveira', 'Delfim Botelho', 'Luís Pinto Cunha', 'Bruno Filipe',
  'Telmo Silva', 'Luís Silva', 'Marcos Mendes'
]) as n;

insert into technicians (name, team_id)
select n, (select id from teams where name = 'Mondego') from unnest(array[
  'António Crista', 'Hugo Rebelo', 'João Pereira', 'Rui Salvador Sousa', 'José Martins Santos',
  'Paulo Novo', 'Leonel Roque', 'Tiago Ramos', 'Miguel Ribeiro', 'Tiago Rocha',
  'Rui Cunha', 'Sofia Borges', 'Diogo Ribeiro'
]) as n;
