/**
 * Российский телефон: +7 и ровно десять цифр.
 *
 * Раньше форма принимала любую строку из шести и более символов «похожих
 * на телефон» — в базу попадали и «8 (928) 320», и «позвоните после шести».
 * Тренер по такому номеру не перезвонит, а заявка выглядит принятой.
 *
 * Здесь только чистые функции: маска ввода, нормализация и проверка.
 */

/** Максимум цифр номера после кода страны. */
const NSN_LENGTH = 10

/**
 * Оставить от произвольного ввода только значащие цифры номера (без «7»).
 *
 * Понимает все привычные записи: «8 928…», «+7 928…», «7928…», «928…»,
 * а также вставку из буфера со скобками и дефисами.
 */
export function phoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('8')) d = d.slice(1)
  else if (d.startsWith('7')) d = d.slice(1)
  return d.slice(0, NSN_LENGTH)
}

/** Показать номер как «+7 (928) 320-04-94», дописывая только введённое. */
export function formatPhone(raw: string): string {
  const d = phoneDigits(raw)
  if (!d) return ''
  let out = '+7 ('
  out += d.slice(0, 3)
  if (d.length >= 3) out += ') '
  if (d.length > 3) out += d.slice(3, 6)
  if (d.length > 6) out += '-' + d.slice(6, 8)
  if (d.length > 8) out += '-' + d.slice(8, 10)
  return out
}

/** Номер введён полностью. */
export function isPhoneComplete(raw: string): boolean {
  return phoneDigits(raw).length === NSN_LENGTH
}

/** Каноничный вид для бэкенда и tel:-ссылок — «+79283200494». */
export function normalizePhone(raw: string): string {
  const d = phoneDigits(raw)
  return d.length === NSN_LENGTH ? `+7${d}` : ''
}
