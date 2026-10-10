// =============================================================================
// Цифры о клубе для текстов сайта: мета-описаний, героя, «Клуба в цифрах».
//
// Раньше «17 групп», «208 юных футболистов», «11 лет», «от 4 500 ₽» и
// «стаж 9–22» были вписаны в шаблоны и устаревали по одному: цена в
// описании главной уже разошлась с «Сведениями». Теперь всё считается
// из одного источника — «Сведений» (sveden.data.ts) и списка групп из CRM.
// =============================================================================
import { EDU_PROGRAMS, EDU_TOTALS, ORG, TEACHERS } from '@/entities/sveden/sveden.data'
import { plural, withPlural } from '@/shared/lib/plural'

/** Полных лет с регистрации клуба на дату `now`. */
export function clubYears(now: Date = new Date()): number {
  const [d, m, y] = ORG.regDate.split('.').map(Number)
  let years = now.getFullYear() - y
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) years--
  return years
}

/** «11 лет», «21 год». */
export function clubYearsLabel(n: number = clubYears()): string {
  return plural(n, ['год', 'года', 'лет'])
}

/** Учащихся по всем программам — та же цифра, что в «Сведениях». */
export const STUDENTS_TOTAL: number = EDU_TOTALS.students

/** Самый дешёвый абонемент (частичный, 8 занятий). */
export const MIN_PRICE: number = Math.min(...EDU_PROGRAMS.map((p) => p.pricePartial))

/** Минимальный и максимальный стаж тренеров; ноль — «не передан», не учитываем. */
export const STAFF_EXPERIENCE = (() => {
  const years = TEACHERS.map((t) => t.experience).filter((n) => n > 0)
  return { min: Math.min(...years), max: Math.max(...years) }
})()

/** «от 9 до 22 лет». */
export const STAFF_EXPERIENCE_TEXT =
  `от ${STAFF_EXPERIENCE.min} до ${STAFF_EXPERIENCE.max} ${plural(STAFF_EXPERIENCE.max, ['года', 'лет', 'лет'])}`

/** «3 500 ₽» с неразрывными пробелами. */
export function formatRub(n: number): string {
  return `${n.toLocaleString('ru-RU').replace(/\s/g, '\u00a0')}\u00a0₽`
}

/**
 * Описание клуба для главной. Число групп приходит из CRM; пока список
 * не загружен (или упал), фраза обходится без числа, а не врёт старым.
 */
export function clubDescription(groups?: number): string {
  const groupsText = groups ? withPlural(groups, ['группа', 'группы', 'групп']) : 'группы'
  return (
    `Детский футбольный клуб «Динамчики» в Ставрополе: ${groupsText} для детей 3–14 лет ` +
    'в разных районах города, занятия по образовательной лицензии. ' +
    `Абонемент от ${formatRub(MIN_PRICE)}. Первая тренировка — бесплатно.`
  )
}
