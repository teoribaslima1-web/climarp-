# Clima16 - Plataforma Local de Orçamentos de Ar-Condicionado (Ribeirão Preto – SP)

O **Clima16** é uma plataforma moderna, rápida, responsiva e de alta conversão para cotação de serviços de climatização (instalação, manutenção, limpeza/higienização, reparos de vazamento e recarga de gás) em Ribeirão Preto – SP.

---

## 🚀 Como Executar Localmente

### Opção 1: Via Servidor HTTP Simples (Python já disponível)
Execute no terminal PowerShell:
```powershell
cd C:\Users\teori\.gemini\antigravity\scratch\climarp
python -m http.server 3000
```
Abra no seu navegador: `http://localhost:3000`

---

## ⚙️ Configurações Centrais (`js/config.js`)

Todos os placeholders e parâmetros centrais estão centralizados em `js/config.js`:

```javascript
export const CONFIG = {
  brand: {
    name: 'Clima16',
    city: 'Ribeirão Preto',
    state: 'SP',
    // Altere para o seu número de WhatsApp comercial real (DDI + DDD + Número)
    whatsappNumber: '5516999999999', 
    emailContact: 'contato@clima16.com.br'
  },
  analytics: {
    gtmId: 'GTM-XXXXXXX',
    ga4Id: 'G-XXXXXXXXXX',
    metaPixelId: 'XXXXXXXXXXXXXXX'
  }
};
```

---

## 🗄️ Banco de Leads (Supabase) e e-mail de aviso

Fluxo: formulário → `POST /api/leads` (Vercel Function) → valida → salva no **Supabase** (fonte oficial) → avisa por e-mail via **Resend**.
O e-mail é só aviso: se falhar, o lead continua salvo.

### Configuração (uma vez)
1. **Supabase** (região *South America – São Paulo*): crie o projeto e rode `supabase/schema.sql` no *SQL Editor*.
2. **Resend**: crie a conta e verifique o domínio (de preferência um subdomínio, ex.: `envio.clima16.com.br`, para não interferir no e-mail `contato@`).
3. **Vercel → Settings → Environment Variables** (Production): cadastre as variáveis do arquivo `.env.example`:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `LEAD_NOTIFY_TO`, `LEAD_FROM`, `IP_HASH_SALT`.
   Depois faça **Redeploy**. Nunca coloque chaves no código nem no GitHub.

### Comandos
* `npm run build` — valida o código e gera a pasta `dist/` (é o que a Vercel publica).
* `npm test` — testa a função `/api/leads` com Supabase/Resend simulados (sem rede).
* Para testar a API localmente use `npx vercel dev` (o `python -m http.server` não executa `/api`).

### Observações
* Telefone repetido em 24h entra com status `duplicado` (sem e-mail). Honeypot e limite de 10 envios/hora por IP (guardado só como hash).
* O `/admin` atual ainda lê dados do navegador. O painel com login (Supabase Auth) é a próxima etapa.

---

## 🎯 Estrutura de Rotas e Páginas

* **`#/`** - Página Inicial de Alta Conversão (Hero 55/45, Formulário em 5 Etapas, Como Funciona, Serviços, Benefícios, FAQ, Chamada para Profissionais).
* **`#/instalacao-ar-condicionado-ribeirao-preto`** - Landing Page dedicada de Instalação.
* **`#/manutencao-ar-condicionado-ribeirao-preto`** - Landing Page de Manutenção e Reparos.
* **`#/limpeza-ar-condicionado-ribeirao-preto`** - Landing Page de Limpeza e Higienização antibacteriana.
* **`#/ar-condicionado-nao-gela-ribeirao-preto`** - Landing Page para aparelhos que não refrigeram.
* **`#/como-funciona`** - Página explicativa do fluxo do marketplace.
* **`#/para-profissionais`** - Portal e cadastro de interesse para técnicos e empresas parceiras.
* **`#/blog`** - 8 Artigos práticos e guias técnicos com CTAs de conversão.
* **`#/solicitacao-recebida`** - Tela de confirmação e resumo com disparo de conversão.
* **`#/politica-de-privacidade`** - Política de Privacidade aderente à LGPD (Lei nº 13.709/2018).
* **`#/termos-de-uso`** - Termos de Uso com transparência sobre o modelo de intermediação.
* **`#/admin`** - Painel Administrativo de Gestão de Leads com métricas, status, atribuição de parceiros e **Exportação para CSV**.

---

## 📊 Eventos de Rastreamento Pré-configurados

* `form_start`
* `form_step_1`
* `form_step_2`
* `form_step_3`
* `form_step_4`
* `form_complete`
* `whatsapp_click`
* `professional_signup`
* `cta_click`
* Captura automática de `utm_source`, `utm_medium`, `utm_campaign`, `gclid`, `fbclid` e dispositivo.

---

## 🎨 Identidade Visual
* **Azul Escuro / Navy:** `#092B55`
* **Azul Principal:** `#087DE1`
* **Cyan:** `#16C6EA`
* **Turquesa:** `#18D4C3`
* **Fundo:** `#F7F9FC`
* **Fonte:** Inter
