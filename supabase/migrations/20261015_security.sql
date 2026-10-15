-- Clima16 — segurança (15/10/2026)
-- Registra tentativas de login que falharam (admin e área do parceiro) para limitar força bruta.
-- Guarda só hashes (IP e e-mail), nunca o e-mail ou a senha. Idempotente: pode rodar mais de uma vez.

create table if not exists public.auth_failures (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  scope       text not null check (scope in ('admin','portal')),
  ip_hash     text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  email_hash  text not null check (email_hash ~ '^[0-9a-f]{64}$')
);

create index if not exists auth_failures_email_idx on public.auth_failures(email_hash, created_at desc);
create index if not exists auth_failures_ip_idx on public.auth_failures(ip_hash, created_at desc);

-- Fechada ao público: só as funções da Vercel (chave de serviço) acessam.
alter table public.auth_failures enable row level security;
revoke all on public.auth_failures from anon, authenticated;

-- Limpeza opcional de registros antigos (rode quando quiser):
-- delete from public.auth_failures where created_at < now() - interval '30 days';
