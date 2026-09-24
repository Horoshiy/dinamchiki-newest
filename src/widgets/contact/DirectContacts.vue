<script setup lang="ts">
/**
 * Прямые способы связи: телефон, Telegram, MAX, WhatsApp, email.
 *
 * Используется там, где онлайн-заявка недоступна — вместо того чтобы
 * показывать посетителю благодарность за неотправленную форму.
 */
import IconPhone from '@/shared/ui/icons/IconPhone.vue'
import IconTelegram from '@/shared/ui/icons/IconTelegram.vue'
import IconWhatsApp from '@/shared/ui/icons/IconWhatsApp.vue'
import IconMax from '@/shared/ui/icons/IconMax.vue'
import IconMail from '@/shared/ui/icons/IconMail.vue'
import { useClubContacts } from '@/entities/contact/useClubContacts'

// Контакты — из базы, единым источником с шапкой и «Контактами».
const { phoneDisplay, phoneHref, whatsappHref, telegramHandle, telegramHref, maxHref, email, emailHref } =
  useClubContacts()
</script>

<template>
  <ul class="direct">
    <li>
      <a :href="phoneHref" class="direct__link">
        <IconPhone :size="18" />
        <span>{{ phoneDisplay }}</span>
      </a>
    </li>
    <li>
      <a :href="telegramHref" target="_blank" rel="noopener" class="direct__link">
        <IconTelegram :size="18" />
        <span>{{ telegramHandle }}</span>
      </a>
    </li>
    <li v-if="maxHref">
      <a :href="maxHref" target="_blank" rel="noopener" class="direct__link">
        <IconMax :size="18" />
        <span>Написать в MAX</span>
      </a>
    </li>
    <li>
      <a :href="whatsappHref" target="_blank" rel="noopener" class="direct__link">
        <IconWhatsApp :size="18" />
        <span>WhatsApp</span>
      </a>
    </li>
    <li>
      <a :href="emailHref" class="direct__link">
        <IconMail :size="18" />
        <span>{{ email }}</span>
      </a>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.direct {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2 $space-3;
  list-style: none;
  padding: 0;
  margin: 0;
}

.direct__link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-pill;
  color: $color-fg-strong;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  text-decoration: none;
  transition: border-color $transition-base, color $transition-base;

  &:hover {
    border-color: $color-brand-500;
    color: $color-brand-600;
  }

  &:focus-visible {
    outline: 2px solid $color-brand-500;
    outline-offset: 2px;
  }
}
</style>
