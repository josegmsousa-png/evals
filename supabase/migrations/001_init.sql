-- Evals — avaliação anual dos técnicos pelos engenheiros

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  name text not null default '',
  role text not null default 'engineer' check (role in ('admin', 'engineer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table periods (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- ex: "Avaliação 2026"
  deadline timestamptz not null,      -- editável até esta data
  created_at timestamptz not null default now()
);

-- Os critérios pertencem a um período, para os pesos poderem mudar de ano para ano
create table criteria (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references periods on delete cascade,
  position int not null,
  name text not null,
  description text not null default '',
  weight int not null check (weight between 0 and 100)
);

-- scores: { "<criterion_id>": { "level": 0..4, "comment": "..." } }
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references periods on delete cascade,
  engineer_id uuid not null references profiles on delete cascade,
  technician_id uuid not null references technicians on delete cascade,
  scores jsonb not null default '{}',
  submitted boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (period_id, engineer_id, technician_id)
);

-- Cria o perfil quando um utilizador é convidado
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'engineer')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and active)
$$;

create function is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and active)
$$;

create function period_open(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from periods where id = p and deadline > now())
$$;

-- RLS: engenheiros só veem as próprias avaliações; só o admin vê resultados
alter table profiles enable row level security;
alter table technicians enable row level security;
alter table periods enable row level security;
alter table criteria enable row level security;
alter table evaluations enable row level security;

create policy "own profile or admin" on profiles for select using (id = auth.uid() or is_admin());
create policy "admin manages profiles" on profiles for all using (is_admin()) with check (is_admin());

create policy "read technicians" on technicians for select to authenticated using (true);
create policy "admin manages technicians" on technicians for all using (is_admin()) with check (is_admin());

create policy "read periods" on periods for select to authenticated using (true);
create policy "admin manages periods" on periods for all using (is_admin()) with check (is_admin());

create policy "read criteria" on criteria for select to authenticated using (true);
create policy "admin manages criteria" on criteria for all using (is_admin()) with check (is_admin());

create policy "engineer reads own" on evaluations for select using (engineer_id = auth.uid() or is_admin());
create policy "engineer creates own while open" on evaluations for insert
  with check (engineer_id = auth.uid() and is_active() and period_open(period_id));
create policy "engineer edits own while open" on evaluations for update
  using (engineer_id = auth.uid() and is_active() and period_open(period_id))
  with check (engineer_id = auth.uid() and is_active() and period_open(period_id));
create policy "admin manages evaluations" on evaluations for all using (is_admin()) with check (is_admin());
