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

export function useClubContacts() {
  const { data } = useContactInfoQuery()

  const info = computed<ContactInfo | null>(() => {
    const d = data.value as { contactInfo?: ContactInfo } | null
    return d?.contactInfo ?? null
  })

  const phoneDisplay = computed(() => {
    const c = info.value
    if (!c) return CLUB_PHONE_DISPLAY
    return c.phoneFormatted || formatRuPhone(c.phone)
  })

  const phoneHref = computed(() => {
    const raw = info.value?.phone ?? CLUB_PHONE_E164
    const digits = raw.replace(/\D/g, '')
    return `tel:+${digits.replace(/^8/, '7')}`
  })

  const whatsappDigits = computed(() =>
    (info.value?.whatsapp ?? CLUB_WHATSAPP).replace(/\D/g, ''),
  )
  const whatsappDisplay = computed(() => formatRuPhone(whatsappDigits.value))
  const whatsappHref = computed(() => `https://wa.me/${whatsappDigits.value}`)

  const telegramName = computed(() => telegramUsername(info.value?.telegram ?? CLUB_TELEGRAM))
  const telegramHandle = computed(() => `@${telegramName.value}`)
  const telegramHref = computed(() => `https://t.me/${telegramName.value}`)

  /** Ссылка на чат в MAX. Пусто — блок MAX не показываем. */
  const maxHref = computed(() => info.value?.socials?.max?.trim() || CLUB_MAX_HREF)

  const email = computed(() => info.value?.email ?? CLUB_EMAIL)
  const emailHref = computed(() => `mailto:${email.value}`)

  const workingHours = computed(() => info.value?.workingHours || CLUB_WORKING_HOURS)

  return {
    info,
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
  }
}
