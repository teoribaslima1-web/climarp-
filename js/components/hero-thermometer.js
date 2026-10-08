/**
 * Clima16 - Termômetro animado do hero: desce de 32° até 16° (a marca) e repete.
 */
const T_HOT = 32;
const T_COOL = 16;
const FALL_MS = 4600;
const HOLD_MS = 5200;
const RISE_MS = 900;

function colorFor(t) {
  const k = (t - T_COOL) / (T_HOT - T_COOL); // 0 = frio, 1 = quente
  const hue = 195 - k * 180;
  return `hsl(${hue.toFixed(0)}, 90%, 50%)`;
}

export function initHeroThermometer() {
  const fill = document.getElementById('thermo-fill');
  const bulb = document.getElementById('thermo-bulb');
  const display = document.getElementById('thermo-display');
  const status = document.getElementById('thermo-status');
  if (!fill) return;

  function paint(t) {
    const pct = 8 + ((t - T_COOL) / (T_HOT - T_COOL)) * 92;
    const color = colorFor(t);
    fill.style.height = `${pct.toFixed(1)}%`;
    fill.style.backgroundColor = color;
    if (bulb) bulb.style.backgroundColor = color;
    const n = Math.round(t);
    if (display) display.textContent = `${n}°C`;
    if (status) status.textContent = n <= T_COOL ? 'Ambiente em 16°: conforto' : 'Resfriando…';
  }

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { paint(T_COOL); return; }

  const total = FALL_MS + HOLD_MS + RISE_MS;
  const start = performance.now();
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);

  function frame(now) {
    if (!document.body.contains(fill)) return; // view trocada: para o loop
    const t = (now - start) % total;
    let temp;
    if (t < FALL_MS) temp = T_HOT - (T_HOT - T_COOL) * easeOut(t / FALL_MS);
    else if (t < FALL_MS + HOLD_MS) temp = T_COOL;
    else temp = T_COOL + (T_HOT - T_COOL) * ((t - FALL_MS - HOLD_MS) / RISE_MS);
    paint(temp);
    requestAnimationFrame(frame);
  }
  paint(T_HOT);
  requestAnimationFrame(frame);
}
