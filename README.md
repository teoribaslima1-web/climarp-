# ClimaRP - Plataforma Local de Orçamentos de Ar-Condicionado (Ribeirão Preto – SP)

O **ClimaRP** é uma plataforma moderna, rápida, responsiva e de alta conversão para cotação de serviços de climatização (instalação, manutenção, limpeza/higienização, reparos de vazamento e recarga de gás) em Ribeirão Preto – SP.

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
    name: 'ClimaRP',
    city: 'Ribeirão Preto',
    state: 'SP',
    // Altere para o seu número de WhatsApp comercial real (DDI + DDD + Número)
    whatsappNumber: '5516999999999', 
    emailContact: 'contato@climarp.com.br'
  },
  analytics: {
    gtmId: 'GTM-XXXXXXX',
    ga4Id: 'G-XXXXXXXXXX',
    metaPixelId: 'XXXXXXXXXXXXXXX'
  }
};
```

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
