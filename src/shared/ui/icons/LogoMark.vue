<script setup lang="ts">
/**
 * Эмблема клуба — строчная «д», набранная шрифтом Little Venice
 * и переведённая в кривые (30.10.2026).
 *
 * Два варианта по фону: на светлой шапке синий, на тёмном подвале белый.
 * Эмблема векторная, поэтому один SVG чёткий на любом экране.
 * PNG того же знака лежат рядом (/logo/dinamchiki-*-{96,192,512}.png)
 * для обложек соцсетей и мест, где SVG не принимают.
 */
withDefaults(
  defineProps<{
    size?: number
    /** 'blue' — для светлого фона, 'white' — для тёмного. */
    variant?: 'blue' | 'white'
    /**
     * Эмблема рядом с названием клуба — декоративная: текст «Динамчики»
     * стоит рядом и уже читается скринридером. Осмысленную подпись
     * задавайте явно там, где эмблема стоит одна.
     */
    alt?: string
  }>(),
  { size: 48, variant: 'blue', alt: '' },
)
</script>

<template>
  <img
    class="logo"
    :src="`/logo/dinamchiki-d-${variant}.svg`"
    :width="size"
    :height="size"
    :alt="alt"
    :aria-hidden="alt ? undefined : 'true'"
    decoding="async"
  />
</template>

<style scoped lang="scss">
.logo {
  display: block;
  object-fit: contain;
  // Эмблема квадратная: фиксируем соотношение, чтобы она не «прыгала»
  // до загрузки файла.
  aspect-ratio: 1 / 1;
  flex: 0 0 auto;
}
</style>
