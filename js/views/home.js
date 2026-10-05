/**
 * Clima16 - Home Page View
 * High-converting, modern, tech-enabled landing page for Ribeirão Preto HVAC quote requests.
 */
import { CONFIG } from '../config.js';
import { renderQuoteForm, initQuoteFormEvents } from '../components/quote-form.js';
import { renderFAQ, initFAQEvents } from '../components/faq.js';
import { renderPartnerModal, initPartnerModalEvents } from '../components/partner-modal.js';
import { analytics } from '../analytics.js';

export function renderHomeView() {
  const whatsappUrl = `https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(CONFIG.brand.whatsappDefaultMessage)}`;

  return `
    <!-- ================= HERO SECTION ================= -->
    <section class="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/60">
      
      <!-- Ambient Background Glows -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-10 -mb-20 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <!-- Left Column (55%) -->
          <div class="lg:col-span-7 text-left space-y-6">
            
            <!-- Regional Badge -->
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-navy">
              <span class="flex h-2 w-2 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
              </span>
              Plataforma Local • Ribeirão Preto – SP
            </div>

            <!-- Main Heading -->
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy leading-tight tracking-tight">
              Ar-condicionado em <br class="hidden sm:inline" />
              <span class="text-gradient">Ribeirão Preto</span> sem complicação.
            </h1>

            <!-- Subtitle -->
            <p class="text-base sm:text-lg text-muted-rp leading-relaxed max-w-2xl font-normal">
              Solicite seu orçamento e encontre profissionais da região para instalação, manutenção, limpeza e outros serviços de climatização.
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button onclick="document.getElementById('orcamento-form')?.scrollIntoView({behavior:'smooth'});" class="gradient-brand text-white text-base font-bold px-7 py-4 rounded-xl shadow-lg hover:shadow-xl hover:brightness-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2">
                <span>Solicitar orçamento grátis</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </button>

              <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" onclick="window.clima16Analytics?.track('whatsapp_click', { origin: 'hero_button' })" class="bg-emerald-500 hover:bg-emerald-600 text-white text-base font-bold px-6 py-4 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2" title="Falar no WhatsApp">
                <!-- WhatsApp SVG Icon -->
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Falar pelo WhatsApp</span>
              </a>
            </div>

            <!-- Trust Indicators -->
            <div class="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-slate-600">
              <span class="flex items-center gap-1.5 text-emerald-700">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                Solicitação gratuita
              </span>
              <span class="flex items-center gap-1.5 text-slate-700">
                <svg class="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                Atendimento em Ribeirão Preto
              </span>
              <span class="flex items-center gap-1.5 text-slate-700">
                <svg class="w-4 h-4 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                Sem compromisso
              </span>
            </div>

          </div>

          <!-- Right Column (45%) - Minimalist Modern Visual Illustration -->
          <div class="lg:col-span-5 flex justify-center">
            <div class="relative w-full max-w-md">
              
              <!-- Tech Card with Air Conditioning Flow Illustration -->
              <div class="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden">
                
                <!-- Ambient Top Pill -->
                <div class="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div class="flex items-center gap-3">
                    <img src="assets/logo-wordmark.png" alt="Clima16" class="h-8 w-auto object-contain" />
                    <div>
                      <div class="text-xs font-bold text-navy">Marketplace de Climatização</div>
                      <div class="text-[11px] text-slate-400">Ribeirão Preto & Região</div>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-full flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Online
                  </span>
                </div>

                <!-- Minimalist Vector Split AC Unit -->
                <div class="my-6 relative py-4 flex flex-col items-center">
                  <!-- Modern Split AC Appliance Body -->
                  <div class="w-full bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-slate-200/80 rounded-2xl p-4 shadow-md relative z-20">
                    <div class="flex items-center justify-between mb-2">
                      <div class="h-1.5 w-12 bg-slate-300 rounded-full"></div>
                      <!-- Digital Display -->
                      <div class="px-2 py-0.5 bg-navy rounded-md text-[11px] font-mono font-bold text-cyan-300 tracking-wider">
                        22°C • ECO
                      </div>
                    </div>
                    <!-- Air Output Vent with glow line -->
                    <div class="h-2 w-full bg-slate-200 rounded-full mt-3 overflow-hidden relative">
                      <div class="h-full w-2/3 gradient-brand rounded-full mx-auto"></div>
                    </div>
                  </div>

                  <!-- Dynamic Clean Air Wave Graphics -->
                  <div class="w-full mt-4 space-y-2 relative z-10">
                    <div class="h-2 bg-gradient-to-r from-cyan-400 via-sky-300 to-transparent rounded-full w-full animate-airwave opacity-80 blur-[0.5px]"></div>
                    <div class="h-2 bg-gradient-to-r from-brand-blue via-cyan-300 to-transparent rounded-full w-5/6 mx-auto animate-airwave opacity-60" style="animation-delay: 0.5s;"></div>
                    <div class="h-2 bg-gradient-to-r from-teal-400 via-sky-200 to-transparent rounded-full w-4/6 mx-auto animate-airwave opacity-40" style="animation-delay: 1s;"></div>
                  </div>
                </div>

                <!-- Fast Features Pills in visual -->
                <div class="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-lg bg-blue-100 text-brand-blue flex items-center justify-center text-xs font-bold">1</div>
                    <span class="font-medium text-slate-700">Faça o pedido</span>
                  </div>
                  <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-lg bg-cyan-100 text-brand-cyan flex items-center justify-center text-xs font-bold">2</div>
                    <span class="font-medium text-slate-700">Receba contatos</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>


    <!-- ================= FORM SECTION ================= -->
    <section id="formulario-section" class="py-12 sm:py-20 bg-slate-50 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${renderQuoteForm()}
      </div>
    </section>


    <!-- ================= COMO FUNCIONA ================= -->
    <section id="como-funciona" class="py-16 sm:py-24 bg-white border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full">
            Processo Simples
          </span>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mt-3">
            Resolver seu ar-condicionado ficou mais fácil
          </h2>
          <p class="text-sm sm:text-base text-muted-rp mt-2">
            Elimine o trabalho de procurar e ligar para dezenas de técnicos individualmente.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <!-- Step 1 -->
          <div class="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-8 text-center relative group hover:bg-white hover:shadow-card-hover transition-all">
            <div class="w-14 h-14 rounded-2xl bg-blue-100 text-brand-blue flex items-center justify-center mx-auto mb-6 text-xl font-extrabold group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">Conte o que precisa</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              Selecione o serviço e informe alguns detalhes do seu aparelho e imóvel em menos de 1 minuto.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-8 text-center relative group hover:bg-white hover:shadow-card-hover transition-all">
            <div class="w-14 h-14 rounded-2xl bg-cyan-100 text-brand-blue flex items-center justify-center mx-auto mb-6 text-xl font-extrabold group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">Conectamos sua solicitação</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              Seu pedido pode ser encaminhado para profissionais da região capazes de realizar o serviço no seu bairro.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-8 text-center relative group hover:bg-white hover:shadow-card-hover transition-all">
            <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6 text-xl font-extrabold group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">Compare e escolha</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              Converse com o profissional, esclareça suas dúvidas e decida livremente se deseja contratar.
            </p>
          </div>

        </div>

      </div>
    </section>


    <!-- ================= SERVIÇOS EM RIBEIRÃO PRETO ================= -->
    <section id="servicos" class="py-16 sm:py-24 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span class="text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full">
              Especialidades
            </span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mt-3">
              Serviços de ar-condicionado em Ribeirão Preto
            </h2>
          </div>
          <p class="text-sm text-muted-rp mt-2 md:mt-0 max-w-md">
            Seja residencial ou comercial, conectamos você aos serviços certos para o clima de RP.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          ${CONFIG.services.map(srv => `
            <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card-hover transition-all flex flex-col justify-between group">
              <div>
                <div class="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 class="text-lg font-bold text-navy mb-2">${srv.name}</h3>
                <p class="text-sm text-slate-600 leading-relaxed mb-6">${srv.description}</p>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a href="#/${srv.slug}" class="text-xs font-semibold text-slate-500 hover:text-navy flex items-center gap-1">
                  Saiba mais →
                </a>
                <button onclick="document.getElementById('orcamento-form')?.scrollIntoView({behavior:'smooth'});" class="gradient-brand text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all">
                  Pedir orçamento
                </button>
              </div>
            </div>
          `).join('')}

        </div>

      </div>
    </section>


    <!-- ================= BLOCO DE CONVERSÃO ================= -->
    <section class="py-16 sm:py-20 gradient-navy-dark text-white relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute inset-0 bg-[radial-gradient(#087DE1_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
          Precisa instalar ou consertar seu ar-condicionado?
        </h2>
        <p class="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-light">
          Conte o que precisa e solicite um orçamento sem compromisso com profissionais de Ribeirão Preto.
        </p>
        <button onclick="document.getElementById('orcamento-form')?.scrollIntoView({behavior:'smooth'});" class="gradient-brand text-white text-base sm:text-lg font-extrabold px-9 py-4 rounded-xl shadow-glow-blue hover:brightness-110 active:scale-95 transition-all">
          Quero solicitar orçamento
        </button>
      </div>
    </section>


    <!-- ================= BENEFÍCIOS ================= -->
    <section class="py-16 sm:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full">
            Vantagens Clima16
          </span>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mt-3">
            Por que usar o Clima16?
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- Benefit 1 -->
          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:border-blue-200 transition-all">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-navy mb-1">Fácil</h3>
            <p class="text-sm text-slate-600">Faça sua solicitação online em poucos passos, sem formulários complicados.</p>
          </div>

          <!-- Benefit 2 -->
          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:border-blue-200 transition-all">
            <div class="w-10 h-10 rounded-xl bg-cyan-100 text-brand-blue flex items-center justify-center mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-navy mb-1">Local</h3>
            <p class="text-sm text-slate-600">Foco inicialmente em Ribeirão Preto e nos bairros da sua região.</p>
          </div>

          <!-- Benefit 3 -->
          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:border-blue-200 transition-all">
            <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-navy mb-1">Rápido</h3>
            <p class="text-sm text-slate-600">Evite perder tempo ligando e procurando dezenas de prestadores individualmente.</p>
          </div>

          <!-- Benefit 4 -->
          <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:border-blue-200 transition-all">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-navy mb-1">Sem compromisso</h3>
            <p class="text-sm text-slate-600">Solicitar contato através da plataforma não obriga a contratação do serviço.</p>
          </div>

        </div>

      </div>
    </section>


    <!-- ================= ÁREA PARA PROFISSIONAIS ================= -->
    <section id="para-profissionais-section" class="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="bg-gradient-to-r from-navy to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div class="max-w-2xl text-left space-y-4">
            <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800">
              Oportunidade para Técnicos e Empresas
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Você trabalha com ar-condicionado em Ribeirão Preto?
            </h2>
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              O Clima16 conecta pessoas procurando serviços de climatização a profissionais e empresas da região. Cadastre seu interesse em receber oportunidades de atendimento.
            </p>
          </div>

          <div class="shrink-0 w-full sm:w-auto">
            <button class="open-partner-modal-btn w-full sm:w-auto bg-brand-cyan hover:bg-cyan-400 text-navy font-extrabold px-8 py-4 rounded-xl shadow-lg transition-all text-center">
              Quero ser parceiro
            </button>
          </div>

        </div>

      </div>
    </section>


    <!-- ================= FAQ SECTION ================= -->
    ${renderFAQ()}

    <!-- Partner Modal Component -->
    ${renderPartnerModal()}

    <!-- WhatsApp Floating Action Button (Desktop & Tablet) -->
    <div class="fixed bottom-6 right-6 z-40 hidden sm:block">
      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" onclick="window.clima16Analytics?.track('whatsapp_click', { origin: 'floating_fab' })" class="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-3.5 pl-4 pr-5 rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all group" aria-label="Pedir orçamento pelo WhatsApp">
        <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span class="text-sm">Pedir pelo WhatsApp</span>
      </a>
    </div>

    <!-- Mobile Sticky Conversion Bottom Bar -->
    <div class="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl flex items-center gap-2">
      <button onclick="document.getElementById('orcamento-form')?.scrollIntoView({behavior:'smooth'});" class="flex-1 gradient-brand text-white font-bold text-sm py-3 rounded-xl shadow text-center">
        Pedir orçamento
      </button>
      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" onclick="window.clima16Analytics?.track('whatsapp_click', { origin: 'mobile_bottom_bar' })" class="bg-emerald-500 text-white p-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shrink-0" aria-label="WhatsApp">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span class="text-xs font-bold">WhatsApp</span>
      </a>
    </div>
  `;
}

export function initHomeEvents() {
  initQuoteFormEvents();
  initFAQEvents();
  initPartnerModalEvents();
}
