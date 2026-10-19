/**
 * Clima16 - Partners Landing Page View (/para-profissionais)
 * Dedicated portal for HVAC pros, technicians, and local service providers in Ribeirão Preto.
 */
import { submitPartner, CONSENT_HTML, HONEYPOT_HTML } from '../partners-api.js';
import { analytics } from '../analytics.js';

const PARTNER_FAQ = [
  ['Quanto custa ser parceiro?', 'Nada. Nesta fase, o cadastro e o recebimento de pedidos são gratuitos, sem mensalidade. Se isso mudar no futuro, avisaremos com antecedência e você decide se quer continuar.'],
  ['Como eu recebo os pedidos?', 'Quando um pedido combina com os seus serviços e a sua região, enviamos os dados do cliente (nome, WhatsApp, bairro, serviço e detalhes) por e-mail e WhatsApp. Você também vê tudo na área do parceiro.'],
  ['Sou obrigado a atender todos os pedidos?', 'Não. Se não puder atender, é só avisar para encaminharmos a outro profissional. Quando aceitar, pedimos que responda o cliente o quanto antes.'],
  ['Existe exclusividade?', 'Não. Você continua com seus clientes e canais de sempre. E o cliente pode receber contato de mais de um profissional para comparar propostas.'],
  ['Preciso ter CNPJ?', 'Não. Técnicos autônomos, MEIs e empresas podem se cadastrar. O CNPJ é opcional.'],
  ['Quanto tempo leva a aprovação?', 'Analisamos os dados e poderemos entrar em contato pelo WhatsApp para confirmar serviços e regiões atendidas. Não há prazo garantido de aprovação. Depois de aprovado, enviamos o acesso à área do parceiro pelo WhatsApp informado no cadastro.'],
  ['Quantos pedidos vou receber?', 'Depende da procura na sua região e dos serviços que você faz. O Clima16 está começando em Ribeirão Preto, então não prometemos um volume mínimo.']
];

