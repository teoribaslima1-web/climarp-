/**
 * Clima16 - Interactive Multi-Step Quote Engine
 * Formulário em 4 etapas (3 quando a página de serviço já traz o serviço marcado),
 * com atalho para o WhatsApp e funil de etapas sem cookies (/api/funnel).
 */
import { CONFIG } from '../config.js';
import { db } from '../storage.js';
import { analytics } from '../analytics.js';
import { takePrefill } from '../prefill.js';

// Serviços do passo 1 (mesmos data-val/data-service-id dos cartões abaixo).
const FORM_SERVICES = [
  { id: 'instalacao', val: 'Instalação de ar-condicionado' },
  { id: 'manutencao', val: 'Manutenção de ar-condicionado' },
  { id: 'limpeza', val: 'Limpeza e higienização' },
  { id: 'nao_gela', val: 'Ar-condicionado não está gelando' },
  { id: 'vazamento', val: 'Vazamento / gotejamento' },
  { id: 'gas', val: 'Recarga / avaliação de gás' },
  { id: 'outro', val: 'Outro serviço de ar-condicionado' }
];
const TOTAL_STEPS = 4;

function findFormService(key) {
  if (!key) return null;
  return FORM_SERVICES.find(s => s.id === key || s.val === key) || null;
}

const WA_ICON = '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 01-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 01-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 012.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.32 11.32 0 0012.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.7L.55 23.63l6.04-1.58a11.36 11.36 0 005.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z"/></svg>';

