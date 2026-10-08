/**
 * Clima16 - Faixa "Agora em Ribeirão Preto"
 * Temperatura atual via Open-Meteo (gratuita, sem chave). Se a API falhar, a faixa não aparece.
 */
const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-21.1775&longitude=-47.8103&current=temperature_2m&timezone=America%2FSao_Paulo';
const CACHE_KEY = 'clima16_weather';
const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 4000;

function readCache() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (c && Date.now() - c.t < CACHE_MS && Number.isFinite(c.temp)) return c.temp;
  } catch { /* ignore */ }
  return null;
}

function writeCache(temp) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), temp })); } catch { /* ignore */ }
}

async function fetchTemperature() {
  const cached = readCache();
  if (cached !== null) return cached;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, { signal: controller.signal });
    if (!res.ok) throw new Error('weather_http');
    const data = await res.json();
    const temp = data && data.current && data.current.temperature_2m;
    if (typeof temp !== 'number' || !Number.isFinite(temp) || temp < -10 || temp > 55) throw new Error('weather_invalid');
    writeCache(temp);
    return temp;
  } finally {
    clearTimeout(timer);
  }
}

function messageFor(temp) {
  if (temp >= 32) return 'Dia de ar-condicionado funcionando 100%.';
  if (temp >= 28) return 'Calor de Ribeirão: hora de checar seu aparelho.';
  if (temp >= 22) return 'Boa hora para revisar o ar-condicionado.';
  return 'Dia ameno: ótimo para agendar manutenção.';
}

export async function initWeatherStrip(mount) {
  if (!mount) return;
  try {
    const temp = await fetchTemperature();
    const rounded = Math.round(temp);
    mount.innerHTML = `
      <div class="bg-navy text-white text-xs sm:text-[13px]" role="status">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center gap-x-2 gap-y-0.5 flex-wrap text-center">
          <span class="inline-flex items-center gap-1.5 font-semibold">
            <svg class="w-3.5 h-3.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>
            Agora em Ribeirão Preto: <span class="text-cyan-300 font-extrabold">${rounded} °C</span>
          </span>
          <span class="hidden sm:inline text-slate-300">· ${messageFor(rounded)}</span>
        </div>
      </div>`;
  } catch {
    mount.innerHTML = '';
  }
}
