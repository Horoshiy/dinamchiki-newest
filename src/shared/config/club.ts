// =============================================================================
// Единый источник правды по контактам клуба.
//
// Телефон и email — реальные, сверены с действующим сайтом dinamchiki.ru:
// именно этот номер указан там в подразделах «Основные сведения»,
// «Руководство», «Вакантные места» и «Организация питания».
//
// Telegram для связи и Telegram-канал — это РАЗНЫЕ адреса, не путать:
// @Dinamchiki_DFC — личка для вопросов и записи, t.me/dinamchiki — канал.
// WhatsApp живёт на отдельном номере, не на клубном телефоне.
//
// Раньше телефон был продублирован в трёх местах с тремя разными номерами
// (шапка, моки контактов, JSON-LD в index.html). Теперь — только отсюда.
// =============================================================================

/**
 * ВАЖНО: с 03.09.2026 это НЕ источник правды, а аварийный фолбэк.
 * Весь сайт берёт контакты через useClubContacts() из entities/contact —
 * то есть из базы. Значения ниже подставляются, только если GraphQL молчит.
 * Правьте контакты в админке, а не здесь.
 */

/** Телефон в международном формате — для tel:, WhatsApp и JSON-LD. */
export const CLUB_PHONE_E164 = '+79283200494'

/** Телефон для отображения. */
export const CLUB_PHONE_DISPLAY = '+7 (928) 320-04-94'

/** href для кнопки звонка. */
export const CLUB_PHONE_HREF = `tel:${CLUB_PHONE_E164}`

/**
 * Текст для посетителя, когда сайт не смог получить данные. Технический
 * error.message («Failed to fetch», «Response not successful…») родителю
 * ничего не говорит — а телефон даёт выход.
 */
export const LOAD_ERROR_HINT =
  `Сайт временно не получает данные. Обновите страницу через минуту или позвоните нам: ${CLUB_PHONE_DISPLAY.replace(/ /g, '\u00A0')}.`

/** Telegram для связи (username без @ используется в ссылке). */
export const CLUB_TELEGRAM = '@Dinamchiki_DFC'
export const CLUB_TELEGRAM_HREF = `https://t.me/${CLUB_TELEGRAM.replace('@', '')}`

/** Telegram-канал клуба — публикации, а не переписка. */
export const CLUB_TELEGRAM_CHANNEL = '@dinamchiki'
export const CLUB_TELEGRAM_CHANNEL_HREF = `https://t.me/${CLUB_TELEGRAM_CHANNEL.replace('@', '')}`

/**
 * WhatsApp — отдельный номер, НЕ клубный телефон.
 * Раньше выводился из CLUB_PHONE_E164, и кнопка вела в несуществующий чат.
 */
export const CLUB_WHATSAPP = '79187610009'
export const CLUB_WHATSAPP_DISPLAY = '+7 (918) 761-00-09'
export const CLUB_WHATSAPP_HREF = `https://wa.me/${CLUB_WHATSAPP}`

/** Email клуба. */
export const CLUB_EMAIL = 'info@dinamchiki.ru'
export const CLUB_EMAIL_HREF = `mailto:${CLUB_EMAIL}`

/** Куда ведут кнопки «Записаться» по всему сайту. */
export const SIGNUP_ROUTE = '/contacts#lead'

/** Часы работы офиса — фолбэк, если бэкенд не отдал contactInfo.workingHours. */
export const CLUB_WORKING_HOURS = '09:00 — 20:30'

/** Чат клуба в мессенджере MAX — фолбэк, если бэкенд не отдал socials.max. */
export const CLUB_MAX_HREF = 'https://max.ru/id2634093143_biz'
