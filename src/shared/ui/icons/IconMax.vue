<script setup lang="ts">
/**
 * MAX — мессенджер VK. Официального SVG-знака в проекте нет, поэтому знак
 * набран буквой «M» в скруглённом квадрате: узнаваемо и не выдаёт себя
 * за чужой логотип.
 */
withDefaults(defineProps<{ size?: number | string }>(), { size: 20 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
    <path
      d="M7 16.5V7.5l5 5 5-5v9"
      stroke="#fff"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  </svg>
</template>
