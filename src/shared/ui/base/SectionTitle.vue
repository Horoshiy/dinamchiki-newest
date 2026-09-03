<script setup lang="ts">
/**
 * Заголовок секции. По мокапам: мелкий eyebrow сверху (опционально),
 * крупный h2 под ним, синяя акцентная полоска слева, и слот для action
 * справа (например, "Все группы →").
 *
 * По умолчанию выравнивание по левому краю; можно переопределить через align="center".
 */
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    /** Размер заголовка. */
    size?: 'md' | 'lg'
    align?: 'left' | 'center'
  }>(),
  { size: 'md', align: 'left' },
)
</script>

<template>
  <header class="section-title" :class="[`section-title--${align}`]">
    <div class="section-title__main">
      <p v-if="eyebrow || $slots.eyebrow" class="section-title__eyebrow">
        <slot name="eyebrow">{{ eyebrow }}</slot>
      </p>
      <h2 v-if="title || $slots.default" class="section-title__title" :class="`section-title__title--${size}`">
        <slot>{{ title }}</slot>
      </h2>
      <span class="section-title__bar" aria-hidden="true" />
    </div>
    <div v-if="$slots.action" class="section-title__action">
      <slot name="action" />
    </div>
  </header>
</template>

<style scoped lang="scss">
// Раньше действие было position: absolute (top/right 0). На мобиле заголовок
// переносился на две строки, вырастал вширь и уезжал ПОД кнопку — «Все фото»
// накрывала «Галерея клуба». Теперь это обычный флекс: на широком экране
// действие справа, на узком переносится под заголовок.
.section-title {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-4;
  margin-bottom: $space-8;

  &--center {
    justify-content: center;
    text-align: center;

    .section-title__main { align-items: center; }
    .section-title__bar { margin-left: auto; margin-right: auto; }
  }

  @media (max-width: $bp-md) {
    flex-direction: column;
    align-items: flex-start;
    gap: $space-5;

    &--center {
      align-items: center;
    }
  }
}

.section-title__main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $space-3;
  // min-width: 0 обязателен: без него длинный заголовок не даёт флексу
  // сжаться и выталкивает действие за пределы контейнера.
  min-width: 0;
}

.section-title__eyebrow {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $color-brand-500;
  margin: 0;
}

.section-title__title {
  margin: 0;
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  color: $color-fg-strong;
  letter-spacing: -0.02em;
  // Длинные слова в заголовке не должны распирать секцию.
  overflow-wrap: break-word;

  &--md { font-size: clamp(1.75rem, 2.6vw, 2.25rem); line-height: 1.15; }
  &--lg { font-size: clamp(2.25rem, 3.5vw, 3rem);   line-height: 1.05; }
}

.section-title__bar {
  display: block;
  width: 56px;
  height: 4px;
  background: $color-brand-500;
  border-radius: $radius-pill;
}

.section-title__action {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
