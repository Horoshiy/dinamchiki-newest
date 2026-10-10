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
 *
 * Ведущие 7/8 — это код страны или «восьмёрка», только если номер набран
 * с «+» или целиком (11 цифр). Десять цифр без «+» — уже номер без кода:
 * городской «8652 12-34-56» начинается с восьмёрки, и отрезать её нельзя.
 * Одиночная 7/8 в пустом поле — начало набора «8 928…», её тоже съедаем.
 */
export function phoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (raw.trimStart().startsWith('+')) {
    if (d.startsWith('7')) d = d.slice(1)
    // «+7 8 928…» — восьмёрку по привычке набрали после кода страны.
    if (d.length === 11 && d.startsWith('8')) d = d.slice(1)
  } else if (d.length !== NSN_LENGTH && (d.startsWith('8') || d.startsWith('7'))) {
    d = d.slice(1)
  }
  return d.slice(0, NSN_LENGTH)
}

/**
 * Показать номер как «+7 (928) 320-04-94», дописывая только введённое.
 *
 * Разделитель «) » появляется только с четвёртой цифрой: если дописывать
 * его сразу после третьей, Backspace стирает пробел, маска возвращает его
 * обратно — и номер дальше «+7 (928) » не стереть.
 */
export function formatPhone(raw: string): string {
  const d = phoneDigits(raw)
  if (!d) return ''
  let out = '+7 (' + d.slice(0, 3)
  if (d.length > 3) out += ') ' + d.slice(3, 6)
  if (d.length > 6) out += '-' + d.slice(6, 8)
  if (d.length > 8) out += '-' + d.slice(8, 10)
  return out
}

/** Позиция, с которой в маске начинаются цифры номера (после «+7 (»). */
const MASK_PREFIX = 4

/**
 * Применить маску к полю ввода и сохранить позицию курсора.
 *
 * Просто присвоить el.value нельзя: курсор улетает в конец, и исправить
 * цифру в середине номера невозможно. Поэтому считаем, сколько цифр стояло
 * справа от курсора, и ставим его перед тем же числом цифр в маске.
 */
export function applyPhoneMask(el: HTMLInputElement): string {
  const raw = el.value
  const caret = el.selectionStart ?? raw.length
  const digitsAfter = raw.slice(caret).replace(/\D/g, '').length
  const masked = formatPhone(raw)
  el.value = masked

  if (typeof document !== 'undefined' && document.activeElement === el) {
    let pos = masked.length
    if (digitsAfter > 0) {
      pos = Math.min(MASK_PREFIX, masked.length)
      let seen = 0
      for (let i = masked.length - 1; i >= MASK_PREFIX; i--) {
        if (/\d/.test(masked[i]) && ++seen === digitsAfter) { pos = i; break }
      }
    }
    el.setSelectionRange(pos, pos)
  }
  return masked
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
