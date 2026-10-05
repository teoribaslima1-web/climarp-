/**
 * ClimaRP - FAQ Component (Accordion)
 * Clear, transparent answers for consumer confidence.
 */
export function renderFAQ() {
  const faqs = [
    {
      q: 'Solicitar orçamento pelo ClimaRP tem custo?',
      a: 'A solicitação feita pelo consumidor através da plataforma é totalmente gratuita e sem compromisso.'
    },
    {
      q: 'O ClimaRP realiza o serviço?',
      a: 'O ClimaRP atua como uma plataforma digital que facilita a conexão entre clientes e profissionais ou empresas de climatização da região. O serviço é prestado diretamente pelo profissional ou empresa parceira escolhida por você.'
    },
    {
      q: 'Sou obrigado a contratar?',
      a: 'Não. O envio de uma solicitação de orçamento não gera nenhuma obrigação de contratação. Você recebe os contatos, avalia as propostas e decide livremente se deseja fechar o serviço.'
    },
    {
      q: 'Quais serviços posso solicitar?',
      a: 'Você pode solicitar instalação de novos aparelhos, manutenção preventiva ou corretiva, limpeza profunda e higienização antibacteriana, avaliação de falta de refrigeração, conserto de vazamentos e gotejamentos, e recarga de fluido refrigerante.'
    },
    {
      q: 'Vocês atendem quais cidades?',
      a: 'Na primeira fase, o foco operacional do ClimaRP é a cidade de Ribeirão Preto – SP (todos os bairros e distritos, como Bonfim Paulista). Outras cidades da região metropolitana poderão ser adicionadas futuramente.'
    },
    {
      q: 'Como os meus dados serão usados?',
      a: 'Seus dados são coletados única e exclusivamente para processar a solicitação e poderão ser compartilhados com profissionais ou empresas parceiras da região capacitados para responder ao seu pedido, em total conformidade com a LGPD e nossa Política de Privacidade.'
    }
  ];

  return `
    <section id="faq-section" class="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full">
            Dúvidas Frequentes
          </span>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mt-3">
            Tudo o que você precisa saber sobre o ClimaRP
          </h2>
          <p class="text-sm sm:text-base text-muted-rp mt-2">
            Transparência e clareza para você solicitar seu orçamento com total segurança.
          </p>
        </div>

        <div class="space-y-4" id="faq-accordion">
          ${faqs.map((item, idx) => `
            <div class="faq-item border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300">
              <button type="button" class="faq-trigger w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors focus:outline-none" aria-expanded="${idx === 0 ? 'true' : 'false'}">
                <span class="text-base sm:text-lg font-bold text-navy pr-4">${item.q}</span>
                <span class="faq-icon-wrapper w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 transition-transform duration-200 ${idx === 0 ? 'rotate-180 bg-blue-50 text-brand-blue' : ''}">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </button>
              <div class="faq-content ${idx === 0 ? '' : 'hidden'} px-5 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed bg-white border-t border-slate-100 pt-3">
                ${item.a}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Extra Help Box -->
        <div class="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 class="font-bold text-navy text-base">Ainda tem alguma dúvida?</h4>
            <p class="text-sm text-slate-600">Nossa equipe de suporte está à disposição para esclarecer tudo.</p>
          </div>
          <button onclick="window.location.hash='#formulario'; document.getElementById('orcamento-form')?.scrollIntoView({behavior:'smooth'});" class="gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow whitespace-nowrap">
            Fazer solicitação gratuita
          </button>
        </div>

      </div>
    </section>
  `;
}

export function initFAQEvents() {
  document.querySelectorAll('.faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const content = btn.parentElement.querySelector('.faq-content');
      const iconWrapper = btn.querySelector('.faq-icon-wrapper');

      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        content?.classList.add('hidden');
        iconWrapper?.classList.remove('rotate-180', 'bg-blue-50', 'text-brand-blue');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        content?.classList.remove('hidden');
        iconWrapper?.classList.add('rotate-180', 'bg-blue-50', 'text-brand-blue');
      }
    });
  });
}
