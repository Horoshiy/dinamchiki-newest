// Форматирование дат — единая точка вместо шести дублей toLocaleDateString.

/** «05 сентября» */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })
}

/** «05 сен 2026» */
export function formatShort(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** «05 сентября 2026» */
export function formatFull(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

/** «15 мая — 30 июня» */
export function formatRange(startIso: string, endIso: string): string {
  return `${formatDay(startIso)} — ${formatDay(endIso)}`
}
