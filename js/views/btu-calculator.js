/**
 * Clima16 - Página /calculadora-de-btus (SEO + conversão)
 */
import { renderBtuCalculator, initBtuCalculator } from '../components/btu-calculator.js';
import { calcBtu, formatBtu } from '../btu.js';
import { initReveal } from '../reveal.js';

export function renderBtuCalculatorView() {
  const rows = [8, 12, 15, 20, 25, 30, 40, 50].map((area) => {
    const r = calcBtu({ area, sun: 'pouco', people: 2, appliances: 1 });
    const sunny = calcBtu({ area, sun: 'dia', people: 2, appliances: 1 });
    return `<tr class="border-t border-slate-100"><td class="py-2.5 px-4 font-semibold text-slate-800">${area} m²</td><td class="py-2.5 px-4 text-slate-700">${formatBtu(r.recommended)} BTUs</td><td class="py-2.5 px-4 text-slate-700">${sunny.multi ? '60.000+' : formatBtu(sunny.recommended)} BTUs</td></tr>`;
  }).join('');

  return `
    <section class="bg-gradient-to-b from-white to-slate-50 pt-10 pb-8 sm:pt-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full">Ferramenta gratuita</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-navy mt-3 tracking-tight">Calculadora de BTUs para ar-condicionado em Ribeirão Preto</h1>
        <p class="text-base text-muted-rp mt-3 max-w-2xl mx-auto">Descubra a potência ideal para o seu ambiente considerando o calor de Ribeirão Preto e peça orçamento já com o aparelho certo.</p>
      </div>
    </section>

    <section class="pb-14 bg-slate-50">
      <div class="px-4 sm:px-6 lg:px-8">${renderBtuCalculator()}</div>
    </section>

    <section class="py-14 bg-white border-t border-slate-100">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-extrabold text-navy mb-3">Como calculamos</h2>
        <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
          Usamos a regra prática do mercado: cerca de 600 BTUs por m², ajustada pela insolação do ambiente, mais 600 BTUs para cada pessoa além da primeira e 600 BTUs para cada aparelho que gera calor. O resultado é arredondado para o próximo tamanho comercial (9.000, 12.000, 18.000, 24.000, 30.000 BTUs ou mais).
        </p>

        <h2 class="text-2xl font-extrabold text-navy mt-10 mb-3">Referência rápida</h2>
        <p class="text-sm text-slate-600 mb-4">Considerando 2 pessoas e 1 aparelho eletrônico no ambiente.</p>
        <div class="overflow-x-auto rounded-2xl border border-slate-200">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr><th class="py-3 px-4">Ambiente</th><th class="py-3 px-4">Pouco sol</th><th class="py-3 px-4">Sol o dia todo</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="text-xs text-slate-500 mt-3">Valores estimados. A avaliação de um técnico considera pé-direito, janelas, isolamento e andar.</p>

        <div class="mt-10 p-6 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
          <h3 class="text-lg font-bold text-navy">Já sabe a potência? Peça seu orçamento.</h3>
          <a href="#/formulario" class="inline-block mt-3 gradient-brand text-white font-bold text-sm px-6 py-3 rounded-xl shadow">Solicitar orçamento grátis</a>
        </div>
      </div>
    </section>`;
}

export function initBtuCalculatorView() {
  initBtuCalculator();
  initReveal();
}
