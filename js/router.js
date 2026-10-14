/**
 * Clima16 - Client-side Router (URLs reais via History API; links antigos com #/ são convertidos)
 * Handles dynamic route rendering, SEO meta titles/descriptions, and history navigation.
 */
import { renderHomeView, initHomeEvents } from './views/home.js';
import { renderServicePageView, initServicePageEvents } from './views/service-page.js';
import { renderBlogView } from './views/blog.js';
import { renderPartnersView, initPartnersEvents } from './views/partners.js';
import { renderConfirmationView, initConfirmationEvents } from './views/confirmation.js';
import { renderBtuCalculatorView, initBtuCalculatorView } from './views/btu-calculator.js';
import { renderPrivacyPolicyView, renderTermsView } from './views/legal.js';
import { renderAdminView, initAdminEvents } from './views/admin.js';
import { renderPartnerPortalView, initPartnerPortalEvents } from './views/partner-portal.js';
import { renderNotFoundView } from './views/not-found.js';
import { CONFIG } from './config.js';
import { analytics } from './analytics.js';
import { BLOG_POSTS } from './blog-data.js';

const ROUTE_META = {
  '/': {
    title: 'Ar-Condicionado em Ribeirão Preto | Instalação e Manutenção | Clima16',
    description: 'Solicite orçamento para instalação, manutenção, limpeza e serviços de ar-condicionado em Ribeirão Preto. Encontre profissionais da região pelo Clima16.'
  },
  '/instalacao-ar-condicionado-ribeirao-preto': {
    title: 'Instalação de Ar-Condicionado em Ribeirão Preto | Orçamento Grátis | Clima16',
    description: 'Encontre profissionais para instalação de ar-condicionado split em Ribeirão Preto. Compare orçamentos sem compromisso para casas, apartamentos e comércios.'
  },
  '/manutencao-ar-condicionado-ribeirao-preto': {
    title: 'Manutenção e Conserto de Ar-Condicionado em Ribeirão Preto | Clima16',
    description: 'Serviços de manutenção preventiva e corretiva para ar-condicionado em Ribeirão Preto. Diagnóstico de ruídos, placas e falhas.'
  },
  '/limpeza-ar-condicionado-ribeirao-preto': {
    title: 'Limpeza e Higienização de Ar-Condicionado em Ribeirão Preto | Clima16',
    description: 'Higienização profunda, remoção de fungos, ácaros e bactérias do seu ar-condicionado em Ribeirão Preto. Melhore a qualidade do ar.'
  },
  '/ar-condicionado-nao-gela-ribeirao-preto': {
    title: 'Ar-Condicionado Não Gela em Ribeirão Preto? | Orçamento de Reparo | Clima16',
    description: 'Seu ar-condicionado liga mas sopra ar morno? Encontre especialistas em teste de capacitor, sensores e recarga de gás em Ribeirão Preto.'
  },
  '/vazamento-gotejamento-ar-condicionado-ribeirao-preto': {
    title: 'Vazamento e Gotejamento de Ar-Condicionado em Ribeirão Preto | Clima16',
    description: 'Ar-condicionado pingando ou com dreno entupido? Solicite orçamento para conserto de vazamentos e gotejamento em Ribeirão Preto.'
  },
  '/recarga-avaliacao-gas-ar-condicionado-ribeirao-preto': {
    title: 'Recarga e Avaliação de Gás de Ar-Condicionado em Ribeirão Preto | Clima16',
    description: 'Avaliação técnica e recarga de gás de ar-condicionado em Ribeirão Preto, com teste de vazamento e medição adequada.'
  },
  '/para-profissionais': {
    title: 'Seja Parceiro Clima16 | Oportunidades em Ar-Condicionado em Ribeirão Preto',
    description: 'Cadastre-se como técnico ou empresa de climatização parceira do Clima16 e receba solicitações de clientes em Ribeirão Preto e região.'
  },
  '/calculadora-de-btus': {
    title: 'Calculadora de BTUs para Ar-Condicionado | Ribeirão Preto | Clima16',
    description: 'Calcule a potência ideal em BTUs para o seu ambiente considerando m², sol, pessoas e aparelhos. Peça orçamento em Ribeirão Preto já com o aparelho certo.'
  },
  '/como-funciona': {
    title: 'Como Funciona o Clima16 | Cotação de Climatização em Ribeirão Preto',
    description: 'Entenda o passo a passo simples para solicitar orçamentos gratuitos para seu ar-condicionado em Ribeirão Preto.'
  },
  '/blog': {
    title: 'Blog Clima16 | Dicas de Ar-Condicionado, BTUs e Climatização em Ribeirão Preto',
    description: 'Guias práticos sobre dimensionamento de BTUs, economia de energia, split inverter e manutenção periódica em Ribeirão Preto.'
  },
  '/solicitacao-recebida': {
    title: 'Solicitação Recebida com Sucesso | Clima16 Ribeirão Preto',
    description: 'Sua solicitação de orçamento foi recebida pelo Clima16 e será encaminhada a profissionais da região.'
  },
  '/politica-de-privacidade': {
    title: 'Política de Privacidade | Clima16 Ribeirão Preto',
    description: 'Informações sobre coleta, tratamento de dados e conformidade com a LGPD no Clima16.'
  },
  '/termos-de-uso': {
    title: 'Termos de Uso | Clima16 Ribeirão Preto',
    description: 'Termos e condições de uso da plataforma local de orçamentos Clima16.'
  },
  '/parceiro': {
    title: 'Área do Parceiro | Clima16',
    description: 'Área restrita para parceiros do Clima16 acompanharem os pedidos de orçamento encaminhados.'
  },
  '/admin': {
    title: 'Painel Administrativo | Gestão de Leads Clima16',
    description: 'Painel interno de controle de leads e parceiros do Clima16.'
  }
};

