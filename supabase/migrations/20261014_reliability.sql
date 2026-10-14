-- Aplicar antes de publicar as melhorias de métricas/notificações.
-- Não apaga dados e pode ser executado novamente.
alter table public.leads
  add column if not exists notification_status text not null default 'unknown',
  add column if not exists customer_notification_status text not null default 'unknown',
  add column if not exists notification_attempted_at timestamptz,
  add column if not exists first_contact_at timestamptz,
  add column if not exists quoted_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists service_value numeric(12,2) check (service_value >= 0);

create index if not exists leads_notification_status_idx on public.leads(notification_status, created_at desc);
-- Evita dois cadastros vinculados ao mesmo usuário do portal.
create unique index if not exists partners_auth_user_unique on public.partners(auth_user_id) where auth_user_id is not null;

create or replace function public.record_lead_progress()
returns trigger language plpgsql as $$
begin
  if new.partner_status = 'em_atendimento' and old.partner_status is distinct from new.partner_status then
    new.first_contact_at = coalesce(new.first_contact_at, now());
  end if;
  if (new.partner_status = 'fechado' and old.partner_status is distinct from new.partner_status)
     or (new.status = 'convertido' and old.status is distinct from new.status) then
    new.closed_at = coalesce(new.closed_at, now());
    new.status = 'convertido';
  end if;
  return new;
end $$;
drop trigger if exists leads_record_progress on public.leads;
create trigger leads_record_progress before update on public.leads
  for each row execute function public.record_lead_progress();
