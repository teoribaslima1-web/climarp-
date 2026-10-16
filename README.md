# Clima16

Plataforma de solicitação e encaminhamento de orçamentos de ar-condicionado em Ribeirão Preto. Os profissionais parceiros executam os serviços. Código estático com ES Modules, funções Node na Vercel, Supabase e Resend.

## Executar e verificar

Use Node.js 22 ou superior (o build importa os módulos ES do frontend).

```sh
npm ci
npm run build
npm test
npm start
```

O servidor local atende em `http://127.0.0.1:3000`, serve as páginas de `dist/` e executa `/api`. Sem variáveis de ambiente, os endpoints retornam erro de configuração. Segredos ficam fora do repositório. `npm run css` recompila o Tailwind quando necessário.

Para testar o ciclo completo sem contas ou envios reais:

```sh
npm run build
npm run smoke
```

O ambiente descartável atende em `http://127.0.0.1:3001`, guarda dados somente na memória e bloqueia chamadas externas. Login de teste em `/admin`: `admin@example.com`, senha `test-local`. Esses dados não são credenciais de produção. Encerrar o processo elimina os registros de teste.

## Funcionalidades atuais

- Formulário de cinco etapas, WhatsApp e confirmação com protocolo.
- Cadastro de interesse de parceiros em `/para-profissionais`.
- Painel `/admin` autenticado por Supabase Auth e lista de e-mails autorizados.
- Aprovação de parceiros, criação de acesso, encaminhamento e portal `/parceiro`, restrito aos leads do parceiro autenticado.
- Resultados comerciais: primeiro contato, orçamento, fechamento, valor do serviço e observações. Exportação CSV inclui os resultados.
- Notificação interna e confirmação do cliente, com resultado registrado no banco e reenvio manual pelo painel.
- Páginas de serviço, blog, calculadora de BTUs, privacidade e termos.
- URLs reais via History API; links antigos com `#/` são convertidos.
- HTML de páginas públicas gerado no build, com título, descrição, canonical e metadados sociais por página. Admin, parceiro, confirmação e página de erro têm `noindex`.

## Fluxo de dados e confiabilidade

`POST /api/leads` valida, normaliza telefone, verifica abuso/duplicados, salva no Supabase e tenta os dois e-mails em paralelo. Um erro no Resend ou no registro do resultado do e-mail não invalida o lead salvo.

Cada tentativa do formulário envia `request_id` (UUID), usado como chave primária do lead. Repetir a mesma tentativa, inclusive simultaneamente, retorna o registro existente sem enviar novamente os e-mails. Alterar os dados do pedido inicia outra tentativa. A mesma pessoa com telefone equivalente, com ou sem DDI 55, é identificada na janela de duplicidade. Limitação: recarregar a página inicia uma nova tentativa; a janela por telefone continua protegendo contra duplicados.

As chamadas ao Supabase têm limite de 4 segundos; os envios ao Resend têm limite de 3 segundos. O formulário espera até 30 segundos e permite tentar novamente. O aviso por e-mail tem chave de idempotência por lead/tipo/tentativa. `sent` significa aceito pela API do Resend, não prova de recebimento na caixa de entrada. `unknown` significa que não há resultado histórico confirmado. O reenvio manual envia novamente o aviso interno e, se houver endereço, a confirmação ao cliente.

O banco é a única fonte de registros operacionais. O navegador remove o histórico local legado e mantém apenas o resumo da confirmação em `sessionStorage`, com validade de 30 minutos, sem telefone, e-mail e descrição. Conversões são contadas uma vez por ID na sessão; pedidos classificados como duplicados geram `form_duplicate`, não `form_complete`. Essa medição não substitui a qualificação comercial do lead.

## Banco e publicação — pendentes para depois da prospecção

Para um banco novo, executar `supabase/schema.sql`. Para um banco existente, aplicar `supabase/migrations/20261014_reliability.sql`. A atualização adiciona os campos de notificações/resultados e registra automaticamente contato/fechamento quando o andamento muda. Não remove leads. O índice único de usuário do parceiro exige não haver vínculos duplicados existentes.

As alterações de código são locais; publicar o código e aplicar a atualização SQL são etapas separadas. A gravação de leads continua funcionando sem as novas colunas, mas o histórico de notificações e os campos comerciais precisam da atualização. O painel informa quando esses campos ainda não existem.

