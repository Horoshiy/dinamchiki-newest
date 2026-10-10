<script setup lang="ts">
/**
 * Прямые способы связи: телефон, WhatsApp, Telegram, MAX, email.
 *
 * Используется там, где онлайн-заявка недоступна — вместо того чтобы
 * показывать посетителю благодарность за неотправленную форму.
 */
import { useClubContacts } from '@/entities/contact/useClubContacts'
import { CHANNEL_ICONS } from '@/widgets/contact/channel-icons'

// Контакты — из базы, единым источником с шапкой и «Контактами».
const { channels } = useClubContacts()

</script>

<template>
  <ul class="direct">
    <li v-for="c in channels" :key="c.id">
      <a
        :href="c.href"
        class="direct__link"
        :aria-label="`${c.label}: ${c.value}`"
        v-bind="c.external ? { target: '_blank', rel: 'noopener' } : {}"
      >
        <component :is="CHANNEL_ICONS[c.id]" :size="18" />
        <span>{{ c.value }}</span>
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
