-- Período 2026 com os critérios e pesos da folha Excel actual.
-- Correr depois da migração. Ajustar o prazo se necessário.
with p as (
  insert into periods (name, deadline) values ('Avaliação 2026', '2026-12-31 23:59:59+00') returning id
)
insert into criteria (period_id, position, name, description, weight)
select p.id, c.position, c.name, c.description, c.weight from p, (values
  (1, 'Comportamento / Postura', 'Forma de estar em sala, ruído e perturbações, atitudes menos correctas, necessidade de chamar a atenção', 10),
  (2, 'Abertura / Colaboração / Disponibilidade', 'Comunicação de situações críticas, entreajuda e trabalho em equipa, comunicação com equipas, integração de novos procedimentos', 15),
  (3, 'Técnica / Procedimental', 'Conhecimentos técnicos, resolução de problemas, segurança na operação, conhecimento e aplicação dos procedimentos, domínio das ferramentas', 25),
  (4, 'Metodologia de Trabalho', 'Organização do trabalho e passagem do turno, trabalho sob stress, acompanhamento das situações, despiste e encaminhamento de alarmes SCADA, capacidade de gestão de múltiplas solicitações', 20),
  (5, 'Qualidade da Informação', 'Acompanhamento e tratamento das ocorrências RA "online" (manobras de texto, observações técnicas e classificação, passagem a completo no local), ocorrências e consignações em curso devidamente reflectidas nos esquemáticos Genesys', 15),
  (6, 'Iniciativa / Proactividade', 'Alterações de rede por disparos, propostas de melhoria, interesse e autodesenvolvimento, espírito crítico, ocupação de tempos "mortos"', 15)
) as c(position, name, description, weight);

insert into technicians (name) values
  ('Gláucio Silva'), ('Paulo Paixão'), ('Tiago Reizinho'), ('Aires Rocha'), ('Tiago Rosado'),
  ('Bruno Maldonado'), ('Ricardo Carvalho'), ('Hugo Serra'), ('Pedro Nogueira'), ('Nuno Brito'),
  ('Jaime Neves'), ('André Santos'), ('Fernando Pardal'), ('João Almeida'), ('António Brilhante');