export class Router {
  constructor(appContainer) {
    this.appContainer = appContainer;
    window.addEventListener('popstate', () => this.handleRoute());
    // Links antigos (#/rota) e edição manual do hash viram URLs reais
    window.addEventListener('hashchange', () => {
      if (this.migrateLegacyHash()) this.handleRoute();
    });
    // Links internos (<a href="/rota">) navegam sem recarregar a página
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('/') || href.startsWith('//')) return;
      e.preventDefault();
      this.navigate(href);
    });
    window.clima16Navigate = (path) => this.navigate(path);
  }

  /** Converte #/rota em /rota (mantém compatibilidade com links antigos). Retorna true se converteu. */
  migrateLegacyHash() {
    const hash = window.location.hash || '';
    if (!hash || hash === '#') return false;
    const target = hash.replace(/^#/, '');
    const path = target.startsWith('/') ? target : `/${target}`;
    history.replaceState(null, '', path + window.location.search);
    return true;
  }

  navigate(path) {
    const url = new URL(path, window.location.origin);
    const next = url.pathname + url.search;
    if (next !== window.location.pathname + window.location.search) {
      history.pushState(null, '', next);
    }
    this.handleRoute();
  }

  init() {
    this.migrateLegacyHash();
    this.handleRoute();
  }

  handleRoute() {
    this.renderRoute();
    // Fade suave ao trocar de página (só opacidade; respeita prefers-reduced-motion no CSS)
    const c = this.appContainer;
    c.classList.remove('view-enter');
    void c.offsetWidth;
    c.classList.add('view-enter');
  }

  renderRoute() {
    const cleanHash = (window.location.pathname.replace(/\/+$/, '') || '/');

    // Handle anchor jump if on home (aceita #/como-funciona e #como-funciona)
    const anchorKey = cleanHash.replace(/^\//, '');
    if (['formulario', 'servicos', 'como-funciona', 'faq', 'cobertura', 'calculadora'].includes(anchorKey)) {
      this.updateMeta('/');
      if (!this.appContainer.querySelector('#orcamento-form')) {
        this.appContainer.innerHTML = renderHomeView();
        initHomeEvents();
      }
      const target = document.getElementById(anchorKey === 'formulario' ? 'orcamento-form' : `${anchorKey}-section`) || document.getElementById(anchorKey);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
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
      const post = BLOG_POSTS.find((p) => p.id === postId);
      if (post) {
        this.updateMeta('/blog', { meta: { title: `${post.title} | Clima16`, description: post.summary }, canonical: `/blog/${post.id}` });
      } else {
        this.updateMeta('/blog', { noindex: true });
      }
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
          initConfirmationEvents();
        });
        break;

      case '/calculadora-de-btus':
      case 'calculadora-de-btus':
        this.renderView('/calculadora-de-btus', () => {
          this.appContainer.innerHTML = renderBtuCalculatorView();
          initBtuCalculatorView();
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

      case '/parceiro':
      case 'parceiro':
        this.renderView('/parceiro', () => {
          this.appContainer.innerHTML = renderPartnerPortalView();
          initPartnerPortalEvents();
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
        this.updateMeta('/', { noindex: true });
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

  updateMeta(routePath, extra = {}) {
    const meta = extra.meta || ROUTE_META[routePath] || ROUTE_META['/'];
    document.title = meta.title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', meta.description);

    const canonicalPath = extra.canonical || routePath;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `https://clima16.com.br${canonicalPath === '/' ? '/' : canonicalPath}`);

    const noindex = ['/admin', '/parceiro', '/solicitacao-recebida'].includes(routePath) || extra.noindex;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');
  }
}
