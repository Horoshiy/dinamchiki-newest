<script setup lang="ts">
/**
 * Универсальный враппер для SVG-иконок.
 *
 * Поддерживает атрибуты через `$attrs` — например, `<IconUsers size="28" />`
 * прокинет size в эту базу.
 */
defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** Размер в пикселях (одинаково по ширине и высоте). */
  size?: number | string
  /** Цвет заливки/обводки. По умолчанию — текущий цвет текста. */
  color?: string
}>()
const finalSize = props.size ?? 20
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="finalSize"
    :height="finalSize"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color ?? 'currentColor'"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-bind="$attrs"
  >
    <slot />
  </svg>
</template>
