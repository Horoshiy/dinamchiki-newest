<script setup lang="ts">
/**
 * EmptyState — универсальный блок для пустого/незаполненного состояния.
 *
 * Использование:
 *   <EmptyState
 *     title="Команды появятся здесь"
 *     description="Список команд формируется из GraphQL. Подключим в Этапе 5."
 *     icon="IconBall"
 *   />
 *
 * Принимает:
 *   - title        (обязательный) — крупный текст
 *   - description  (опционально)  — поясняющий текст
 *   - icon         (опционально)  — Vue-компонент иконки
 *   - iconSize     (опционально)  — размер иконки, по умолчанию 56
 *   - variant      (опционально)  — 'soft' для вписанных в секцию / 'card' для изолированных
 */
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: unknown
    iconSize?: number
    variant?: 'soft' | 'card'
  }>(),
  { iconSize: 56, variant: 'card' },
)
</script>

<template>
  <div class="empty-state" :class="[`empty-state--${variant}`]">
    <div v-if="icon" class="empty-state__icon">
      <component :is="icon" :size="iconSize" />
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-4;
  padding: $space-12 $space-6;
  width: 100%;

  &--soft { padding: $space-8 $space-6; }
  &--card {
    background: $color-white;
    border: 1.5px dashed $color-border-strong;
    border-radius: $radius-lg;
  }
}

.empty-state__icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: $color-brand-50;
  color: $color-brand-500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state--soft .empty-state__icon {
  width: 72px;
  height: 72px;
}

.empty-state__title {
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.01em;
}

.empty-state__description {
  font-size: $font-size-base;
  color: $color-fg-muted;
  max-width: 50ch;
  margin: 0;
  line-height: $line-height-base;
}

.empty-state__action {
  margin-top: $space-2;
}
</style>