function renderPartnerFaq() {
  return `
        <div class="max-w-2xl mx-auto mt-16">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-navy text-center mb-6">Dúvidas de quem quer ser parceiro</h2>
          <div class="space-y-3">
            ${PARTNER_FAQ.map(([q, a]) => `
            <details class="group bg-white border border-slate-200 rounded-2xl p-5 open:shadow-subtle">
              <summary class="flex items-center justify-between cursor-pointer list-none font-bold text-navy text-base">
                <span class="pr-4">${q}</span>
                <span class="text-slate-400 group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
              </summary>
              <p class="mt-3 text-sm text-slate-600 leading-relaxed">${a}</p>
            </details>`).join('')}
          </div>
          <p class="text-sm text-slate-500 text-center mt-6">Outra dúvida? Escreva para <a href="mailto:contato@clima16.com.br" class="text-brand-blue font-semibold hover:underline">contato@clima16.com.br</a>.</p>
        </div>`;
}

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

          <ul class="mt-6 flex flex-wrap justify-center gap-2 text-xs sm:text-sm font-semibold" aria-label="Condições da parceria">
            <li class="bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full">✓ Cadastro gratuito</li>
            <li class="bg-white/10 text-slate-200 border border-white/20 px-3 py-1.5 rounded-full">✓ Sem mensalidade</li>
            <li class="bg-white/10 text-slate-200 border border-white/20 px-3 py-1.5 rounded-full">✓ Sem exclusividade</li>
            <li class="bg-white/10 text-slate-200 border border-white/20 px-3 py-1.5 rounded-full">✓ CNPJ não obrigatório</li>
          </ul>

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

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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

          <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-subtle text-left">
            <div class="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">Painel do parceiro</h3>
            <p class="text-sm text-slate-600">Depois de aprovado, você acompanha os pedidos encaminhados a você e marca o andamento de cada um na <a href="/parceiro" class="text-brand-blue font-semibold hover:underline">área do parceiro</a>.</p>
          </div>
        </div>

        <!-- Embedded Partner Registration Form -->
        <div id="cadastro-parceiro-form" class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-subtle max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-navy">Formulário de Cadastro de Parceiro</h3>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Analisaremos seu cadastro e poderemos falar com você pelo WhatsApp para confirmar serviços e regiões atendidas. Não há prazo garantido de aprovação.</p>
          </div>

          <form id="dedicated-partner-form" onsubmit="return false;" class="space-y-4 text-left">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="dp-name" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nome ou Nome da Empresa <span class="text-rose-500">*</span></label>
              <input type="text" id="dp-name" placeholder="Ex: Climatização Silva" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm font-medium" required />
              </div>

              <div>
                <label for="dp-phone" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">WhatsApp <span class="text-rose-500">*</span></label>
              <input type="tel" id="dp-phone" placeholder="(16) 99999-9999" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm font-medium" required />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="dp-email" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
              <input type="email" id="dp-email" placeholder="seuemail@exemplo.com" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm" />
              </div>

              <div>
                <label for="dp-city" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Cidade</label>
              <input type="text" id="dp-city" value="Ribeirão Preto – SP" class="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Serviços que você executa: <span class="text-rose-500">*</span></label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Instalação" class="dp-service-check text-brand-blue rounded" />
                  <span>Instalação</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Manutenção" class="dp-service-check text-brand-blue rounded" />
                  <span>Manutenção</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Higienização" class="dp-service-check text-brand-blue rounded" />
                  <span>Higienização</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Comercial" class="dp-service-check text-brand-blue rounded" />
                  <span>Comercial</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Residencial" class="dp-service-check text-brand-blue rounded" />
                  <span>Residencial</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" value="Outros" class="dp-service-check text-brand-blue rounded" />
                  <span>Outros</span>
                </label>
              </div>
            </div>

            <div>
              <label for="dp-cnpj" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">CNPJ <span class="text-slate-400 font-normal lowercase">(opcional)</span></label>
              <input type="text" id="dp-cnpj" placeholder="00.000.000/0001-00" class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm" />
            </div>

            <div>
              <label for="dp-bio" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Conte brevemente sobre seu trabalho</label>
              <textarea id="dp-bio" maxlength="1000" rows="3" placeholder="Tempo de atuação, marcas atendidas, equipamentos..." class="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm"></textarea>
            </div>

            <div>
              <label for="dp-coverage" class="block text-xs font-semibold text-slate-700 mb-1">Bairros ou regiões que atende (opcional)</label>
              <textarea id="dp-coverage" maxlength="400" rows="2" placeholder="Ex.: Zona Sul, Centro e Bonfim Paulista" class="w-full px-4 py-2 border-2 border-slate-200 rounded-xl text-sm"></textarea>
              <p class="text-xs text-slate-500 mt-1">Informe onde consegue atender. Confirmaremos a cobertura antes de encaminhar pedidos.</p>
            </div>
            ${HONEYPOT_HTML('dp-website')}
            ${CONSENT_HTML('dp-consent')}
            <p id="dp-error" class="text-sm text-rose-600 hidden" role="alert"></p>

            <div id="dp-success" class="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium hidden">
              ✓ Recebemos seu cadastro! Poderemos falar com você pelo WhatsApp para confirmar as informações. Se aprovado, o acesso à área do parceiro também chega por lá.
            </div>

            <button type="button" id="dp-submit-btn" class="w-full gradient-brand text-white font-extrabold text-base py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
              Cadastrar interesse
            </button>
            <p class="text-xs text-center text-slate-500">Gratuito, sem mensalidade e sem exclusividade. Você pode pedir para sair a qualquer momento.</p>
          </form>
        </div>

        ${renderPartnerFaq()}

      </section>

    </div>
  `;
}

export function initPartnersEvents() {
  const submitBtn = document.getElementById('dp-submit-btn');
  submitBtn?.addEventListener('click', async () => {
    const ok = await submitPartner({
      name: document.getElementById('dp-name')?.value,
      phone: document.getElementById('dp-phone')?.value,
      email: document.getElementById('dp-email')?.value,
      city: document.getElementById('dp-city')?.value,
      cnpj: document.getElementById('dp-cnpj')?.value,
      bio: document.getElementById('dp-bio')?.value,
      coverage: document.getElementById('dp-coverage')?.value,
      services: Array.from(document.querySelectorAll('.dp-service-check:checked')).map(cb => cb.value),
      consent: !!document.getElementById('dp-consent')?.checked,
      website: document.getElementById('dp-website')?.value || ''
    }, submitBtn, document.getElementById('dp-error'));
    if (!ok) return;
    document.getElementById('dp-success')?.classList.remove('hidden');
    document.getElementById('dedicated-partner-form')?.reset();
  });
}
