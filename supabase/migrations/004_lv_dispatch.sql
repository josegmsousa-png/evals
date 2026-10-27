-- Nova área LV Dispatch, ao lado das 4 equipas de MV Dispatch.
-- label: nome mostrado nas páginas ("MV Dispatch Tejo", "LV Dispatch")

alter table teams add column label text not null default '';
update teams set label = 'MV Dispatch ' || name;

insert into teams (name, position, label) values ('LV Dispatch', 5, 'LV Dispatch');

-- Começa com o mesmo período e critérios do Tejo
do $$
declare
  src periods;
  lv uuid := (select id from teams where name = 'LV Dispatch');
  new_period uuid;
begin
  select p.* into src from periods p join teams t on t.id = p.team_id
    where t.name = 'Tejo' order by p.deadline desc limit 1;
  if src.id is null then return; end if;
  insert into periods (name, deadline, team_id) values (src.name, src.deadline, lv) returning id into new_period;
  insert into criteria (period_id, position, name, description, weight)
    select new_period, position, name, description, weight from criteria where period_id = src.id;
end $$;

insert into technicians (name, team_id)
select n, (select id from teams where name = 'LV Dispatch') from unnest(array[
  'Tiago Reizinho', 'Telmo Couto', 'Robério Sales', 'Rui Filipe Monteiro', 'Ricardo Oliveira',
  'Ricardo Santos', 'Rafael Costa', 'Rafael Rosado', 'Rafael Pereira Matos', 'Rafael Flor',
  'Pedro Ramos', 'Mário Rocha Santos', 'João Araújo Oliveira', 'Gonçalo Marques', 'Gonçalo Silva',
  'Diogo Severino', 'Daniel Teixeira', 'Bruno Gomes', 'Constantin Ciocáláu', 'André Vassalo',
  'Ana Quaresma', 'Alexandre Rodrigues', 'Alberto Caetano'
]) as n;
