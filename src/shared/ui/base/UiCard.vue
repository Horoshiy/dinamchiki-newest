<script setup lang="ts">
/**
 * Универсальная карточка. По мокапам — белый фон, скругление 20px,
 * мягкая тень, padding 28-32px.
 *
 * Вариант `hoverable` поднимает карточку и усиливает тень при наведении.
 * Если передан `to` или `href` — корневой элемент становится ссылкой.
 *
 * Два варианта контента:
 *   1) Через слот `<UiCard>...произвольный контент...</UiCard>`
 *   2) Через пропсы `title` + `description` + `icon` (или `iconKey`)
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import IconUsers from '@/shared/ui/icons/IconUsers.vue'
import IconBadge from '@/shared/ui/icons/IconBadge.vue'
import IconShieldCheck from '@/shared/ui/icons/IconShieldCheck.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'

const props = withDefaults(
  defineProps<{
    /** Заголовок карточки (если не используется slot). */
    title?: string
    /** Описание карточки (если не используется slot). */
    description?: string
    /** Иконка — Vue-компонент (приоритетнее iconKey). */
    icon?: object | (() => unknown)
    /** Ключ встроенной иконки: 'users' | 'badge' | 'shield' | 'trophy'. */
    iconKey?: 'users' | 'badge' | 'shield' | 'trophy'
    /** Паддинг внутри карточки: 'md' (по умолчанию), 'lg' или 'none'. */
    padding?: 'md' | 'none' | 'lg'
    /** Эффект при наведении. */
    hoverable?: boolean
    /** Если задан — клик переводит на маршрут (RouterLink). */
    to?: string | object
    /** Если задан — клик уводит на внешний URL. */
    href?: string
  }>(),
  { padding: 'md', hoverable: false },
)

const ICONS: Record<string, unknown> = {
  users: IconUsers,
  badge: IconBadge,
  shield: IconShieldCheck,
  trophy: IconTrophy,
}

const resolvedIcon = computed(() => props.icon || (props.iconKey ? ICONS[props.iconKey] : null))

/** Тег корневого элемента: маршрут → RouterLink, внешняя ссылка → <a>, иначе <div>. */
const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'div'))

/**
 * Атрибуты ссылки собираются в объект, а не биндятся по одному.
 *
 * `:href="href"` со значением undefined попадал в fallthrough-атрибуты
 * RouterLink и затирал вычисленный им href: карточка-ссылка рендерилась
 * как <a> без href — Ctrl+клик, «открыть в новой вкладке» и краулеры
 * её не видели. Тот же дефект был у BaseButton.
 */
const linkAttrs = computed<Record<string, unknown>>(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return {}
})
</script>

<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    class="card"
    :class="[`card--p-${padding}`, { 'card--hoverable': hoverable, 'card--link': !!to || !!href, 'card--with-title': title && !$slots.default }]"
  >
    <template v-if="title && !$slots.default">
      <div v-if="icon || iconKey" class="card__icon">
        <component :is="icon || IconUsers" v-if="iconKey === 'users' || icon" :size="28" />
        <IconBadge v-else-if="iconKey === 'badge'" :size="28" />
        <IconShieldCheck v-else-if="iconKey === 'shield'" :size="28" />
        <IconTrophy v-else-if="iconKey === 'trophy'" :size="28" />
      </div>
      <h3 v-if="title" class="card__title">{{ title }}</h3>
      <p v-if="description" class="card__desc">{{ description }}</p>
    </template>
    <slot v-else />
  </component>
</template>

<style scoped lang="scss">
.card {
  display: block;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition:
    box-shadow $transition-base,
    transform $transition-base,
    border-color $transition-base;
  color: inherit;
  text-decoration: none;

  &--p-md   { padding: $space-6; }
  &--p-lg   { padding: $space-8; }
  &--p-none { padding: 0; }

  &--hoverable:hover,
  &--link:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $color-border-strong;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: $space-4;
    border-radius: $radius-md;
    background: $color-brand-50;
    color: $color-brand-600;
  }

  &__title {
    margin: 0 0 $space-2;
    font-family: $font-family-display;
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-fg-strong;
    line-height: $line-height-snug;
  }

  &__desc {
    margin: 0;
    font-size: $font-size-sm;
    color: $color-fg-muted;
    line-height: $line-height-base;
  }
}
</style>
