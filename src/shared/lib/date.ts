// Форматирование дат — единая точка вместо дублей toLocaleDateString.
//
// Все даты выводятся по московскому времени: клуб и турниры в Ставрополе.
// Без явного timeZone браузер посетителя в другом поясе сдвигал матч
// в 00:30 МСК на предыдущий день, а дата «2026-09-03» (полночь UTC)
// у пользователя западнее Гринвича становилась 2 сентября.

export const CLUB_TZ = 'Europe/Moscow'

/**
 * Даты в базе записаны без пояса («2026-08-20T17:00:00», «2026-08-18») —
 * это московское время клуба. new Date() прочитал бы их по поясу браузера,
 * поэтому без явного смещения дописываем +03:00 (в Москве нет перехода
 * на летнее время). Дата без времени — полдень, чтобы не съехать на сутки.
 */
export function parseClubDate(iso: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(`${iso}T12:00:00+03:00`)
  if (/T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(iso)) return new Date(`${iso}+03:00`)
  return new Date(iso)
}

/** «05 сентября» */
export function formatDay(iso: string): string {
  return parseClubDate(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', timeZone: CLUB_TZ })
}

/** «05 сен 2026» */
export function formatShort(iso: string): string {
  return parseClubDate(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', timeZone: CLUB_TZ })
}

/** «05 сен» */
export function formatDayShort(iso: string): string {
  return parseClubDate(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', timeZone: CLUB_TZ })
}

/** «05 сентября 2026» */
export function formatFull(iso: string): string {
  return parseClubDate(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', timeZone: CLUB_TZ })
}

/** «13:00» */
export function formatTime(iso: string): string {
  return parseClubDate(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: CLUB_TZ })
}

/** Год по московскому времени: «2026». */
export function formatYear(iso: string): string {
  return parseClubDate(iso).toLocaleDateString('ru-RU', { year: 'numeric', timeZone: CLUB_TZ })
}

/** «15 мая — 30 июня» */
export function formatRange(startIso: string, endIso: string): string {
  return `${formatDay(startIso)} — ${formatDay(endIso)}`
}

/** «15 мая 2026 — 30 июня 2026» */
export function formatRangeFull(startIso: string, endIso: string): string {
  return `${formatFull(startIso)} — ${formatFull(endIso)}`
}
