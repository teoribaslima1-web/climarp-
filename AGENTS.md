# Regras do projeto Clima16 (para qualquer assistente de IA)

Leia este arquivo antes de alterar qualquer coisa. Ele vale para Claude, Gemini/Antigravity, Cursor e outros agentes.
O `README.md` explica como rodar o projeto. Aqui ficam as **regras e combinados**.

## O que é
- Site estático (HTML + ES Modules + Tailwind compilado) que recebe pedidos de orçamento de ar-condicionado em Ribeirão Preto e encaminha a técnicos parceiros. A Clima16 **não executa** serviços.
- Funções serverless em `api/` (Vercel, CommonJS, Node, **sem dependências**) falam com o Supabase (REST, chave de serviço) e enviam e-mails pelo Resend.
- Produção: `https://clima16.com.br` (deploy automático da Vercel a cada `git push` na `main`).

## Antes de dizer que terminou
1. Usou classe nova do Tailwind? Rode `npm run css`.
2. Rode `npm test` e `npm run build`. Os dois precisam passar.
3. Mudou o banco? Crie um arquivo em `supabase/migrations/AAAAMMDD_nome.sql` (idempotente, com `if not exists`), copie o mesmo trecho para o fim de `supabase/schema.sql` e avise o dono que ele precisa rodar o SQL no Supabase (SQL Editor). O agente não roda SQL em produção.
4. Mudou comportamento de `api/`? Atualize ou crie testes em `scripts/test-*.mjs`.
5. Entregue ao dono os comandos de publicação em PowerShell:
   `cd C:\Users\teori\.gemini\antigravity\scratch\climarp` → `git add .` → `git commit -m "..."` → `git push`.

## Conteúdo e tom
- Todo texto visível em **português do Brasil**, direto e simples.
- **Nunca inventar** depoimentos, avaliações, números de clientes, "equipe", prazos ou garantias que não existem. Hoje quem opera é uma pessoa (Téo Ribas Lima).
- Não prometer volume de pedidos aos parceiros. O cadastro de parceiro é gratuito, sem mensalidade e sem exclusividade.
- A seção "Profissionais parceiros" da home só mostra parceiros reais, com autorização (`CONFIG.featuredPartners` em `js/config.js`).

## Segurança (obrigatório)
- **Segredos** (chaves Supabase, Resend, `CRON_SECRET`, `IP_HASH_SALT`) só nas variáveis de ambiente da Vercel. Nunca no código, no chat, em commits ou em `.env` versionado.
- Todo texto vindo de usuário: `escapeHtml` antes de virar HTML (páginas e e-mails). Nada de `innerHTML` com dado não escapado.
- Filtros do Supabase (PostgREST) nunca montados com texto livre do usuário: valide IDs com `UUID_RE`, use listas fixas, `encodeURIComponent` nos demais.
- Tabelas com RLS ligado e sem políticas públicas; o navegador **nunca** fala direto com o Supabase.
- Admin: e-mail em `ADMIN_EMAILS` (ou `LEAD_NOTIFY_TO`) e, se configurado, ID em `ADMIN_USER_IDS`. Login de parceiro nunca pode usar e-mail de admin.
- Parceiro: identificado por `partners.auth_user_id` (criado pelo admin), nunca só pelo e-mail. Só vê leads com `partner_id` dele.
- Logins de admin e parceiro têm limite de tentativas (tabela `auth_failures`).
- Scripts de terceiros (GTM, GA4, Meta Pixel) **nunca** em `/admin` e `/parceiro`. Essas rotas têm CSP própria em `vercel.json`: não use `onclick=` ou `<script>` inline no código que roda nelas (use `addEventListener`).
- Analytics só carrega depois do aceite de cookies (LGPD).
- O e-mail de confirmação ao cliente não repete texto livre (nome/bairro passam por `safeLabel`) e sai no máximo 1 vez a cada 24h por endereço.

## Organização
- `js/config.js`: marca, contatos, IDs de analytics, serviços, bairros.
- `js/views/` páginas; `js/components/` peças reutilizáveis; `js/router.js` rotas (History API).
- `api/_lib.js`: funções compartilhadas (escape, hash de IP, e-mail, limitador de login).
- `scripts/build-check.mjs` valida e gera `dist/` + `sitemap.xml`; `scripts/prerender.mjs` gera o HTML das páginas públicas.
- `prospeccao/` é material comercial com dados de terceiros: está no `.gitignore` e **nunca** vai para o GitHub.

## Não fazer
- Adicionar dependências de runtime em `api/` ou frameworks que exijam outro build.
- Mudar o layout/tema geral sem pedido explícito.
- Criar contas, enviar e-mails/mensagens ou publicar algo em nome do dono sem confirmação dele.
- Apagar dados de produção.
