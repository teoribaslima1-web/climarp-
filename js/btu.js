/**
 * Clima16 - Cálculo de BTUs (estimativa)
 * base = m² x 600, x fator de sol, + 600 por pessoa além da primeira, + 600 por aparelho que gera calor.
 */
export const COMMERCIAL_SIZES = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];

export const SUN_OPTIONS = [
  { id: 'pouco', label: 'Pouco sol', hint: 'Sombra / andar protegido', factor: 1.0 },
  { id: 'manha', label: 'Sol da manhã', hint: 'Esquenta até o meio-dia', factor: 1.1 },
  { id: 'tarde', label: 'Sol da tarde', hint: 'Esquenta mais no fim do dia', factor: 1.2 },
  { id: 'dia', label: 'Sol o dia todo', hint: 'Cobertura ou parede quente', factor: 1.3 }
];

export function formatBtu(n) {
  return n.toLocaleString('pt-BR');
}

export function calcBtu({ area, sun = 'pouco', people = 1, appliances = 0 }) {
  const a = Number(area);
  if (!Number.isFinite(a) || a < 3 || a > 500) return null;
  const factor = (SUN_OPTIONS.find((s) => s.id === sun) || SUN_OPTIONS[0]).factor;
  const p = Math.max(1, Math.min(50, Math.floor(Number(people) || 1)));
  const e = Math.max(0, Math.min(50, Math.floor(Number(appliances) || 0)));
  const raw = Math.round(a * 600 * factor + (p - 1) * 600 + e * 600);
  const size = COMMERCIAL_SIZES.find((s) => s >= raw) || null;
  const multi = size === null; // acima de 60.000: precisa de mais de um aparelho/projeto
  const recommended = size || COMMERCIAL_SIZES[COMMERCIAL_SIZES.length - 1];
  // Rótulo compatível com as opções de capacidade do formulário
  const formLabel = recommended <= 24000 ? `${formatBtu(recommended)} BTUs` : '30.000+ BTUs';
  return { raw, recommended, multi, formLabel, factor, people: p, appliances: e, area: a };
}

export function describeCalc(input, result) {
  const sun = (SUN_OPTIONS.find((s) => s.id === input.sun) || SUN_OPTIONS[0]).label.toLowerCase();
  return `Calculadora Clima16: ${result.area} m², ${sun}, ${result.people} pessoa(s), ${result.appliances} aparelho(s) → ${formatBtu(result.recommended)} BTUs`;
}
