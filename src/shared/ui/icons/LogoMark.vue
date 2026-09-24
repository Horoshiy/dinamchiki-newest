<script setup lang="ts">
/**
 * Логотип клуба — «Д» с фигурой футболиста в круге.
 *
 * Раньше здесь был нарисованный щит с монограммой: настоящего логотипа
 * у проекта не было. Клуб передал два файла, синий и белый, — они и стоят
 * тут. Вариант выбирается по фону: на светлой шапке синий, на тёмном
 * подвале белый.
 *
 * Отдаём готовые размеры через srcset, чтобы на ретине логотип не мылился,
 * а на обычном экране не тянулись лишние килобайты.
 */
withDefaults(
  defineProps<{
    size?: number
    /** 'blue' — для светлого фона, 'white' — для тёмного. */
    variant?: 'blue' | 'white'
    /**
     * Логотип рядом с названием клуба — декоративный: текст «Динамчики»
     * стоит рядом и уже читается скринридером. Осмысленную подпись
     * задавайте явно там, где логотип стоит один.
     */
    alt?: string
  }>(),
  { size: 48, variant: 'blue', alt: '' },
)
</script>

<template>
  <img
    class="logo"
    :src="`/logo/dinamchiki-${variant}-192.png`"
    :srcset="`/logo/dinamchiki-${variant}-96.png 96w,
              /logo/dinamchiki-${variant}-192.png 192w,
              /logo/dinamchiki-${variant}-512.png 512w`"
    :sizes="`${size}px`"
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
  // Логотип квадратный: фиксируем соотношение, чтобы он не «прыгал»
  // до загрузки файла.
  aspect-ratio: 1 / 1;
  flex: 0 0 auto;
}
</style>
