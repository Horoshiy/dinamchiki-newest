/**
 * Инициалы для плейсхолдера вместо фото: «Третьяков Дмитрий Михайлович» → «ТД».
 * Первые буквы первых двух слов — так у игроков и тренеров одинаково.
 */
export function initials(fullName: string | null | undefined): string {
  const parts = (fullName ?? '').split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/**
 * Как обратиться в тексте: «Третьяков Дмитрий Михайлович» → «Дмитрий Михайлович».
 * ФИО в базе хранится фамилией вперёд, и `fullName.split(' ')[0]` давал
 * «Хотите тренироваться у Третьяков?». Не три слова — отдаём как есть.
 */
export function givenName(fullName: string): string {
  const parts = fullName.split(/\s+/).filter(Boolean)
  return parts.length === 3 ? `${parts[1]} ${parts[2]}` : fullName.trim()
}
