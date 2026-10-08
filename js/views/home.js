/**
 * Clima16 - Home Page View
 * High-converting, modern, tech-enabled landing page for Ribeirão Preto HVAC quote requests.
 */
import { CONFIG } from '../config.js';
import { renderQuoteForm, initQuoteFormEvents } from '../components/quote-form.js';
import { renderFAQ, initFAQEvents } from '../components/faq.js';
import { renderPartnerModal, initPartnerModalEvents } from '../components/partner-modal.js';
import { analytics } from '../analytics.js';
import { renderBtuCalculator, initBtuCalculator } from '../components/btu-calculator.js';
import { initHeroThermometer } from '../components/hero-thermometer.js';
import { initQuoteTriggers } from '../prefill.js';
import { initReveal } from '../reveal.js';

const windHtml = (dark = false) => `
  <div class="vento-gelado${dark ? ' vento-escuro' : ''}" aria-hidden="true">
    <span class="neblina" style="--t:10%; --s:26s; --d:-6s"></span>
    <span class="neblina" style="--t:55%; --s:34s; --d:-20s"></span>
    <span class="fio" style="--t:14%; --w:240px; --s:9s;  --d:-1s"></span>
    <span class="fio fio-extra" style="--t:28%; --w:160px; --s:12s; --d:-4s"></span>
    <span class="fio" style="--t:42%; --w:300px; --s:10s; --d:-7s"></span>
    <span class="fio fio-extra" style="--t:56%; --w:200px; --s:13s; --d:-2s"></span>
    <span class="fio" style="--t:70%; --w:260px; --s:11s; --d:-9s"></span>
    <span class="fio fio-extra" style="--t:84%; --w:180px; --s:14s; --d:-5s"></span>
  </div>`;

const CHIP_LABELS = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  limpeza: 'Limpeza',
  nao_gela: 'Não gela',
  vazamento: 'Vazamento',
  gas: 'Gás'
};

const WAVE_PATH = 'M0 50 Q150 0 300 50 T600 50 T900 50 T1200 50 T1500 50 T1800 50 T2100 50 T2400 50 V100 H0 Z';
const waveLayer = (cls, fill, top) => `
  <div class="wave-layer ${cls}" style="top:${top}%">
    <svg viewBox="0 0 2400 100" preserveAspectRatio="none" aria-hidden="true"><path d="${WAVE_PATH}" fill="${fill}"/></svg>
  </div>`;

const TIMELINE_STEPS = [
  { n: 1, title: 'Pedido', text: 'Você conta o que precisa: serviço, imóvel e bairro, em menos de 1 minuto.' },
  { n: 2, title: 'Contato', text: 'A gente entra em contato, normalmente pelo WhatsApp, para confirmar os detalhes.' },
  { n: 3, title: 'Orçamentos comparados', text: 'Seu pedido pode ser encaminhado a profissionais da região para você comparar propostas.' },
  { n: 4, title: 'Serviço feito', text: 'Você escolhe livremente quem contratar e agenda. Sem compromisso até decidir.' }
];


