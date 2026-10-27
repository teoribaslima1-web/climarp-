-- Funil do formulário de orçamento: em qual etapa as pessoas param.
-- Sem cookies e sem dados pessoais (não guarda IP, nome, telefone nem identificador do visitante).
-- Não apaga dados e pode ser executado novamente.
create table if not exists public.form_funnel_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event text not null check (event in ('inicio', 'servico', 'local', 'bairro', 'envio', 'enviado', 'whatsapp')),
  entry text not null default 'home' check (entry in ('home', 'servico')),
  service text,
  step smallint,
  device text,
  source text
);
create index if not exists form_funnel_events_created_idx on public.form_funnel_events(created_at desc);
alter table public.form_funnel_events enable row level security;