export function renderQuoteForm(preselectedServiceId = null) {
  const pre = findFormService(preselectedServiceId);
  const totalShown = pre ? TOTAL_STEPS - 1 : TOTAL_STEPS;
  return `
    <div id="orcamento-form" class="w-full max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-subtle border border-slate-100 p-5 sm:p-8 md:p-10 transition-all duration-300">
      
      <!-- Form Header -->
      <div class="text-center mb-6 sm:mb-8">
        <span class="inline-block text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full mb-2">
          Pedido de orçamento gratuito
        </span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-navy">Do que você precisa?</h2>
        <p class="text-sm sm:text-base text-muted-rp mt-1">Leva menos de 1 minuto.</p>
        
        <!-- Progress Bar -->
        <div class="mt-6 flex items-center justify-between gap-2 max-w-md mx-auto">
          <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div id="form-progress-bar" class="progress-bar-fill h-full gradient-brand" style="width:${Math.round(100 / totalShown)}%"></div>
          </div>
          <span id="step-indicator" class="text-xs font-semibold text-slate-500 whitespace-nowrap">Etapa 1 de ${totalShown}</span>
        </div>
      </div>

      <!-- Aviso de pré-preenchimento (calculadora de BTUs) -->
      <div id="form-prefill-note" class="hidden mb-5 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-navy flex items-start justify-between gap-3">
        <span id="form-prefill-text" class="font-semibold"></span>
        <button type="button" id="form-prefill-clear" class="text-xs font-semibold text-slate-500 hover:text-slate-800 underline shrink-0">Remover</button>
      </div>

      <!-- Multi-step Container -->
      <form id="multi-step-form" onsubmit="return false;" novalidate>
        
        <!-- ================= STEP 1: Serviço ================= -->
        <div id="step-1" class="form-step ${pre ? 'hidden ' : ''}transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-bold text-navy mb-4 text-center">Qual serviço você procura?</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="service-options-container">
            <button type="button" data-val="Instalação de ar-condicionado" data-service-id="instalacao" class="step-option-card flex items-center p-3.5 sm:p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all group">
              <div class="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mr-3 shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              </div>
              <div>
                <div class="font-semibold text-sm sm:text-base text-slate-800">Instalação</div>
                <div class="text-xs text-slate-500">Novo aparelho ou mudança</div>
              </div>
            </button>

            <button type="button" data-val="Manutenção de ar-condicionado" data-service-id="manutencao" class="step-option-card flex items-center p-3.5 sm:p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all group">
              <div class="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mr-3 shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <div>
                <div class="font-semibold text-sm sm:text-base text-slate-800">Manutenção</div>
                <div class="text-xs text-slate-500">Ruído, falha ou preventivo</div>
              </div>
            </button>

            <button type="button" data-val="Limpeza e higienização" data-service-id="limpeza" class="step-option-card flex items-center p-3.5 sm:p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all group">
              <div class="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mr-3 shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              </div>
              <div>
                <div class="font-semibold text-sm sm:text-base text-slate-800">Limpeza / Higienização</div>
                <div class="text-xs text-slate-500">Remoção de poeira e odores</div>
              </div>
            </button>

            <button type="button" data-val="Ar-condicionado não está gelando" data-service-id="nao_gela" class="step-option-card flex items-center p-3.5 sm:p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all group">
              <div class="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mr-3 shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18m0-18l3 3m-3-3l-3 3m0 12l3 3m0 0l3-3M3 12h18m-18 0l3-3m-3 3l3 3m12-3l3-3m0 0l3 3"></path></svg>
              </div>
              <div>
                <div class="font-semibold text-sm sm:text-base text-slate-800">Ar não está gelando</div>
                <div class="text-xs text-slate-500">Liga mas ventila morno</div>
              </div>
            </button>

            <button type="button" data-val="Vazamento / gotejamento" data-service-id="vazamento" class="step-option-card flex items-center p-3.5 sm:p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all group">
              <div class="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mr-3 shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
              </div>
              <div>
                <div class="font-semibold text-sm sm:text-base text-slate-800">Vazamento / gotejamento</div>
                <div class="text-xs text-slate-500">Pinga água na parede ou chão</div>
              </div>
            </button>

            <button type="button" data-val="Recarga / avaliação de gás" data-service-id="gas" class="step-option-card flex items-center p-3.5 sm:p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all group">
              <div class="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mr-3 shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <div>
                <div class="font-semibold text-sm sm:text-base text-slate-800">Recarga / avaliação de gás</div>
                <div class="text-xs text-slate-500">Medição técnica de fluido</div>
              </div>
            </button>

            <button type="button" data-val="Outro serviço de ar-condicionado" data-service-id="outro" class="step-option-card sm:col-span-2 flex items-center p-3.5 sm:p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all group">
              <div class="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mr-3 shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
              </div>
              <div>
                <div class="font-semibold text-sm sm:text-base text-slate-800">Outro serviço</div>
                <div class="text-xs text-slate-500">Descreva sua necessidade personalizada</div>
              </div>
            </button>
          </div>
        </div>

        <!-- ================= STEP 2: Imóvel e aparelho ================= -->
        <div id="step-2" class="form-step ${pre ? '' : 'hidden '}transition-all duration-300">
          <p id="form-service-chip" class="${pre ? '' : 'hidden '}text-xs text-center text-slate-500 mb-2">Serviço: <strong class="text-navy">${pre ? pre.val : ''}</strong></p>
          <h3 class="text-lg sm:text-xl font-bold text-navy mb-4 text-center">Qual é o tipo de imóvel?</h3>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="property-options-container">
            ${CONFIG.propertyTypes.map(prop => `
              <button type="button" data-val="${prop.label}" class="step-property-card flex items-center justify-center min-h-[3.25rem] p-3 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-center transition-all">
                <span class="font-semibold text-sm text-slate-800">${prop.label}</span>
              </button>
            `).join('')}
          </div>
          <p id="property-error" class="text-rose-500 text-xs mt-2 hidden">Escolha o tipo de imóvel para continuar.</p>

          <div class="mt-5">
            <span class="block text-sm font-semibold text-navy mb-2">Já tem o aparelho? <span class="font-normal text-slate-400">(opcional)</span></span>
            <div class="grid grid-cols-3 gap-2" id="equipment-options-container">
              <button type="button" data-val="Sim" class="step-equip-card p-2.5 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-xs sm:text-sm font-semibold text-slate-800 transition-all">Já tenho</button>
              <button type="button" data-val="Não" class="step-equip-card p-2.5 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-xs sm:text-sm font-semibold text-slate-800 transition-all">Não tenho</button>
              <button type="button" data-val="Ainda estou pesquisando" class="step-equip-card p-2.5 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-xs sm:text-sm font-semibold text-slate-800 transition-all">Pesquisando</button>
            </div>
          </div>

          <!-- Capacidade (opcional): aparece quando a pessoa já tem o aparelho -->
          <div id="btu-section" class="mt-4 hidden">
            <label class="block text-sm font-semibold text-navy mb-2">Capacidade aproximada <span class="font-normal text-slate-400">(opcional)</span></label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              ${CONFIG.btuCapacities.map(btu => `
                <button type="button" data-val="${btu}" class="btn-btu-option py-2 px-3 text-xs sm:text-sm font-medium border border-slate-200 rounded-lg hover:border-brand-blue hover:bg-blue-50/50 text-slate-700 transition-all text-center">
                  ${btu}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="mt-6 flex justify-between items-center">
            <button type="button" class="btn-prev text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-2 px-3">
              ${pre ? '← Trocar serviço' : '← Voltar'}
            </button>
            <button type="button" id="btn-local-next" class="gradient-brand text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
              Avançar →
            </button>
          </div>
        </div>

        <!-- ================= STEP 3: Localização ================= -->
        <div id="step-3" class="form-step hidden transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-bold text-navy mb-4 text-center">Onde será realizado o serviço?</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
              <div class="flex items-center px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm">
                <svg class="w-5 h-5 text-brand-blue mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Ribeirão Preto – SP
                <span class="ml-auto text-xs bg-blue-100 text-brand-blue font-bold px-2 py-0.5 rounded">Foco Regional</span>
              </div>
            </div>

            <div>
              <label for="lead-neighborhood" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Bairro em Ribeirão Preto <span class="text-rose-500">*</span></label>
              <input type="text" id="lead-neighborhood" list="neighborhood-list" placeholder="Ex: Jardim Botânico, Nova Aliança, Centro..." class="w-full px-4 py-3 border-2 border-slate-200 focus:border-brand-blue focus:ring-0 rounded-xl text-slate-800 placeholder-slate-400 font-medium text-sm transition-all" required />
              <datalist id="neighborhood-list">
                ${CONFIG.neighborhoodsRP.map(b => `<option value="${b}"></option>`).join('')}
              </datalist>
              <p id="neighborhood-error" class="text-rose-500 text-xs mt-1 hidden">Por favor, informe seu bairro para conectar com os profissionais da região.</p>
            </div>

            <!-- Quick neighborhood tags -->
            <div>
              <span class="text-xs text-slate-400">Bairros frequentes:</span>
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                <button type="button" class="btn-quick-bairro text-xs bg-slate-100 hover:bg-blue-50 hover:text-brand-blue text-slate-600 px-2.5 py-1 rounded-md transition-colors">Jardim Botânico</button>
                <button type="button" class="btn-quick-bairro text-xs bg-slate-100 hover:bg-blue-50 hover:text-brand-blue text-slate-600 px-2.5 py-1 rounded-md transition-colors">Nova Aliança</button>
                <button type="button" class="btn-quick-bairro text-xs bg-slate-100 hover:bg-blue-50 hover:text-brand-blue text-slate-600 px-2.5 py-1 rounded-md transition-colors">Bonfim Paulista</button>
                <button type="button" class="btn-quick-bairro text-xs bg-slate-100 hover:bg-blue-50 hover:text-brand-blue text-slate-600 px-2.5 py-1 rounded-md transition-colors">Centro</button>
                <button type="button" class="btn-quick-bairro text-xs bg-slate-100 hover:bg-blue-50 hover:text-brand-blue text-slate-600 px-2.5 py-1 rounded-md transition-colors">Alto da Boa Vista</button>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-between items-center">
            <button type="button" class="btn-prev text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-2 px-3">
              ← Voltar
            </button>
            <button type="button" id="btn-bairro-next" class="gradient-brand text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
              Avançar →
            </button>
          </div>
        </div>

        <!-- ================= STEP 4: Contato & Envio ================= -->
        <div id="step-4" class="form-step hidden transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-bold text-navy mb-1 text-center">Para onde enviamos o orçamento?</h3>
          <p class="text-xs text-slate-500 text-center mb-5">Seus dados serão tratados com segurança para viabilizar seu atendimento.</p>
          
          <div class="space-y-3.5">
            <div>
              <label for="lead-name" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Seu Nome <span class="text-rose-500">*</span></label>
              <input type="text" id="lead-name" placeholder="Ex: João da Silva" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue focus:ring-0 rounded-xl text-slate-800 font-medium text-sm transition-all" required />
              <p id="name-error" class="text-rose-500 text-xs mt-1 hidden">Por favor, informe seu nome.</p>
            </div>

            <div>
              <label for="lead-phone" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">WhatsApp <span class="text-rose-500">*</span></label>
              <input type="tel" id="lead-phone" placeholder="(16) 99999-9999" maxlength="20" autocomplete="tel" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue focus:ring-0 rounded-xl text-slate-800 font-medium text-sm transition-all" required />
              <p id="phone-error" class="text-rose-500 text-xs mt-1 hidden">Informe um WhatsApp válido para contato.</p>
            </div>

            <div>
              <label for="lead-email" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">E-mail <span class="text-slate-400 font-normal lowercase">(opcional)</span></label>
              <input type="email" id="lead-email" placeholder="seuemail@exemplo.com" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue focus:ring-0 rounded-xl text-slate-800 font-medium text-sm transition-all" />
            </div>

            <div>
              <label for="lead-desc" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Conte um pouco mais sobre o que precisa <span class="text-slate-400 font-normal lowercase">(opcional)</span></label>
              <textarea id="lead-desc" rows="2" placeholder="Ex: Preciso instalar split de 12.000 BTUs no 3º andar, condomínio com dreno pronto..." class="w-full px-4 py-2 border-2 border-slate-200 focus:border-brand-blue focus:ring-0 rounded-xl text-slate-800 text-sm transition-all"></textarea>
            </div>

            <div class="p-4 bg-blue-50 rounded-xl text-sm text-slate-700">
              <strong>Depois do envio:</strong> a Clima16 poderá entrar em contato pelo WhatsApp para confirmar os detalhes. Profissionais parceiros disponíveis poderão receber seu pedido e falar com você pelo WhatsApp ou e-mail informado. O envio não garante profissional disponível, prazo de atendimento ou quantidade de propostas. Você decide se quer contratar.
            </div>
            <!-- LGPD Consent Checkbox -->
            <div class="pt-2">
              <label class="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" id="lead-privacy" class="mt-1 w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300" required />
                <span class="text-xs text-slate-600 leading-snug">
                  Li a <a href="/politica-de-privacidade" target="_blank" class="text-brand-blue underline hover:text-blue-700">Política de Privacidade</a> e autorizo o contato e o compartilhamento dos dados desta solicitação com profissionais parceiros para atender meu pedido de orçamento.
                </span>
              </label>
              <p id="privacy-error" class="text-rose-500 text-xs mt-1 hidden">É necessário concordar com a política de privacidade para prosseguir.</p>
            </div>
          </div>

          <!-- Antispam (honeypot): invisível para pessoas, robôs costumam preencher -->
          <div aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden">
            <label>Não preencha este campo <input type="text" id="lead-website" name="website" tabindex="-1" autocomplete="off" /></label>
          </div>

          <div id="submit-error" role="alert" class="hidden mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm"></div>

          <!-- Actions -->
          <div class="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button type="button" class="btn-prev text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-2 px-3 order-2 sm:order-1">
              ← Voltar
            </button>
            <button type="button" id="btn-submit-lead" class="w-full sm:w-auto order-1 sm:order-2 gradient-brand text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:brightness-105 active:scale-95 transition-all text-sm sm:text-base flex items-center justify-center gap-2">
              <span>Solicitar meu orçamento</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>

      </form>

      <!-- Atalho: quem prefere conversar recebe o WhatsApp já com serviço, imóvel e bairro -->
      <div id="form-wa-shortcut" class="${pre ? '' : 'hidden '}mt-6 pt-4 border-t border-slate-100 text-center">
        <a id="form-wa-link" href="https://wa.me/${CONFIG.brand.whatsappNumber}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 py-1">
          ${WA_ICON}<span>Prefere pelo WhatsApp? Fale com a gente</span>
        </a>
      </div>
    </div>
  `;
}

export function initQuoteFormEvents(initialService = null) {
  let currentStep = 1;
  const formData = {
    service_type: '',
    property_type: '',
    has_equipment: '',
    btu: '',
    neighborhood: '',
    name: '',
    phone: '',
    email: '',
    description: ''
  };
  let prefillBtu = '';   // capacidade sugerida pela calculadora
  let prefillCalc = '';  // resumo do cálculo, vai na descrição do pedido

  const steps = [1, 2, 3, 4].map(n => document.getElementById(`step-${n}`));
  const progressBar = document.getElementById('form-progress-bar');
  const stepIndicator = document.getElementById('step-indicator');
  const formEl = document.getElementById('multi-step-form');
  const neighborhoodInput = document.getElementById('lead-neighborhood');
  const neighborhoodError = document.getElementById('neighborhood-error');
  const propertyError = document.getElementById('property-error');
  const btuSection = document.getElementById('btu-section');
  const waBox = document.getElementById('form-wa-shortcut');
  const waLink = document.getElementById('form-wa-link');

  const entry = initialService ? 'servico' : 'home';
  let skippedService = false; // veio da página de serviço com o serviço já marcado

  // ---- Funil sem cookies e sem dados pessoais: mostra em qual etapa as pessoas param ----
  const funnelSent = new Set();
  function funnel(event) {
    if (event !== 'whatsapp' && funnelSent.has(event)) return;
    funnelSent.add(event);
    const session = analytics.getSession() || {};
    const source = session.gclid ? 'google_ads' : (session.utm_source && session.utm_source !== 'direct' ? session.utm_source : null);
    if (event !== 'whatsapp') analytics.track('form_step', { step_name: event, entry, service: formData.service_type || '' });
    try {
      const body = JSON.stringify({ event, entry, service: formData.service_type || null, step: currentStep, device: session.device || null, source });
      if (!(navigator.sendBeacon && navigator.sendBeacon('/api/funnel', body))) {
        fetch('/api/funnel', { method: 'POST', body, keepalive: true }).catch(() => {});
      }
    } catch { /* métrica nunca atrapalha o pedido */ }
  }

  let started = false;
  function markStart() {
    if (started) return;
    started = true;
    analytics.track('form_start', { entry });
    funnel('inicio');
    // Na página de serviço o serviço já vem escolhido: conta como etapa cumprida
    if (skippedService && formData.service_type) funnel('servico');
  }
  // pointerdown cobre o iPhone, onde tocar num botão não dispara foco
  formEl?.addEventListener('pointerdown', markStart);
  formEl?.addEventListener('focusin', markStart);

  function scrollFormIntoView() {
    const box = document.getElementById('orcamento-form');
    if (box && box.getBoundingClientRect().top < 0) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---- Atalho para o WhatsApp com o que a pessoa já respondeu ----
  function whatsAppText() {
    const bairro = (neighborhoodInput?.value || '').trim().slice(0, 60);
    const lines = ['Olá! Quero um orçamento pelo Clima16.'];
    if (formData.service_type) lines.push(`Serviço: ${formData.service_type}`);
    if (formData.property_type) lines.push(`Imóvel: ${formData.property_type}`);
    if (formData.btu && !['Não informado', 'Não sei informar'].includes(formData.btu)) lines.push(`Aparelho: ${formData.btu}`);
    if (bairro) lines.push(`Bairro: ${bairro}`);
    return lines.join('\n');
  }
  function updateWhatsAppShortcut() {
    if (!waBox || !waLink) return;
    waBox.classList.toggle('hidden', currentStep < 2);
    waLink.href = `https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(whatsAppText())}`;
  }
  waLink?.addEventListener('click', () => {
    updateWhatsAppShortcut();
    analytics.track('whatsapp_click', { origin: `form_step_${currentStep}`, entry });
    funnel('whatsapp');
  });
  neighborhoodInput?.addEventListener('input', updateWhatsAppShortcut);

  function updateStepUI() {
    steps.forEach((s, idx) => s?.classList.toggle('hidden', idx + 1 !== currentStep));
    if (currentStep === 1) skippedService = false;
    const total = skippedService ? TOTAL_STEPS - 1 : TOTAL_STEPS;
    const shown = skippedService ? currentStep - 1 : currentStep;
    if (progressBar) progressBar.style.width = `${Math.round((shown / total) * 100)}%`;
    if (stepIndicator) stepIndicator.textContent = `Etapa ${shown} de ${total}`;
    const chip = document.getElementById('form-service-chip');
    if (chip) {
      chip.classList.toggle('hidden', !formData.service_type);
      const strong = chip.querySelector('strong');
      if (strong) strong.textContent = formData.service_type;
    }
    updateWhatsAppShortcut();
  }

  function goTo(step) {
    currentStep = step;
    updateStepUI();
    scrollFormIntoView();
  }

  // Página de serviço: o serviço já vem marcado e a pessoa começa no tipo de imóvel
  const preService = findFormService(initialService);
  if (preService) {
    formData.service_type = preService.val;
    document.querySelector(`.step-option-card[data-service-id="${preService.id}"]`)?.classList.add('option-card-selected');
    skippedService = true;
    currentStep = 2;
  }

  // ---- Pré-preenchimento (chips do hero, calculadora, bairros) ----
  function markBtuButton(label) {
    document.querySelectorAll('.btn-btu-option').forEach(b => {
      const on = b.getAttribute('data-val') === label;
      b.classList.toggle('option-card-selected', on);
      b.classList.toggle('font-semibold', on);
    });
  }

  function showPrefillNote(text) {
    const note = document.getElementById('form-prefill-note');
    const label = document.getElementById('form-prefill-text');
    if (!note || !label) return;
    if (text) { label.textContent = text; note.classList.remove('hidden'); } else { note.classList.add('hidden'); }
  }

  function applyPrefill(p) {
    if (!p) return;
    if (p.service) {
      const btn = document.querySelector(`.step-option-card[data-service-id="${p.service}"]`);
      if (btn) {
        formData.service_type = btn.getAttribute('data-val');
        document.querySelectorAll('.step-option-card').forEach(b => b.classList.remove('option-card-selected'));
        btn.classList.add('option-card-selected');
        markStart();
        funnel('servico');
        currentStep = 2;
      }
    }
    if (p.btu) {
      prefillBtu = p.btu;
      prefillCalc = p.calc || '';
      formData.btu = p.btu;
      markBtuButton(p.btu);
      showPrefillNote(`Orçamento para ${p.btuText || p.btu}${p.calc ? ' · calculado pela Calculadora Clima16' : ''}`);
    }
    if (p.neighborhood && neighborhoodInput) {
      neighborhoodInput.value = p.neighborhood;
      formData.neighborhood = p.neighborhood;
      neighborhoodError?.classList.add('hidden');
      if (!p.service && !formData.service_type) {
        // Bairro escolhido primeiro: segue o fluxo normal a partir do serviço
        currentStep = 1;
      }
    }
    updateStepUI();
  }

  document.getElementById('form-prefill-clear')?.addEventListener('click', () => {
    prefillBtu = '';
    prefillCalc = '';
    formData.btu = '';
    markBtuButton('');
    showPrefillNote('');
    updateWhatsAppShortcut();
  });

  // Etapa 1: serviço
  document.querySelectorAll('.step-option-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      formData.service_type = val;
      document.querySelectorAll('.step-option-card').forEach(b => b.classList.remove('option-card-selected'));
      btn.classList.add('option-card-selected');
      funnel('servico');
      setTimeout(() => goTo(2), 150);
    });
  });

  // Etapa 2: imóvel (obrigatório) + aparelho e capacidade (opcionais)
  document.querySelectorAll('.step-property-card').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.property_type = btn.getAttribute('data-val');
      document.querySelectorAll('.step-property-card').forEach(b => b.classList.remove('option-card-selected'));
      btn.classList.add('option-card-selected');
      propertyError?.classList.add('hidden');
      updateWhatsAppShortcut();
    });
  });

  document.querySelectorAll('.step-equip-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      formData.has_equipment = val;
      document.querySelectorAll('.step-equip-card').forEach(b => b.classList.remove('option-card-selected'));
      btn.classList.add('option-card-selected');
      if (val === 'Sim') {
        btuSection?.classList.remove('hidden');
      } else {
        btuSection?.classList.add('hidden');
        formData.btu = prefillBtu || '';
        markBtuButton(prefillBtu);
      }
      updateWhatsAppShortcut();
    });
  });

  document.querySelectorAll('.btn-btu-option').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.btu = btn.getAttribute('data-val');
      markBtuButton(formData.btu);
      updateWhatsAppShortcut();
    });
  });

  document.getElementById('btn-local-next')?.addEventListener('click', () => {
    if (!formData.property_type) {
      propertyError?.classList.remove('hidden');
      return;
    }
    if (!formData.has_equipment) formData.has_equipment = 'Não informado';
    if (!formData.btu) formData.btu = prefillBtu || 'Não informado';
    funnel('local');
    goTo(3);
  });

  // Etapa 3: bairro
  document.querySelectorAll('.btn-quick-bairro').forEach(b => {
    b.addEventListener('click', () => {
      if (neighborhoodInput) {
        neighborhoodInput.value = b.textContent.trim();
        neighborhoodError?.classList.add('hidden');
        updateWhatsAppShortcut();
      }
    });
  });

  document.getElementById('btn-bairro-next')?.addEventListener('click', () => {
    const val = neighborhoodInput?.value.trim();
    if (!val) {
      neighborhoodError?.classList.remove('hidden');
      neighborhoodInput?.focus();
      return;
    }
    neighborhoodError?.classList.add('hidden');
    formData.neighborhood = val;
    funnel('bairro');
    goTo(4);
  });

  // Etapa 4: contato e máscara do telefone
  const phoneInput = document.getElementById('lead-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      // Número colado com DDI (+55 16 98157-0034): tira o 55 antes de aplicar a máscara
      if (v.length > 11 && v.startsWith('55')) v = v.slice(2);
      if (v.length > 11 && v.startsWith('0')) v = v.replace(/^0+/, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 10) {
        v = v.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (v.length > 5) {
        v = v.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/^(\d*)/, '($1');
      }
      e.target.value = v;
    });
  }

  // Prev button handlers
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
        scrollFormIntoView();
      }
    });
  });

  // Final Submit
  const submitBtn = document.getElementById('btn-submit-lead');
  let attemptId = null;
  let attemptPayload = null;
  submitBtn?.addEventListener('click', () => {
    if (submitBtn.disabled) return;
    const nameInput = document.getElementById('lead-name');
    const emailInput = document.getElementById('lead-email');
    const descInput = document.getElementById('lead-desc');
    const privacyCheckbox = document.getElementById('lead-privacy');

    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const privacyError = document.getElementById('privacy-error');

    let hasError = false;

    // Name validation
    if (!nameInput?.value.trim() || nameInput.value.trim().length < 2) {
      nameError?.classList.remove('hidden');
      hasError = true;
    } else {
      nameError?.classList.add('hidden');
    }

    // Phone validation
    const rawPhone = phoneInput?.value.replace(/\D/g, '') || '';
    if (rawPhone.length < 10) {
      phoneError?.classList.remove('hidden');
      hasError = true;
    } else {
      phoneError?.classList.add('hidden');
    }

    // Privacy validation
    if (!privacyCheckbox?.checked) {
      privacyError?.classList.remove('hidden');
      hasError = true;
    } else {
      privacyError?.classList.add('hidden');
    }

    if (hasError) return;
    if (emailInput?.value.trim() && !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }
    funnel('envio');

    formData.name = nameInput?.value.trim();
    formData.phone = phoneInput?.value.trim();
    formData.email = emailInput?.value.trim() || '';
    const userDesc = descInput?.value.trim() || '';
    formData.description = [prefillCalc, userDesc].filter(Boolean).join('\n');

    // Show loading state on button
    const originalBtnHtml = submitBtn.innerHTML;
    const errorBox = document.getElementById('submit-error');
    errorBox?.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      Processando solicitação...
    `;

    const session = analytics.getSession();
    const payload = {
      ...formData,
      consent: true,
      website: document.getElementById('lead-website')?.value || '',
      utm_source: session.utm_source,
      utm_medium: session.utm_medium,
      utm_campaign: session.utm_campaign,
      utm_content: session.utm_content,
      utm_term: session.utm_term,
      gclid: session.gclid,
      fbclid: session.fbclid,
      referrer: session.referrer,
      landing_page: session.entry_page,
      device: session.device
    };

    const fingerprint = JSON.stringify(payload);
    if (attemptPayload !== fingerprint) {
      attemptId = crypto.randomUUID();
      attemptPayload = fingerprint;
    }
    payload.request_id = attemptId;
    sendLead(payload)
      .then((res) => {
        // Guarda só o resumo local para a tela de confirmação; o registro oficial está no banco.
        funnel('enviado');
        db.createLead(formData, res && res.id, !!res.duplicate);
        window.clima16Navigate('/solicitacao-recebida');
      })
      .catch((err) => {
        analytics.track('form_submit_error', { error: err.code || 'network' });
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        showSubmitError(errorBox, err.code);
      });
  });

  // Aplica pré-preenchimento pendente e escuta novos pedidos (chips, calculadora, bairros)
  updateStepUI();
  applyPrefill(takePrefill());
  if (window.__clima16PrefillHandler) window.removeEventListener('clima16:prefill', window.__clima16PrefillHandler);
  window.__clima16PrefillHandler = () => applyPrefill(takePrefill());
  window.addEventListener('clima16:prefill', window.__clima16PrefillHandler);
}

