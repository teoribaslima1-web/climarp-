/**
 * ClimaRP - Header Component
 * Sticky, modern navigation with desktop links, mobile hamburger drawer, and conversion CTA.
 */
import { CONFIG } from '../config.js';
import { analytics } from '../analytics.js';

export function renderHeader() {
  return `
    <header id="main-header" class="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          <!-- Brand Logo -->
          <a href="#/" class="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-blue rounded-lg p-1">
            <img src="assets/logo.png" alt="ClimaRP Logo" class="h-12 w-auto object-contain transform group-hover:scale-105 transition-transform duration-200" />
            <div class="flex flex-col">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Ribeirão Preto</span>
            </div>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
            <a href="#/" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-blue rounded-md transition-colors">Início</a>
            
            <!-- Services Dropdown / Link -->
            <div class="relative group">
              <a href="#/servicos" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-blue rounded-md flex items-center gap-1 transition-colors">
                Serviços
                <svg class="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </a>
              <!-- Submenu -->
              <div class="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 z-50">
                <a href="#/instalacao-ar-condicionado-ribeirao-preto" class="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-blue rounded-lg">Instalação de Ar-Condicionado</a>
                <a href="#/manutencao-ar-condicionado-ribeirao-preto" class="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-blue rounded-lg">Manutenção & Reparos</a>
                <a href="#/limpeza-ar-condicionado-ribeirao-preto" class="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-blue rounded-lg">Limpeza & Higienização</a>
                <a href="#/ar-condicionado-nao-gela-ribeirao-preto" class="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-blue rounded-lg">Ar Não Está Gelando</a>
              </div>
            </div>

            <a href="#/como-funciona" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-blue rounded-md transition-colors">Como funciona</a>
            <a href="#/faq" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-blue rounded-md transition-colors">Dúvidas</a>
            <a href="#/blog" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-blue rounded-md transition-colors">Blog</a>
            <a href="#/para-profissionais" class="px-3 py-2 text-sm font-semibold text-brand-blue bg-blue-50/70 hover:bg-blue-100/80 rounded-md transition-colors">Para profissionais</a>
          </nav>

          <!-- Action CTA & Direct WhatsApp -->
          <div class="hidden md:flex items-center gap-3">
            <a href="https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(CONFIG.brand.whatsappDefaultMessage)}" target="_blank" rel="noopener noreferrer" onclick="window.climarpAnalytics?.track('whatsapp_click', { origin: 'header_nav' })" class="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all" title="Falar no WhatsApp">
              <svg class="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Falar no WhatsApp</span>
            </a>
            
            <button onclick="window.location.hash='#formulario'; document.getElementById('orcamento-form')?.scrollIntoView({behavior:'smooth'});" class="gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all duration-200">
              Solicitar orçamento
            </button>
          </div>

          <!-- Mobile Hamburger Button -->
          <div class="flex items-center md:hidden">
            <button id="mobile-menu-btn" aria-label="Abrir menu" class="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <svg id="hamburger-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Drawer Menu -->
      <div id="mobile-menu" class="hidden md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
        <div class="flex flex-col space-y-2">
          <a href="#/" class="mobile-nav-link px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg">Início</a>
          <a href="#/instalacao-ar-condicionado-ribeirao-preto" class="mobile-nav-link px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Instalação de Ar</a>
          <a href="#/manutencao-ar-condicionado-ribeirao-preto" class="mobile-nav-link px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Manutenção</a>
          <a href="#/limpeza-ar-condicionado-ribeirao-preto" class="mobile-nav-link px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Limpeza & Higienização</a>
          <a href="#/ar-condicionado-nao-gela-ribeirao-preto" class="mobile-nav-link px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Ar Não Gela</a>
          <a href="#/como-funciona" class="mobile-nav-link px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg">Como funciona</a>
          <a href="#/faq" class="mobile-nav-link px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg">Dúvidas</a>
          <a href="#/blog" class="mobile-nav-link px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg">Blog & Dicas</a>
          <a href="#/para-profissionais" class="mobile-nav-link px-3 py-2.5 text-base font-semibold text-brand-blue bg-blue-50 rounded-lg">Para Profissionais e Técnicos</a>
        </div>
        
        <div class="pt-2 border-t border-slate-100 space-y-2">
          <a href="https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(CONFIG.brand.whatsappDefaultMessage)}" target="_blank" rel="noopener noreferrer" onclick="window.climarpAnalytics?.track('whatsapp_click', { origin: 'mobile_drawer' })" class="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl shadow-sm text-center">
            <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Falar pelo WhatsApp</span>
          </a>
          <button onclick="window.location.hash='#formulario'; document.getElementById('mobile-menu').classList.add('hidden'); document.getElementById('orcamento-form')?.scrollIntoView({behavior:'smooth'});" class="w-full gradient-brand text-white text-base font-semibold py-3 rounded-xl shadow-md text-center">
            Solicitar orçamento
          </button>
        </div>
      </div>
    </header>
  `;
}

export function initHeaderEvents() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  if (btn && menu) {
    btn.onclick = () => {
      const isClosed = menu.classList.contains('hidden');
      if (isClosed) {
        menu.classList.remove('hidden');
        hamburgerIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
      } else {
        menu.classList.add('hidden');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      }
    };

    // Close when clicking links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      });
    });
  }
}
