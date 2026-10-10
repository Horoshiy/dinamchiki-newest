<script setup lang="ts">
/**
 * Базовая кнопка. По умолчанию solid (primary), но есть варианты
 * outline / ghost / soft (брендированный фон-50).
 *
 * Цвет по умолчанию — brand (синий), но можно передать color="danger"
 * или "ink" для нейтральных кнопок.
 *
 * Размеры: sm (для inline-кнопок), md (по умолчанию), lg (для hero CTA).
 *
 * Если передан `to` — рендерится как <RouterLink>. Если `href` — как <a>.
 * Иначе — обычная кнопка.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

type Variant = 'solid' | 'outline' | 'ghost' | 'soft'
type Color   = 'brand' | 'ink' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    color?: Color
    size?: Size
    block?: boolean
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    to?: string | object
    href?: string
    /** Иконка слева от текста (Vue-компонент). */
    iconLeft?: unknown
    /** Иконка справа от текста (Vue-компонент). */
    iconRight?: unknown
  }>(),
  { variant: 'solid', color: 'brand', size: 'md', type: 'button' },
)

defineEmits<{ (e: 'click', event: MouseEvent): void }>()

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

/**
 * Атрибуты ссылки/кнопки собираются в объект, а не биндятся по одному.
 *
 * Иначе `:href="href"` со значением undefined попадал в fallthrough-атрибуты
 * RouterLink и затирал вычисленный им href — кнопка рендерилась как <a> без
 * href: клик работал, но Ctrl+клик, «открыть в новой вкладке», фокус
 * с клавиатуры и краулеры — нет.
 */
const linkAttrs = computed<Record<string, unknown>>(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return { type: props.type, disabled: props.disabled || props.loading }
})

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.color}`,
  `btn--${props.size}`,
  { 'btn--block': props.block, 'btn--loading': props.loading, 'btn--disabled': props.disabled },
])
</script>

<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    :class="classes"
    :aria-busy="loading || undefined"
    @click="(e: MouseEvent) => !disabled && !loading && $emit('click', e)"
  >
    <span v-if="iconLeft" class="btn__icon"><component :is="iconLeft" :size="size === 'lg' ? 20 : 18" /></span>
    <span class="btn__label"><slot /></span>
    <span v-if="iconRight" class="btn__icon"><component :is="iconRight" :size="size === 'lg' ? 20 : 18" /></span>
  </component>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  font-family: $font-family-sans;
  font-weight: $font-weight-semibold;
  text-decoration: none;
  border: 1.5px solid transparent;
  border-radius: $radius-md;
  cursor: pointer;
  // nowrap — решение для широких экранов. На узких длинная подпись
  // («Записаться на просмотр») задаёт минимальную ширину больше доступной
  // и распирает страницу, особенно при увеличенном системном шрифте.
  white-space: nowrap;

  @media (max-width: $bp-md) {
    white-space: normal;
    max-width: 100%;
  }
  transition:
    background $transition-base,
    color $transition-base,
    border-color $transition-base,
    transform $transition-fast,
    box-shadow $transition-base;
  user-select: none;
  line-height: 1;

  &:focus-visible {
    outline: 2px solid $color-brand-500;
    outline-offset: 2px;
  }

  &:active:not(.btn--disabled):not(.btn--loading) {
    transform: translateY(1px);
  }
}

.btn--block {
  // Кнопка во всю ширину не должна распирать родителя длинной подписью.
  white-space: normal;
  width: 100%;
}

// --- Размеры --------------------------------------------------------------
.btn--sm {
  font-size: $font-size-sm;
  padding: $space-2 $space-4;
  min-height: 36px;
}
.btn--md {
  font-size: $font-size-base;
  padding: $space-3 $space-5;
  min-height: 44px;
}
.btn--lg {
  font-size: $font-size-md;
  padding: $space-4 $space-6;
  min-height: 56px;
  border-radius: $radius-lg;
}

// --- Solid (по умолчанию) ------------------------------------------------
.btn--solid.btn--brand {
  background: $color-brand-500;
  color: $color-white;
  border-color: $color-brand-500;
  box-shadow: 0 4px 12px rgba(30, 80, 216, 0.20);

  &:hover:not(.btn--disabled) {
    background: $color-brand-600;
    border-color: $color-brand-600;
    box-shadow: 0 6px 18px rgba(30, 80, 216, 0.25);
  }
}
.btn--solid.btn--ink {
  background: $color-ink-900;
  color: $color-white;
  border-color: $color-ink-900;

  &:hover:not(.btn--disabled) {
    background: $color-ink-700;
    border-color: $color-ink-700;
  }
}
.btn--solid.btn--danger {
  background: $color-danger;
  color: $color-white;
  border-color: $color-danger;

  &:hover:not(.btn--disabled) {
    background: #b91c1c;
    border-color: #b91c1c;
  }
}

// --- Outline --------------------------------------------------------------
.btn--outline {
  background: transparent;

  &.btn--brand {
    color: $color-brand-500;
    border-color: $color-brand-500;

    &:hover:not(.btn--disabled) {
      background: $color-brand-500;
      color: $color-white;
    }
  }
  &.btn--ink {
    color: $color-ink-700;
    border-color: $color-border-strong;

    &:hover:not(.btn--disabled) {
      background: $color-ink-50;
      border-color: $color-ink-700;
    }
  }
  &.btn--danger {
    color: $color-danger;
    border-color: $color-danger;

    &:hover:not(.btn--disabled) {
      background: $color-danger;
      color: $color-white;
    }
  }
}

// --- Ghost (без рамки и фона) --------------------------------------------
.btn--ghost {
  background: transparent;
  border-color: transparent;

  &.btn--brand {
    color: $color-brand-500;
    &:hover:not(.btn--disabled) { background: $color-brand-50; }
  }
  &.btn--ink {
    color: $color-ink-700;
    &:hover:not(.btn--disabled) { background: $color-ink-100; color: $color-ink-900; }
  }
}

// --- Soft (светлый брендированный фон) ----------------------------------
.btn--soft {
  border-color: transparent;

  &.btn--brand {
    background: $color-brand-50;
    color: $color-brand-700;
    &:hover:not(.btn--disabled) {
      background: $color-brand-100;
      color: $color-brand-800;
    }
  }
}

// --- Состояния ------------------------------------------------------------
.btn--disabled, .btn--loading {
  opacity: 0.55;
  pointer-events: none;
}
.btn--loading { position: relative; }
.btn--loading .btn__label { opacity: 0.7; }

.btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
