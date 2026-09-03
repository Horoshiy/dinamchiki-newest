<script setup lang="ts">
/**
 * Переключатель версии для слабовидящих.
 *
 * `itemprop="copy"` ставится на текстовый вариант (в подвале): проверка
 * Рособрнадзора ищет размеченное указание на наличие такой версии,
 * и текст надёжнее иконки.
 */
import IconEye from '@/shared/ui/icons/IconEye.vue'
import { useBvi } from './useBvi'

withDefaults(
  defineProps<{ variant?: 'icon' | 'text'; markup?: boolean }>(),
  { variant: 'icon', markup: false },
)

const { state, toggle } = useBvi()
</script>

<template>
  <button
    type="button"
    class="bvi-toggle"
    :class="`bvi-toggle--${variant}`"
    :itemprop="markup ? 'copy' : undefined"
    :aria-pressed="state.enabled"
    :title="state.enabled ? 'Вернуться к обычной версии сайта' : 'Версия сайта для слабовидящих'"
    @click="toggle()"
  >
    <IconEye :size="variant === 'icon' ? 20 : 16" />
    <span :class="variant === 'icon' ? 'bvi-toggle__sr' : 'bvi-toggle__label'">
      Версия для слабовидящих
    </span>
  </button>
</template>

<style scoped lang="scss">
.bvi-toggle {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  background: transparent;
  border: 1px solid transparent;
  border-radius: $radius-md;
  color: inherit;
  padding: $space-2;

  &:hover { color: $color-link; }

  &:focus-visible {
    outline: 2px solid $color-brand-500;
    outline-offset: 2px;
  }
}

.bvi-toggle--text {
  padding: 0;
  font-size: $font-size-xs;
  color: rgba($color-white, 0.5);
  text-decoration: underline;

  &:hover { color: $color-brand-200; }
}

// Текст для скринридеров и роботов: в потоке, но не виден глазами.
.bvi-toggle__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
