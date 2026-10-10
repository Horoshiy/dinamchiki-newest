/**
 * Инициалы для плейсхолдера вместо фото: «Третьяков Дмитрий Михайлович» → «ТД».
 * Первые буквы первых двух слов — так у игроков и тренеров одинаково.
 */
export function initials(fullName: string | null | undefined): string {
  const parts = (fullName ?? '').split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}
