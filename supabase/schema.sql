-- Clima16 — schema do banco de leads (Supabase / PostgreSQL)
-- Como usar: Supabase > SQL Editor > New query > cole este arquivo > Run.
-- Pode ser executado mais de uma vez sem erro.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- Contato
  name             text not null check (char_length(name) between 2 and 120),
  phone            text not null,                       -- como o cliente digitou
  phone_digits     text not null check (phone_digits ~ '^[0-9]{10,13}$'),
  email            text,

  -- Localização
  city             text not null default 'Ribeirão Preto',
  state            text not null default 'SP',
  neighborhood     text,

  -- Pedido
  service_type     text not null,
  property_type    text,
  has_equipment    text,
  btu              text,
  description      text check (description is null or char_length(description) <= 2000),

  -- Gestão
  status           text not null default 'novo'
                   check (status in ('novo','em_contato','encaminhado','convertido','perdido','invalido','duplicado')),
  assigned_partner text,
  notes            text,

  -- Origem / marketing
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_content      text,
  utm_term         text,
  gclid            text,
  fbclid           text,
  referrer         text,
  landing_page     text,
  device           text,

  -- LGPD e antiabuso
  consent          boolean not null default false,
  consent_at       timestamptz,
  ip_hash          text                                  -- hash do IP, nunca o IP em si
);

create index if not exists leads_created_at_idx   on public.leads (created_at desc);
create index if not exists leads_status_idx       on public.leads (status);
create index if not exists leads_phone_digits_idx on public.leads (phone_digits, created_at desc);
create index if not exists leads_ip_hash_idx      on public.leads (ip_hash, created_at desc);

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- Segurança: RLS ligado e NENHUMA política pública.
-- Resultado: o site (chave anon) não consegue ler nem gravar nada na tabela.
-- Quem grava é a função /api/leads, usando a chave de serviço (service_role),
-- que ignora o RLS e fica só nas variáveis de ambiente da Vercel.
-- As políticas do painel admin (leitura por usuário logado) entram na etapa do admin.
alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;

-- ============================================================
-- Parceiros (cadastro de interesse de técnicos e empresas)
-- Mesma regra de segurança: RLS ligado, sem política pública.
-- Quem grava é a função /api/partners; quem lê é o painel admin.
-- ============================================================
create table if not exists public.partners (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  name         text not null check (char_length(name) between 2 and 120),
  phone        text not null,
  phone_digits text not null check (phone_digits ~ '^[0-9]{10,13}$'),
  email        text,
  city         text not null default 'Ribeirão Preto – SP',
  services     text[] not null default '{}',
  cnpj         text check (cnpj is null or cnpj ~ '^[0-9]{14}$'),
  bio          text check (bio is null or char_length(bio) <= 1500),

  status       text not null default 'novo'
               check (status in ('novo','em_analise','aprovado','recusado','duplicado')),
  notes        text,

  utm_source   text,
  device       text,
  consent      boolean not null default false,
  consent_at   timestamptz,
  ip_hash      text
);

create index if not exists partners_created_at_idx   on public.partners (created_at desc);
create index if not exists partners_phone_digits_idx on public.partners (phone_digits, created_at desc);
create index if not exists partners_ip_hash_idx      on public.partners (ip_hash, created_at desc);

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

alter table public.partners enable row level security;
revoke all on public.partners from anon, authenticated;

-- ============================================================
-- Encaminhamento de leads a parceiros + acesso ao portal do parceiro
-- ============================================================
alter table public.leads
  add column if not exists partner_id uuid references public.partners(id) on delete set null,
  add column if not exists dispatched_at timestamptz,
  add column if not exists partner_status text
    check (partner_status is null or partner_status in ('recebido','em_atendimento','fechado','sem_resposta'));

create index if not exists leads_partner_id_idx on public.leads (partner_id, dispatched_at desc);

alter table public.partners
  add column if not exists auth_user_id uuid,
  add column if not exists access_created_at timestamptz;
