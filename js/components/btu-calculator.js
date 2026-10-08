/**
 * Clima16 - Calculadora de BTUs (componente reutilizável: home + página própria)
 */
import { SUN_OPTIONS, calcBtu, describeCalc, formatBtu } from '../btu.js';
import { requestQuote } from '../prefill.js';

export function renderBtuCalculator() {
  return `
    <div id="btu-calc" class="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-5">

        <div class="lg:col-span-3 p-6 sm:p-8 space-y-6">
          <div>
            <label for="calc-area" class="block text-sm font-bold text-navy mb-2">Tamanho do ambiente (m²)</label>
            <div class="flex items-center gap-3">
              <input id="calc-area" type="number" inputmode="decimal" min="3" max="500" step="1" value="15" class="w-28 px-4 py-3 border-2 border-slate-200 focus:border-brand-blue focus:ring-0 rounded-xl text-slate-800 font-bold text-lg" />
              <input id="calc-area-range" type="range" min="5" max="80" step="1" value="15" class="flex-1 accent-brand-blue" aria-label="Ajustar tamanho do ambiente" />
            </div>
            <p class="text-xs text-slate-500 mt-1">Largura × comprimento do cômodo.</p>
          </div>

          <div>
            <div class="block text-sm font-bold text-navy mb-2">Quanto sol entra no ambiente?</div>
            <div class="grid grid-cols-2 gap-2" id="calc-sun">
              ${SUN_OPTIONS.map((s, i) => `
                <button type="button" data-sun="${s.id}" class="calc-sun-btn text-left p-3 rounded-xl border-2 ${i === 0 ? 'option-card-selected' : 'border-slate-200'} hover:border-brand-blue transition-all">
                  <div class="text-sm font-semibold text-slate-800">${s.label}</div>
                  <div class="text-[11px] text-slate-500">${s.hint}</div>
                </button>`).join('')}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div class="text-sm font-bold text-navy mb-2">Pessoas no ambiente</div>
              <div class="inline-flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                <button type="button" data-step="people:-1" class="calc-step w-11 h-11 text-xl font-bold text-slate-600 hover:bg-slate-50" aria-label="Menos uma pessoa">−</button>
                <output id="calc-people" class="w-12 text-center font-extrabold text-navy">2</output>
                <button type="button" data-step="people:1" class="calc-step w-11 h-11 text-xl font-bold text-slate-600 hover:bg-slate-50" aria-label="Mais uma pessoa">+</button>
              </div>
            </div>
            <div>
              <div class="text-sm font-bold text-navy mb-2">Aparelhos que esquentam</div>
              <div class="inline-flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                <button type="button" data-step="appliances:-1" class="calc-step w-11 h-11 text-xl font-bold text-slate-600 hover:bg-slate-50" aria-label="Menos um aparelho">−</button>
                <output id="calc-appliances" class="w-12 text-center font-extrabold text-navy">1</output>
                <button type="button" data-step="appliances:1" class="calc-step w-11 h-11 text-xl font-bold text-slate-600 hover:bg-slate-50" aria-label="Mais um aparelho">+</button>
              </div>
              <p class="text-xs text-slate-500 mt-1">TV, computador, geladeira, forno…</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 gradient-navy-dark text-white p-6 sm:p-8 flex flex-col justify-center text-center lg:text-left" aria-live="polite">
          <div class="text-xs font-bold uppercase tracking-wider text-cyan-300">Potência ideal estimada</div>
          <div id="calc-result" class="text-4xl sm:text-5xl font-extrabold mt-2 leading-none">12.000</div>
          <div class="text-lg font-bold text-cyan-200 mt-1">BTUs/h</div>
          <p id="calc-detail" class="text-xs text-slate-300 mt-3 leading-relaxed"></p>
          <button id="calc-cta" type="button" class="mt-6 w-full gradient-brand text-white font-bold text-sm sm:text-base px-5 py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
            Pedir orçamento para 12.000 BTUs
          </button>
          <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">
            Estimativa. Pé-direito, janelas, andar e isolamento mudam o resultado — o técnico confirma na visita.
          </p>
        </div>

      </div>
    </div>`;
}

export function initBtuCalculator() {
  const root = document.getElementById('btu-calc');
  if (!root) return;
  const state = { sun: 'pouco', people: 2, appliances: 1 };
  const areaInput = root.querySelector('#calc-area');
  const range = root.querySelector('#calc-area-range');
  const out = root.querySelector('#calc-result');
  const detail = root.querySelector('#calc-detail');
  const cta = root.querySelector('#calc-cta');
  let current = null;

  function update() {
    current = calcBtu({ area: areaInput.value, ...state });
    root.querySelector('#calc-people').textContent = state.people;
    root.querySelector('#calc-appliances').textContent = state.appliances;
    if (!current) {
      out.textContent = '—';
      detail.textContent = 'Informe um tamanho entre 3 e 500 m².';
      cta.disabled = true;
      cta.classList.add('opacity-50');
      cta.textContent = 'Informe o tamanho do ambiente';
      return;
    }
    cta.disabled = false;
    cta.classList.remove('opacity-50');
    out.textContent = formatBtu(current.recommended);
    detail.textContent = current.multi
      ? `Necessidade calculada de ${formatBtu(current.raw)} BTUs/h: acima de um aparelho comum. Um técnico pode indicar mais de um equipamento.`
      : `Necessidade calculada de ${formatBtu(current.raw)} BTUs/h → aparelho comercial de ${formatBtu(current.recommended)} BTUs.`;
    cta.textContent = `Pedir orçamento para ${current.multi ? '60.000+' : formatBtu(current.recommended)} BTUs`;
  }

  areaInput.addEventListener('input', () => {
    if (areaInput.value && Number(areaInput.value) >= 5 && Number(areaInput.value) <= 80) range.value = areaInput.value;
    update();
  });
  range.addEventListener('input', () => { areaInput.value = range.value; update(); });

  root.querySelectorAll('.calc-sun-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sun = btn.getAttribute('data-sun');
      root.querySelectorAll('.calc-sun-btn').forEach((b) => {
        b.classList.toggle('option-card-selected', b === btn);
        b.classList.toggle('border-slate-200', b !== btn);
      });
      update();
    });
  });

  root.querySelectorAll('.calc-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [key, delta] = btn.getAttribute('data-step').split(':');
      const min = key === 'people' ? 1 : 0;
      state[key] = Math.max(min, Math.min(20, state[key] + Number(delta)));
      update();
    });
  });

  cta.addEventListener('click', () => {
    if (!current) return;
    window.clima16Analytics?.track('btu_calculator_cta', { btu: current.recommended, area: current.area });
    requestQuote({
      service: 'instalacao',
      btu: current.formLabel,
      calc: describeCalc({ sun: state.sun }, current),
      btuText: current.multi ? '60.000+ BTUs' : `${formatBtu(current.recommended)} BTUs`
    });
  });

  update();
}
