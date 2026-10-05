/**
 * ClimaRP - Client-side Hash Router
 * Handles dynamic route rendering, SEO meta titles/descriptions, and history navigation.
 */
import { renderHomeView, initHomeEvents } from './views/home.js';
import { renderServicePageView, initServicePageEvents } from './views/service-page.js';
import { renderBlogView } from './views/blog.js';
import { renderPartnersView, initPartnersEvents } from './views/partners.js';
import { renderConfirmationView } from './views/confirmation.js';
import { renderPrivacyPolicyView, renderTermsView } from './views/legal.js';
import { renderAdminView, initAdminEvents } from './views/admin.js';
import { renderNotFoundView } from './views/not-found.js';
import { CONFIG } from './config.js';
import { analytics } from './analytics.js';

const ROUTE_META = {
  '/': {
    title: 'Ar-Condicionado em Ribeirão Preto | Instalação e Manutenção | ClimaRP',
    description: 'Solicite orçamento para instalação, manutenção, limpeza e serviços de ar-condicionado em Ribeirão Preto. Encontre profissionais da região pelo ClimaRP.'
  },
  '/instalacao-ar-condicionado-ribeirao-preto': {
    title: 'Instalação de Ar-Condicionado em Ribeirão Preto | Orçamento Grátis | ClimaRP',
    description: 'Encontre profissionais para instalação de ar-condicionado split em Ribeirão Preto. Compare orçamentos sem compromisso para casas, apartamentos e comércios.'
  },
  '/manutencao-ar-condicionado-ribeirao-preto': {
    title: 'Manutenção e Conserto de Ar-Condicionado em Ribeirão Preto | ClimaRP',
    description: 'Serviços de manutenção preventiva e corretiva para ar-condicionado em Ribeirão Preto. Diagnóstico de ruídos, placas e falhas.'
  },
  '/limpeza-ar-condicionado-ribeirao-preto': {
    title: 'Limpeza e Higienização de Ar-Condicionado em Ribeirão Preto | ClimaRP',
    description: 'Higienização profunda, remoção de fungos, ácaros e bactérias do seu ar-condicionado em Ribeirão Preto. Melhore a qualidade do ar.'
  },
  '/ar-condicionado-nao-gela-ribeirao-preto': {
    title: 'Ar-Condicionado Não Gela em Ribeirão Preto? | Orçamento de Reparo | ClimaRP',
    description: 'Seu ar-condicionado liga mas sopra ar morno? Encontre especialistas em teste de capacitor, sensores e recarga de gás em Ribeirão Preto.'
  },
  '/para-profissionais': {
    title: 'Seja Parceiro ClimaRP | Oportunidades em Ar-Condicionado em Ribeirão Preto',
    description: 'Cadastre-se como técnico ou empresa de climatização parceira do ClimaRP e receba solicitações de clientes em Ribeirão Preto e região.'
  },
  '/como-funciona': {
    title: 'Como Funciona o ClimaRP | Cotação de Climatização em Ribeirão Preto',
    description: 'Entenda o passo a passo simples para solicitar orçamentos gratuitos para seu ar-condicionado em Ribeirão Preto.'
  },
  '/blog': {
    title: 'Blog ClimaRP | Dicas de Ar-Condicionado, BTUs e Climatização em Ribeirão Preto',
    description: 'Guias práticos sobre dimensionamento de BTUs, economia de energia, split inverter e manutenção periódica em Ribeirão Preto.'
  },
  '/solicitacao-recebida': {
    title: 'Solicitação Recebida com Sucesso | ClimaRP Ribeirão Preto',
    description: 'Sua solicitação de orçamento foi recebida pelo ClimaRP e será encaminhada a profissionais da região.'
  },
  '/politica-de-privacidade': {
    title: 'Política de Privacidade | ClimaRP Ribeirão Preto',
    description: 'Informações sobre coleta, tratamento de dados e conformidade com a LGPD no ClimaRP.'
  },
  '/termos-de-uso': {
    title: 'Termos de Uso | ClimaRP Ribeirão Preto',
    description: 'Termos e condições de uso da plataforma local de orçamentos ClimaRP.'
  },
  '/admin': {
    title: 'Painel Administrativo | Gestão de Leads ClimaRP',
    description: 'Painel interno de controle de leads e parceiros do ClimaRP.'
  }
};

export class Router {
  constructor(appContainer) {
    this.appContainer = appContainer;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    this.handleRoute();
  }

  handleRoute() {
    const rawHash = window.location.hash || '#/';
    const cleanHash = rawHash.split('?')[0].replace(/^#/, '') || '/';
    
    // Handle anchor jump if on home
    if (cleanHash === 'formulario' || cleanHash === 'servicos' || cleanHash === 'como-funciona' || cleanHash === 'faq') {
      this.renderView('/', () => {
        const el = document.getElementById(cleanHash === 'formulario' ? 'orcamento-form' : `${cleanHash}-section`) || document.getElementById(cleanHash);
        el?.scrollIntoView({ behavior: 'smooth' });
      });
      return;
    }

    // Check service pages
    const serviceMatch = CONFIG.services.find(s => cleanHash === `/${s.slug}` || cleanHash === s.slug);
    if (serviceMatch) {
      this.updateMeta(`/${serviceMatch.slug}`);
      this.appContainer.innerHTML = renderServicePageView(serviceMatch.slug);
      initServicePageEvents(serviceMatch.slug);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // Check blog routes
    if (cleanHash === '/blog' || cleanHash === 'blog') {
      this.updateMeta('/blog');
      this.appContainer.innerHTML = renderBlogView();
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (cleanHash.startsWith('/blog/')) {
      const postId = cleanHash.replace('/blog/', '');
      this.updateMeta('/blog');
      this.appContainer.innerHTML = renderBlogView(postId);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // Direct route matching
    switch (cleanHash) {
      case '/':
      case '':
        this.renderView('/', () => {
          this.appContainer.innerHTML = renderHomeView();
          initHomeEvents();
        });
        break;

      case '/para-profissionais':
      case 'para-profissionais':
        this.renderView('/para-profissionais', () => {
          this.appContainer.innerHTML = renderPartnersView();
          initPartnersEvents();
        });
        break;

      case '/solicitacao-recebida':
      case 'solicitacao-recebida':
        this.renderView('/solicitacao-recebida', () => {
          this.appContainer.innerHTML = renderConfirmationView();
        });
        break;

      case '/politica-de-privacidade':
      case 'politica-de-privacidade':
        this.renderView('/politica-de-privacidade', () => {
          this.appContainer.innerHTML = renderPrivacyPolicyView();
        });
        break;

      case '/termos-de-uso':
      case 'termos-de-uso':
        this.renderView('/termos-de-uso', () => {
          this.appContainer.innerHTML = renderTermsView();
        });
        break;

      case '/admin':
      case 'admin':
        this.renderView('/admin', () => {
          this.appContainer.innerHTML = renderAdminView();
          initAdminEvents();
        });
        break;

      default:
        this.updateMeta('/');
        this.appContainer.innerHTML = renderNotFoundView();
        window.scrollTo({ top: 0, behavior: 'instant' });
        break;
    }
  }

  renderView(routePath, renderFn) {
    this.updateMeta(routePath);
    renderFn();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  updateMeta(routePath) {
    const meta = ROUTE_META[routePath] || ROUTE_META['/'];
    document.title = meta.title;

    let descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute('content', meta.description);
    }
  }
}
