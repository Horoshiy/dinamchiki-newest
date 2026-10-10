// =============================================================================
// Единая точка, откуда весь сайт берёт контакты клуба.
//
// Раньше их было два независимых источника: захардкоженные константы в
// shared/config/club.ts (шапка, подвал, форма на главной, блок прямых
// контактов) и contactInfo из базы (страница «Контакты»). На «Контактах»
// это давало три телефона на одном экране: +7 (928) 320-04-94 в шапке
// и подвале против +7 (929) 855-01-76 в блоке контактной информации.
//
// Теперь источник правды один — база. Константы из club.ts остаются
// аварийным фолбэком: если GraphQL недоступен, телефон на сайте всё равно
// есть, а не пропадает вместе с бэкендом.
// =============================================================================
import { computed } from 'vue'
import { useContactInfoQuery } from '@/shared/api/composables'
import type { ContactInfo } from './contact.types'
import {
  CLUB_PHONE_DISPLAY,
  CLUB_PHONE_E164,
  CLUB_TELEGRAM,
  CLUB_WHATSAPP,
  CLUB_EMAIL,
  CLUB_MAX_HREF,
  CLUB_WORKING_HOURS,
} from '@/shared/config/club'

/** «79187610009» → «+7 (918) 761-00-09». Неразобранный номер отдаём как есть. */
export function formatRuPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const m = /^[78](\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits)
  return m ? `+7 (${m[1]}) ${m[2]}-${m[3]}-${m[4]}` : raw
}

/** «https://t.me/Dinamchiki_DFC» и «@Dinamchiki_DFC» → «Dinamchiki_DFC». */
export function telegramUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '')
    .replace(/^@/, '')
}

/** Канал связи — одна строка в любом списке контактов на сайте. */
export interface ContactChannel {
  id: 'phone' | 'whatsapp' | 'telegram' | 'max' | 'email'
  /** Название канала: «Телефон», «WhatsApp»… */
  label: string
  /** Что показать: номер, @ник, адрес почты. */
  value: string
  href: string
  /** Открывать в новой вкладке (мессенджеры). */
  external: boolean
}

/**
 * Все контакты клуба из contactInfo; чего нет в базе — из констант club.ts.
 *
 * Чистая функция: её зовёт и composable, и ContactInfoBlock, который
 * получает contactInfo пропом. Раньше блок собирал ссылки сам, и tel:
 * для «8 928…» у него выходил другим, чем в шапке.
 */
export function resolveContacts(info: ContactInfo | null) {
  const phoneDisplay = info ? info.phoneFormatted || formatRuPhone(info.phone) : CLUB_PHONE_DISPLAY
  const phoneHref = `tel:+${(info?.phone ?? CLUB_PHONE_E164).replace(/\D/g, '').replace(/^8/, '7')}`

  const whatsappDigits = (info?.whatsapp || CLUB_WHATSAPP).replace(/\D/g, '')
  const whatsappDisplay = formatRuPhone(whatsappDigits)
  const whatsappHref = `https://wa.me/${whatsappDigits}`

  const telegramName = telegramUsername(info?.telegram || CLUB_TELEGRAM)
  const telegramHandle = `@${telegramName}`
  const telegramHref = `https://t.me/${telegramName}`

  /** Ссылка на чат в MAX. Пусто — канал MAX не показываем. */
  const maxHref = info?.socials?.max?.trim() || CLUB_MAX_HREF

  const email = info?.email || CLUB_EMAIL
  const emailHref = `mailto:${email}`

  const workingHours = info?.workingHours || CLUB_WORKING_HOURS

  /** Порядок один на весь сайт: звонок, мессенджеры, почта. */
  const channels: ContactChannel[] = [
    { id: 'phone', label: 'Телефон', value: phoneDisplay, href: phoneHref, external: false },
    { id: 'whatsapp', label: 'WhatsApp', value: whatsappDisplay, href: whatsappHref, external: true },
    { id: 'telegram', label: 'Telegram', value: telegramHandle, href: telegramHref, external: true },
    ...(maxHref
      ? [{ id: 'max', label: 'MAX', value: 'Написать в MAX', href: maxHref, external: true } as const]
      : []),
    { id: 'email', label: 'Email', value: email, href: emailHref, external: false },
  ]

  return {
    phoneDisplay,
    phoneHref,
    whatsappDisplay,
    whatsappHref,
    telegramHandle,
    telegramHref,
    maxHref,
    email,
    emailHref,
    workingHours,
    channels,
  }
}

export function useClubContacts() {
  const { data } = useContactInfoQuery()

  const info = computed<ContactInfo | null>(() => {
    const d = data.value as { contactInfo?: ContactInfo } | null
    return d?.contactInfo ?? null
  })

  const all = computed(() => resolveContacts(info.value))
  const pick = <K extends keyof ReturnType<typeof resolveContacts>>(k: K) => computed(() => all.value[k])

  return {
    info,
    phoneDisplay: pick('phoneDisplay'),
    phoneHref: pick('phoneHref'),
    whatsappDisplay: pick('whatsappDisplay'),
    whatsappHref: pick('whatsappHref'),
    telegramHandle: pick('telegramHandle'),
    telegramHref: pick('telegramHref'),
    maxHref: pick('maxHref'),
    email: pick('email'),
    emailHref: pick('emailHref'),
    workingHours: pick('workingHours'),
    channels: pick('channels'),
  }
}
