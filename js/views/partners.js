/**
 * Clima16 - Partners Landing Page View (/para-profissionais)
 * Dedicated portal for HVAC pros, technicians, and local service providers in Ribeirão Preto.
 */
import { db } from '../storage.js';
import { analytics } from '../analytics.js';

export function renderPartnersView() {
  return `
    <div class="bg-slate-50 min-h-screen">
      
      <!-- Hero -->
      <section class="bg-gradient-to-b from-navy to-slate-900 text-white pt-12 pb-20 border-b border-slate-800">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span class="inline-block text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-3.5 py-1.5 rounded-full mb-4">
            Parceria Regional Clima16
          </span>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Você trabalha com ar-condicionado em Ribeirão Preto?
          </h1>

          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed font-light">
            O Clima16 conecta pessoas procurando serviços de climatização a profissionais e empresas da região. Cadastre seu interesse em receber oportunidades de atendimento.
          </p>

          <div class="mt-8 flex justify-center">
            <button onclick="document.getElementById('cadastro-parceiro-form')?.scrollIntoView({behavior:'smooth'});" class="bg-brand-cyan hover:bg-cyan-400 text-navy font-extrabold text-base px-8 py-4 rounded-xl shadow-lg transition-all">
              Cadastrar meu interesse
            </button>
          </div>

        </div>
      </section>

      <!-- Benefits for Partners -->
      <section class="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-navy">Como funciona a parceria com o Clima16</h2>
          <p class="text-sm text-slate-600 mt-2">Um canal transparente para expandir seus atendimentos na cidade.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-subtle text-left">
            <div class="w-12 h-12 bg-blue-100 text-brand-blue rounded-xl flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">Solicitações qualificadas</h3>
            <p class="text-sm text-slate-600">Receba pedidos de orçamento detalhados com bairro, tipo de imóvel, serviço e capacidade em BTUs.</p>
          </div>

          <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-subtle text-left">
            <div class="w-12 h-12 bg-cyan-100 text-brand-blue rounded-xl flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">Foco em Ribeirão Preto</h3>
            <p class="text-sm text-slate-600">Oportunidades concentradas nos bairros onde você tem facilidade de deslocamento.</p>
          </div>

          <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-subtle text-left">
            <div class="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">Negociação direta</h3>
            <p class="text-sm text-slate-600">Você conversa diretamente com o cliente, apresenta seu preço e estabelece seu cronograma.</p>
          </div>
        </div>

        <!-- Embedded Partner Registration Form -->
        <div id="cadastro-parceiro-form" class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-subtle max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-navy">Formulário de Cadastro de Parceiro</h3>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Preencha seus dados para receber o contato da nossa equipe de credenciamento.</p>
          </div>

          <form id="dedicated-partner-form" onsubmit="return false;" class="space-y-4 text-left">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nome ou Nome da Empresa <span class="text-rose-500">*</span></label>
                <input type="text" id="dp-name" placeholder="Ex: Climatização Silva" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm font-medium" required />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">WhatsApp <span class="text-rose-500">*</span></label>
                <input type="tel" id="dp-phone" placeholder="(16) 99999-9999" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm font-medium" required />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
                <input type="email" id="dp-email" placeholder="seuemail@exemplo.com" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Cidade</label>
                <input type="text" id="dp-city" value="Ribeirão Preto – SP" class="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Serviços que você executa: <span class="text-rose-500">*</span></label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Instalação" class="dp-service-check text-brand-blue rounded" checked />
                  <span>Instalação</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Manutenção" class="dp-service-check text-brand-blue rounded" checked />
                  <span>Manutenção</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Higienização" class="dp-service-check text-brand-blue rounded" checked />
                  <span>Higienização</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Comercial" class="dp-service-check text-brand-blue rounded" />
                  <span>Comercial</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Residencial" class="dp-service-check text-brand-blue rounded" checked />
                  <span>Residencial</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Outros" class="dp-service-check text-brand-blue rounded" />
                  <span>Outros</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">CNPJ <span class="text-slate-400 font-normal lowercase">(opcional)</span></label>
              <input type="text" id="dp-cnpj" placeholder="00.000.000/0001-00" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Conte brevemente sobre seu trabalho</label>
              <textarea id="dp-bio" rows="3" placeholder="Tempo de atuação, marcas atendidas, equipamentos..." class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm"></textarea>
            </div>

            <div id="dp-success" class="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium hidden">
              ✓ Cadastro realizado com sucesso! Nossa equipe entrará em contato via WhatsApp para confirmar as informações.
            </div>

            <button type="button" id="dp-submit-btn" class="w-full gradient-brand text-white font-extrabold text-base py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
              Cadastrar interesse
            </button>
          </form>
        </div>

      </section>

    </div>
  `;
}

export function initPartnersEvents() {
  const submitBtn = document.getElementById('dp-submit-btn');
  submitBtn?.addEventListener('click', () => {
    const name = document.getElementById('dp-name')?.value.trim();
    const phone = document.getElementById('dp-phone')?.value.trim();
    const email = document.getElementById('dp-email')?.value.trim();
    const city = document.getElementById('dp-city')?.value.trim();
    const cnpj = document.getElementById('dp-cnpj')?.value.trim();
    const bio = document.getElementById('dp-bio')?.value.trim();
    const selected = Array.from(document.querySelectorAll('.dp-service-check:checked')).map(cb => cb.value);

    if (!name || !phone) {
      alert('Por favor, preencha seu Nome/Empresa e WhatsApp.');
      return;
    }

    db.createPartner({
      name,
      company: name,
      phone,
      email,
      city,
      services: selected,
      cnpj,
      bio
    });

    const success = document.getElementById('dp-success');
    success?.classList.remove('hidden');
    document.getElementById('dedicated-partner-form')?.reset();
  });
}
