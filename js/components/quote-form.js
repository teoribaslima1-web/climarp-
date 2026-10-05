/**
 * ClimaRP - Interactive Multi-Step Quote Engine
 * High-conversion 5-step form with step animations, data validation, and event tracking.
 */
import { CONFIG } from '../config.js';
import { db } from '../storage.js';
import { analytics } from '../analytics.js';

export function renderQuoteForm(preselectedServiceId = null) {
  return `
    <div id="orcamento-form" class="w-full max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-subtle border border-slate-100 p-5 sm:p-8 md:p-10 transition-all duration-300">
      
      <!-- Form Header -->
      <div class="text-center mb-6 sm:mb-8">
        <span class="inline-block text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full mb-2">
          Orçamento Gratuito & Rápido
        </span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-navy">Do que você precisa?</h2>
        <p class="text-sm sm:text-base text-muted-rp mt-1">Leva menos de 1 minuto.</p>
        
        <!-- Progress Bar -->
        <div class="mt-6 flex items-center justify-between gap-2 max-w-md mx-auto">
          <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div id="form-progress-bar" class="progress-bar-fill h-full gradient-brand w-1/5"></div>
          </div>
          <span id="step-indicator" class="text-xs font-semibold text-slate-500 whitespace-nowrap">Etapa 1 de 5</span>
        </div>
      </div>

      <!-- Multi-step Container -->
      <form id="multi-step-form" onsubmit="return false;" novalidate>
        
        <!-- ================= STEP 1: Serviço ================= -->
        <div id="step-1" class="form-step transition-all duration-300">
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

        <!-- ================= STEP 2: Tipo de Imóvel ================= -->
        <div id="step-2" class="form-step hidden transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-bold text-navy mb-4 text-center">Qual é o tipo de imóvel?</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="property-options-container">
            ${CONFIG.propertyTypes.map(prop => `
              <button type="button" data-val="${prop.label}" class="step-property-card flex items-center p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all">
                <div class="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3 shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <span class="font-semibold text-sm sm:text-base text-slate-800">${prop.label}</span>
              </button>
            `).join('')}
          </div>

          <div class="mt-6 flex justify-between">
            <button type="button" class="btn-prev text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-2 px-3">
              ← Voltar
            </button>
          </div>
        </div>

        <!-- ================= STEP 3: Equipamento e BTU ================= -->
        <div id="step-3" class="form-step hidden transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-bold text-navy mb-4 text-center">Você já possui o aparelho?</h3>
          
          <div class="space-y-3" id="equipment-options-container">
            <button type="button" data-val="Sim" class="w-full step-equip-card flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all">
              <span class="font-semibold text-slate-800">Sim, já tenho o aparelho</span>
              <span class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">Instalar / Consertar</span>
            </button>
            
            <button type="button" data-val="Não" class="w-full step-equip-card flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all">
              <span class="font-semibold text-slate-800">Não possuo o aparelho</span>
              <span class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">Preciso de orientação</span>
            </button>

            <button type="button" data-val="Ainda estou pesquisando" class="w-full step-equip-card flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 text-left transition-all">
              <span class="font-semibold text-slate-800">Ainda estou pesquisando para comprar</span>
              <span class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">Comparando</span>
            </button>
          </div>

          <!-- Optional BTU Sub-question (shows if Sim or selected) -->
          <div id="btu-section" class="mt-6 pt-6 border-t border-slate-100 hidden">
            <label class="block text-sm font-semibold text-navy mb-2">Qual a capacidade aproximada do aparelho? (Opcional)</label>
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
              ← Voltar
            </button>
            <button type="button" id="btn-step3-next" class="gradient-brand text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all">
              Avançar →
            </button>
          </div>
        </div>

        <!-- ================= STEP 4: Localização ================= -->
        <div id="step-4" class="form-step hidden transition-all duration-300">
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
            <button type="button" id="btn-step4-next" class="gradient-brand text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
              Avançar →
            </button>
          </div>
        </div>

        <!-- ================= STEP 5: Contato & Envio ================= -->
        <div id="step-5" class="form-step hidden transition-all duration-300">
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
              <input type="tel" id="lead-phone" placeholder="(16) 99999-9999" maxlength="15" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue focus:ring-0 rounded-xl text-slate-800 font-medium text-sm transition-all" required />
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

            <!-- LGPD Consent Checkbox -->
            <div class="pt-2">
              <label class="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" id="lead-privacy" class="mt-1 w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300" required />
                <span class="text-xs text-slate-600 leading-snug">
                  Li e concordo com a <a href="#/politica-de-privacidade" target="_blank" class="text-brand-blue underline hover:text-blue-700">Política de Privacidade</a> e autorizo o contato relacionado à minha solicitação de orçamento.
                </span>
              </label>
              <p id="privacy-error" class="text-rose-500 text-xs mt-1 hidden">É necessário concordar com a política de privacidade para prosseguir.</p>
            </div>
          </div>

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

  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4'),
    document.getElementById('step-5')
  ];

  const progressBar = document.getElementById('form-progress-bar');
  const stepIndicator = document.getElementById('step-indicator');

  analytics.track('form_start');

  function updateStepUI() {
    steps.forEach((s, idx) => {
      if (idx + 1 === currentStep) {
        s?.classList.remove('hidden');
      } else {
        s?.classList.add('hidden');
      }
    });

    if (progressBar) {
      const percentage = (currentStep / 5) * 100;
      progressBar.style.width = `${percentage}%`;
    }
    if (stepIndicator) {
      stepIndicator.textContent = `Etapa ${currentStep} de 5`;
    }
  }

  // Pre-selection if coming from service page
  if (initialService) {
    formData.service_type = initialService;
    const matchedBtn = document.querySelector(`[data-service-id="${initialService}"]`) || document.querySelector(`[data-val*="${initialService}"]`);
    if (matchedBtn) {
      matchedBtn.classList.add('option-card-selected');
    }
  }

  // Step 1: Service selection
  document.querySelectorAll('.step-option-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const val = btn.getAttribute('data-val');
      formData.service_type = val;
      document.querySelectorAll('.step-option-card').forEach(b => b.classList.remove('option-card-selected'));
      btn.classList.add('option-card-selected');
      analytics.track('form_step_1', { service: val });
      
      setTimeout(() => {
        currentStep = 2;
        updateStepUI();
      }, 150);
    });
  });

  // Step 2: Property selection
  document.querySelectorAll('.step-property-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      formData.property_type = val;
      document.querySelectorAll('.step-property-card').forEach(b => b.classList.remove('option-card-selected'));
      btn.classList.add('option-card-selected');
      analytics.track('form_step_2', { property_type: val });

      setTimeout(() => {
        currentStep = 3;
        updateStepUI();
      }, 150);
    });
  });

  // Step 3: Equipment & BTU
  const btuSection = document.getElementById('btu-section');
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
        formData.btu = 'Não informado';
      }
    });
  });

  document.querySelectorAll('.btn-btu-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      formData.btu = val;
      document.querySelectorAll('.btn-btu-option').forEach(b => {
        b.classList.remove('bg-brand-blue', 'text-white', 'border-brand-blue');
        b.classList.add('border-slate-200', 'text-slate-700');
      });
      btn.classList.add('bg-brand-blue', 'text-white', 'border-brand-blue');
      btn.classList.remove('border-slate-200', 'text-slate-700');
    });
  });

  document.getElementById('btn-step3-next')?.addEventListener('click', () => {
    if (!formData.has_equipment) {
      formData.has_equipment = 'Sim';
    }
    analytics.track('form_step_3', { has_equipment: formData.has_equipment, btu: formData.btu });
    currentStep = 4;
    updateStepUI();
  });

  // Step 4: Neighborhood
  const neighborhoodInput = document.getElementById('lead-neighborhood');
  const neighborhoodError = document.getElementById('neighborhood-error');

  document.querySelectorAll('.btn-quick-bairro').forEach(b => {
    b.addEventListener('click', () => {
      if (neighborhoodInput) {
        neighborhoodInput.value = b.textContent.trim();
        neighborhoodError?.classList.add('hidden');
      }
    });
  });

  document.getElementById('btn-step4-next')?.addEventListener('click', () => {
    const val = neighborhoodInput?.value.trim();
    if (!val) {
      neighborhoodError?.classList.remove('hidden');
      neighborhoodInput?.focus();
      return;
    }
    neighborhoodError?.classList.add('hidden');
    formData.neighborhood = val;
    analytics.track('form_step_4', { neighborhood: val });
    currentStep = 5;
    updateStepUI();
  });

  // Step 5: Contact info & Phone mask
  const phoneInput = document.getElementById('lead-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
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
      }
    });
  });

  // Final Submit
  const submitBtn = document.getElementById('btn-submit-lead');
  submitBtn?.addEventListener('click', () => {
    const nameInput = document.getElementById('lead-name');
    const emailInput = document.getElementById('lead-email');
    const descInput = document.getElementById('lead-desc');
    const privacyCheckbox = document.getElementById('lead-privacy');

    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const privacyError = document.getElementById('privacy-error');

    let hasError = false;

    // Name validation
    if (!nameInput?.value.trim()) {
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

    formData.name = nameInput?.value.trim();
    formData.phone = phoneInput?.value.trim();
    formData.email = emailInput?.value.trim() || '';
    formData.description = descInput?.value.trim() || '';

    // Show loading state on button
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      Processando solicitação...
    `;

    setTimeout(() => {
      const createdLead = db.createLead(formData);
      window.location.hash = '#/solicitacao-recebida';
    }, 600);
  });
}
