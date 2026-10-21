-- Login por email + palavra-passe: obriga a definir uma nova na primeira entrada
alter table profiles add column must_change_password boolean not null default false;
