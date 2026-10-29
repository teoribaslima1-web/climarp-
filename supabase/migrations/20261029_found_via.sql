-- "Como encontrou o Clima16?" (pergunta opcional do formulário e do cadastro manual no painel).
-- Não apaga dados e pode ser executado novamente.
alter table public.leads
  add column if not exists found_via text
    check (found_via is null or found_via in ('google', 'google_ads', 'instagram', 'indicacao', 'whatsapp', 'outro'));
