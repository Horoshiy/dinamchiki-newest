<script setup lang="ts">
/**
 * Простой логотип клуба — щит с монограммой Д.
 * Используется в Header и Footer.
 */
defineProps<{ size?: number | string }>()
</script>

<template>
  <span class="logo" :style="{ width: `${size ?? 48}px`, height: `${size ?? 48}px` }">
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5180f4"/>
          <stop offset="100%" stop-color="#1a45bf"/>
        </linearGradient>
      </defs>
      <path
        d="M32 4 L56 12 V32 C56 46 44 56 32 60 C20 56 8 46 8 32 V12 Z"
        fill="url(#logo-g)"
        stroke="#ffffff"
        stroke-width="1.5"
      />
      <text
        x="32" y="40"
        font-family="Manrope, Inter, sans-serif"
        font-size="28" font-weight="800"
        fill="#ffffff"
        text-anchor="middle"
      >Д</text>
      <circle cx="32" cy="50" r="3.5" fill="#ffffff"/>
    </svg>
  </span>
</template>

<style scoped lang="scss">
.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 100%; height: 100%; display: block; }
}
</style>