Variáveis estão em `.env.example`: Supabase URL/chave de serviço, chave pública para Auth, `ADMIN_EMAILS`, Resend, remetente, destinatário e salt para hash de IP. Usar somente variáveis seguras na Vercel. Nunca expor chaves privadas no navegador. Manter Zoho no domínio principal e Resend no subdomínio de envio.

Depois de publicar: validar pedido real no banco, confirmação e aviso no e-mail, cadastro de parceiro, login, encaminhamento e atualização do andamento. Conferir RLS aplicado e que um usuário sem autorização não acessa os dados.

## Medição — pendente de conferência nas contas

GTM e GA4 têm IDs em `js/config.js`. Com GTM configurado, a tag GA4 deve existir no contêiner publicado; o ID sozinho não comprova instalação. Os scripts externos só carregam após aceitar métricas. A opção “Só essenciais” permite usar o formulário sem carregar rastreadores externos.

Eventos principais: `form_start` após interação com o formulário, `form_step_1` a `form_step_4`, `form_complete` após sucesso do banco, `form_duplicate`, `form_submit_error`, `whatsapp_click`, `professional_signup` e `cta_click`. Validar no GTM/GA4 que cada pedido conta uma vez. Search Console, envio do sitemap e dados reais de campanhas ficam para a próxima etapa.

O rodapé permite reabrir “Preferências de cookies”. Retirar o aceite recarrega a página para descarregar rastreadores. Eventos anteriores ao aceite não são colocados no dataLayer nem reenviados retroativamente; o histórico local da sessão é apenas diagnóstico. As áreas privadas continuam sem rastreadores, inclusive quando existe aceite anterior.

## Divulgação e auditoria de SEO

A tag de verificação do Search Console já existe em `index.html` e é preservada no build. Sua presença não comprova propriedade verificada, sitemap enviado ou páginas indexadas na conta Google. O JSON-LD descreve a Clima16 como organização/plataforma, sem ofertas de serviços próprios ou faixa de preços inventada.

Depois de `npm run build`, execute `npm run audit:seo` para conferir os arquivos gerados. `npm run audit:seo -- --live` consulta somente páginas públicas de `https://clima16.com.br`, sem enviar formulários ou alterar dados. A auditoria verifica URLs do sitemap, títulos, descrições, H1, canonical, noindex e, em produção, CSP das áreas privadas. Não substitui Search Console ou testes de entrega real de e-mails.

Em `divulgacao/`, ficam o relatório de 16/10/2026 e o material inicial de Instagram (bio, três artes PNG, legendas, textos alternativos e links UTM). Esses arquivos são de preparação e não entram em `dist/`. Não publicar sem revisão/autorização do dono e acesso à conta correta. Não há usuário de Instagram presumido nem parceiro fictício no material.

## Piloto comercial

O material de abordagem está em `EMAILS-PARCEIROS.md`. Começar com cinco contatos personalizados. Confirmar serviços, cobertura, disponibilidade e disposição para dar feedback antes de aprovar o parceiro. Não prometer volume ou prazo de atendimento sem capacidade comprovada.

Lead válido: contato utilizável, intenção real de solicitar serviço aceito, localização atendida, não duplicado e não spam/teste. Registrar problemas e motivos de perda. Contato inválido ou demanda fora da cobertura combinada devem ser revisados no piloto; ausência de fechamento, por si só, não torna um lead inválido. Preço e política comercial final permanecem por validar com os parceiros.

Após formar a rede e validar produção, acompanhar os primeiros pedidos manualmente: contato, orçamento, fechamento, valor e feedback. Só iniciar mídia quando houver capacidade de atendimento. Medir gasto dividido por leads válidos, taxas de contato/orçamento/fechamento e disposição real de pagar. Valores de serviços dos parceiros não são receita da Clima16.

## Verificação concluída localmente

Testes automatizados usam Supabase/Resend simulados e cobrem validação, autenticação, isolamento dos parceiros, persistência, erros, idempotência concorrente, notificações, dados temporários e HTML gerado. O ciclo de solicitação e edição de resultado comercial também foi exercitado no navegador em ambiente descartável. Isso não confirma as configurações de produção.