const SUBMIT_ERROR_MESSAGES = {
  invalid_name: 'Confira o nome informado e tente novamente.',
  invalid_phone: 'Confira o telefone informado (com DDD) e tente novamente.',
  invalid_email: 'Confira o e-mail informado e tente novamente.',
  consent_required: 'É necessário concordar com a política de privacidade para prosseguir.',
  too_many_requests: 'Recebemos muitas solicitações deste aparelho. Tente novamente mais tarde.'
};

async function sendLead(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    let data = null;
    try { data = await res.json(); } catch { /* resposta sem JSON */ }
    if (!res.ok || !data || data.ok !== true) {
      const error = new Error('lead_request_failed');
      error.code = (data && data.error) || `http_${res.status}`;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function showSubmitError(box, code) {
  if (!box) return;
  const message = SUBMIT_ERROR_MESSAGES[code] || 'Não foi possível enviar sua solicitação agora. Tente novamente em instantes ou fale direto com a gente pelo WhatsApp.';
  const waUrl = `https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(CONFIG.brand.whatsappDefaultMessage)}`;
  box.innerHTML = '';
  const text = document.createElement('span');
  text.textContent = message + ' ';
  const link = document.createElement('a');
  link.href = waUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'font-bold underline';
  link.textContent = 'Chamar no WhatsApp';
  box.append(text, link);
  box.classList.remove('hidden');
}