export function renderHomeView() {
  const whatsappUrl = `https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(CONFIG.brand.whatsappDefaultMessage)}`;

  return `
    <!-- ================= HERO SECTION ================= -->
    <section class="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-6 pb-24 sm:pb-28 lg:pt-14 lg:pb-32 border-b border-slate-200/60">
      
      <!-- Ambient Background Glows -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-10 -mb-20 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>
      ${windHtml(false)}

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

            <!-- Service Chips: começar o orçamento sem rolar a página -->
            <div>
              <div class="text-xs font-semibold text-slate-500 mb-2">Escolha o serviço e comece agora:</div>
              <div class="flex flex-wrap gap-2" id="hero-service-chips">
                ${CONFIG.services.map(srv => `<button type="button" data-quote="${srv.id}" data-origin="hero_chip" class="service-chip">${CHIP_LABELS[srv.id] || srv.shortTitle}</button>`).join('')}
                <a href="#/calculadora-de-btus" class="service-chip border-dashed text-brand-blue">Calcular BTUs →</a>
              </div>
            </div>

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

          <!-- Right Column (45%) - Termômetro animado 32° → 16° -->
          <div class="lg:col-span-5 flex justify-center">
            <div class="relative w-full max-w-md">
              <div class="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden">

                <div class="flex items-center justify-between pb-5 border-b border-slate-100">
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

                <div class="flex items-stretch gap-5 pt-6">
                  <!-- Termômetro -->
                  <div class="flex flex-col items-center shrink-0" aria-hidden="true">
                    <div class="flex gap-2 h-44">
                      <div class="flex flex-col justify-between text-[10px] font-semibold text-slate-400 py-0.5 text-right leading-none">
                        <span>32°</span><span>28°</span><span>24°</span><span>20°</span><span class="text-brand-blue font-extrabold text-xs">16°</span>
                      </div>
                      <div class="thermo-tube"><div class="thermo-fill" id="thermo-fill" style="height:100%;background-color:hsl(15,90%,50%)"></div></div>
                    </div>
                    <div class="thermo-bulb" id="thermo-bulb" style="background-color:hsl(15,90%,50%)"></div>
                  </div>

                  <!-- Split + ar -->
                  <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <div class="bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-slate-200/80 rounded-2xl p-4 shadow-md">
                      <div class="flex items-center justify-between mb-2">
                        <div class="h-1.5 w-10 bg-slate-300 rounded-full"></div>
                        <div class="px-2 py-0.5 bg-navy rounded-md text-sm font-mono font-bold text-cyan-300 tracking-wider" id="thermo-display" aria-live="off">32°C</div>
                      </div>
                      <div class="h-2 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                        <div class="h-full w-2/3 gradient-brand rounded-full mx-auto"></div>
                      </div>
                    </div>
                    <div class="mt-4 space-y-2" aria-hidden="true">
                      <div class="h-2 bg-gradient-to-r from-cyan-400 via-sky-300 to-transparent rounded-full w-full animate-airwave opacity-80"></div>
                      <div class="h-2 bg-gradient-to-r from-brand-blue via-cyan-300 to-transparent rounded-full w-5/6 animate-airwave opacity-60" style="animation-delay:0.5s"></div>
                      <div class="h-2 bg-gradient-to-r from-teal-400 via-sky-200 to-transparent rounded-full w-4/6 animate-airwave opacity-40" style="animation-delay:1s"></div>
                    </div>
                    <div id="thermo-status" class="mt-4 text-xs font-semibold text-slate-600">Resfriando…</div>
                  </div>
                </div>

                <p class="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">Do calorão de Ribeirão ao conforto dos <strong class="text-brand-blue">16°</strong>.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Ondas da logo em movimento suave -->
      <div class="absolute inset-x-0 bottom-0 h-20 sm:h-28 overflow-hidden pointer-events-none" aria-hidden="true">
        ${waveLayer('wave-drift-slow', 'rgba(22,198,234,0.16)', 25)}
        ${waveLayer('wave-drift-mid', 'rgba(8,125,225,0.12)', 45)}
        ${waveLayer('wave-drift-fast', 'rgba(24,212,195,0.12)', 65)}
      </div>
    </section>


    <!-- ================= FORM SECTION ================= -->
    <section id="formulario-section" class="py-12 sm:py-20 bg-slate-50 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${renderQuoteForm()}
      </div>
    </section>


    <!-- ================= COMO FUNCIONA (linha do tempo) ================= -->
    <section id="como-funciona" class="py-16 sm:py-24 bg-white border-y border-slate-100">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="text-center max-w-2xl mx-auto mb-14" data-reveal>
          <span class="text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full">Processo Simples</span>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mt-3">Resolver seu ar-condicionado ficou mais fácil</h2>
          <p class="text-sm sm:text-base text-muted-rp mt-2">Elimine o trabalho de procurar e ligar para dezenas de técnicos individualmente.</p>
        </div>

        <div class="relative" data-reveal data-timeline>
          <div class="md:hidden absolute left-[22px] top-6 bottom-6 w-1 bg-slate-200 rounded-full overflow-hidden" aria-hidden="true"><div class="tl-line-fill-v h-full w-full"></div></div>
          <div class="hidden md:block absolute top-[22px] left-[12.5%] right-[12.5%] h-1 bg-slate-200 rounded-full overflow-hidden" aria-hidden="true"><div class="tl-line-fill-h h-full w-full"></div></div>

          <ol class="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            ${TIMELINE_STEPS.map((st, i) => `
              <li class="tl-step flex md:flex-col items-start md:items-center gap-4 md:gap-5 md:text-center" data-reveal style="--reveal-delay:${i * 280}ms">
                <div class="tl-dot shrink-0 w-12 h-12 rounded-full gradient-brand text-white flex items-center justify-center text-lg font-extrabold shadow-glow-blue ring-4 ring-white">${st.n}</div>
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-navy mb-1">${st.title}</h3>
                  <p class="text-sm text-slate-600 leading-relaxed">${st.text}</p>
                </div>
              </li>`).join('')}
          </ol>
        </div>

        <div class="text-center mt-12" data-reveal>
          <button type="button" data-quote="" data-origin="timeline_cta" class="gradient-brand text-white text-sm sm:text-base font-bold px-7 py-3.5 rounded-xl shadow-lg hover:brightness-105 active:scale-95 transition-all">Começar meu pedido</button>
        </div>
      </div>
    </section>


    <!-- ================= CALCULADORA DE BTUs ================= -->
    <section id="calculadora-section" class="py-16 sm:py-24 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-10" data-reveal>
          <span class="text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full">Calculadora de BTUs</span>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mt-3">Qual a potência ideal para o seu ambiente?</h2>
          <p class="text-sm sm:text-base text-muted-rp mt-2">Responda em 10 segundos e peça o orçamento já com o aparelho certo.</p>
        </div>
        <div data-reveal>${renderBtuCalculator()}</div>
        <p class="text-center text-xs text-slate-500 mt-4"><a href="#/calculadora-de-btus" class="font-semibold text-brand-blue hover:underline">Ver guia completo e tabela de referência →</a></p>
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
            <div data-reveal class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card-hover transition-all flex flex-col justify-between group">
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
                <button type="button" data-quote="${srv.id}" data-origin="service_card" class="gradient-brand text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all">
                  Pedir orçamento
                </button>
              </div>
            </div>
          `).join('')}

        </div>

      </div>
    </section>


    <!-- ================= COBERTURA POR BAIRROS ================= -->
    <section id="cobertura-section" class="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div class="lg:col-span-4 lg:sticky lg:top-24" data-reveal>
            <span class="text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full">Cobertura local</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-navy mt-3">Ar-condicionado em todos os bairros de Ribeirão Preto</h2>
            <p class="text-sm sm:text-base text-muted-rp mt-3">Toque no seu bairro e comece o pedido já com a localização preenchida.</p>
            <div class="mt-6 rounded-2xl gradient-navy-dark text-white p-6 relative overflow-hidden">
              <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full border border-cyan-400/30"></div>
              <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-cyan-400/20"></div>
              <svg class="w-8 h-8 text-cyan-300 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <div class="mt-3 text-lg font-extrabold relative">Ribeirão Preto – SP</div>
              <div class="text-xs text-slate-300 relative">DDD 16 · Atendimento local</div>
            </div>
          </div>

          <div class="lg:col-span-8" data-reveal>
            <label for="bairro-filter" class="sr-only">Buscar bairro</label>
            <input id="bairro-filter" type="search" placeholder="Buscar seu bairro..." autocomplete="off" class="w-full mb-4 px-4 py-3 border-2 border-slate-200 focus:border-brand-blue focus:ring-0 rounded-xl text-sm font-medium text-slate-800" />
            <div id="bairro-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              ${CONFIG.neighborhoodsRP.filter(n => !n.startsWith('Outro')).map(n => `
                <button type="button" data-quote-neighborhood="${n}" data-name="${n}" class="bairro-btn flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-brand-blue hover:shadow-card-hover text-left text-sm font-semibold text-slate-700 transition-all">
                  <svg class="w-4 h-4 text-brand-blue shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                  <span class="truncate">${n}</span>
                </button>`).join('')}
            </div>
            <p id="bairro-empty" class="hidden text-sm text-slate-500 mt-3">Nenhum bairro encontrado com esse nome.</p>
            <button type="button" data-quote-neighborhood="Outro bairro de Ribeirão Preto" class="mt-4 text-sm font-semibold text-brand-blue hover:underline">Meu bairro não está na lista →</button>
          </div>

        </div>
      </div>
    </section>


    <!-- ================= BLOCO DE CONVERSÃO ================= -->
    <section class="py-16 sm:py-20 gradient-navy-dark text-white relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <img src="assets/fotos/split.webp" alt="" aria-hidden="true" width="1600" height="1067" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity" />
      <div class="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/70"></div>
      ${windHtml(true)}

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

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          <!-- Foto: conforto em casa -->
          <div class="lg:col-span-5" data-reveal>
            <div class="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] max-h-[560px] mx-auto bg-slate-100">
              <img src="assets/fotos/sala.webp" alt="Sala iluminada com ar-condicionado instalado na parede" width="960" height="1200" loading="lazy" decoding="async" class="w-full h-full object-cover" />
              <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/70 to-transparent"></div>
              <div class="absolute left-4 bottom-4 right-4 flex items-center gap-3 text-white">
                <div class="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-lg font-extrabold shadow-glow-blue shrink-0">16°</div>
                <div class="text-sm font-semibold leading-snug">O conforto que a sua casa merece, sem dor de cabeça.</div>
              </div>
            </div>
          </div>

        <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">

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
  initReveal();
  initQuoteFormEvents();
  initFAQEvents();
  initPartnerModalEvents();
  initBtuCalculator();
  initHeroThermometer();
  initQuoteTriggers();
  initNeighborhoodFilter();
}

const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function initNeighborhoodFilter() {
  const input = document.getElementById('bairro-filter');
  const buttons = document.querySelectorAll('#bairro-grid .bairro-btn');
  const empty = document.getElementById('bairro-empty');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = norm(input.value.trim());
    let visible = 0;
    buttons.forEach((b) => {
      const show = !q || norm(b.getAttribute('data-name')).includes(q);
      b.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    empty?.classList.toggle('hidden', visible > 0);
  });
}
