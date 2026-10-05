/**
 * Clima16 - Dedicated Service Landing Page View (Local SEO Optimized)
 * Generates tailored pages for each core service in Ribeirão Preto.
 */
import { CONFIG } from '../config.js';
import { renderQuoteForm, initQuoteFormEvents } from '../components/quote-form.js';
import { analytics } from '../analytics.js';

export function renderServicePageView(slug) {
  const service = CONFIG.services.find(s => s.slug === slug) || CONFIG.services[0];
  const whatsappUrl = `https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(`Olá! Gostaria de um orçamento para ${service.name} em Ribeirão Preto.`)}`;

  return `
    <div class="bg-slate-50 min-h-screen">
      
      <!-- Service Page Hero Header -->
      <section class="bg-gradient-to-b from-white to-slate-100/70 border-b border-slate-200/80 pt-10 pb-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <nav class="flex items-center justify-center space-x-2 text-xs text-slate-500 mb-6">
            <a href="#/" class="hover:text-brand-blue">Início</a>
            <span>/</span>
            <a href="#/servicos" class="hover:text-brand-blue">Serviços</a>
            <span>/</span>
            <span class="text-navy font-semibold">${service.shortTitle}</span>
          </nav>

          <span class="inline-block text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full mb-4">
            Ribeirão Preto – SP • Atendimento Local
          </span>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy tracking-tight max-w-3xl mx-auto">
            ${service.name} em <span class="text-gradient">Ribeirão Preto</span>
          </h1>

          <p class="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-4 leading-relaxed">
            ${service.description}
          </p>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onclick="document.getElementById('orcamento-form')?.scrollIntoView({behavior:'smooth'});" class="gradient-brand text-white font-bold px-7 py-3.5 rounded-xl shadow-lg hover:brightness-105 active:scale-95 transition-all text-sm sm:text-base">
              Solicitar orçamento para este serviço
            </button>
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-sm text-sm sm:text-base transition-all flex items-center gap-2">
              <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Orçar via WhatsApp</span>
            </a>
          </div>

        </div>
      </section>

      <!-- Content Breakdown -->
      <section class="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          <!-- Situations Card -->
          <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-subtle">
            <div class="flex items-center gap-3 mb-5">
              <div class="p-2 bg-blue-50 text-brand-blue rounded-xl">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
              <h2 class="text-lg font-bold text-navy">Situações frequentes para solicitar</h2>
            </div>
            <ul class="space-y-3 text-sm text-slate-600">
              ${service.situations.map(s => `
                <li class="flex items-start gap-2">
                  <span class="text-brand-blue font-bold mt-0.5">•</span>
                  <span>${s}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Equipment Types -->
          <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-subtle">
            <div class="flex items-center gap-3 mb-5">
              <div class="p-2 bg-cyan-50 text-brand-cyan rounded-xl">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h2 class="text-lg font-bold text-navy">Tipos de aparelhos atendidos</h2>
            </div>
            <ul class="space-y-3 text-sm text-slate-600">
              ${service.equipmentTypes.map(eq => `
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-brand-blue shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  <span>${eq}</span>
                </li>
              `).join('')}
            </ul>
          </div>

        </div>

        <!-- Service Specific FAQ -->
        <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-subtle mb-16">
          <h2 class="text-xl font-bold text-navy mb-6">Perguntas sobre ${service.name} em Ribeirão Preto</h2>
          <div class="space-y-4">
            ${service.faqs.map(faq => `
              <div class="border-b border-slate-100 pb-4">
                <h3 class="font-bold text-slate-800 text-base mb-1">${faq.q}</h3>
                <p class="text-sm text-slate-600 leading-relaxed">${faq.a}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Embedded Quote Form -->
        <div class="mt-12">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-navy">Peça seu orçamento para ${service.shortTitle}</h2>
            <p class="text-sm text-slate-500">Conectamos sua solicitação a parceiros em Ribeirão Preto</p>
          </div>
          ${renderQuoteForm(service.name)}
        </div>

      </section>

    </div>
  `;
}

export function initServicePageEvents(slug) {
  const service = CONFIG.services.find(s => s.slug === slug) || CONFIG.services[0];
  initQuoteFormEvents(service.name);
}
