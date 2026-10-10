import type { Component } from 'vue'
import type { ContactChannel } from '@/entities/contact/useClubContacts'
import IconPhone from '@/shared/ui/icons/IconPhone.vue'
import IconWhatsApp from '@/shared/ui/icons/IconWhatsApp.vue'
import IconTelegram from '@/shared/ui/icons/IconTelegram.vue'
import IconMax from '@/shared/ui/icons/IconMax.vue'
import IconMail from '@/shared/ui/icons/IconMail.vue'

/** Иконка канала связи — одна на все списки контактов. */
export const CHANNEL_ICONS: Record<ContactChannel['id'], Component> = {
  phone: IconPhone,
  whatsapp: IconWhatsApp,
  telegram: IconTelegram,
  max: IconMax,
  email: IconMail,
}
