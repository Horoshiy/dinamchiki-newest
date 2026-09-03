<script setup lang="ts">
/**
 * PageContainer — единая обёртка для контента страницы.
 * Задаёт вертикальные отступы между секциями и общий контейнер.
 *
 * Использование:
 *   <PageContainer>
 *     <section>...</section>
 *     <section>...</section>
 *   </PageContainer>
 *
 * Можно включить мягкий фон секции (под hero-блок) через `tone="soft"`.
 */
withDefaults(
  defineProps<{
    /** Подложка: white (по умолчанию) или soft (светло-серая секция). */
    tone?: 'white' | 'soft'
  }>(),
  { tone: 'white' },
)
</script>

<template>
  <div class="page-container" :class="[`page-container--${tone}`]">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-12;
  // gap задавал промежутки только МЕЖДУ секциями: последняя упиралась
  // в подвал без единого отступа. Нужен собственный вертикальный паддинг.
  padding-bottom: $space-16;

  @media (max-width: $bp-md) {
    gap: $space-10;
    padding-bottom: $space-12;
  }

  &--white { background: $color-white; }
  &--soft  { background: $color-bg-soft; }
}
</style>
