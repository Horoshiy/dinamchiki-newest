/**
 * Русское склонение существительного при числительном.
 *
 *   plural(1,  ['команда', 'команды', 'команд'])  → 'команда'
 *   plural(3,  ['команда', 'команды', 'команд'])  → 'команды'
 *   plural(12, ['игрок', 'игрока', 'игроков'])    → 'игроков'
 *
 * Нужно потому, что счётчики на сайте писали «1 команд · 0 игроков».
 */
export function plural(n: number, forms: readonly [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (last > 1 && last < 5) return forms[1]
  if (last === 1) return forms[0]
  return forms[2]
}

/** То же, но сразу с числом: `2 команды`. */
export function withPlural(n: number, forms: readonly [string, string, string]): string {
  return `${n} ${plural(n, forms)}`
}
