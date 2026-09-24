<script setup lang="ts">
/**
 * Сетка фотографий (masonry-like).
 *
 * Каждая ячейка использует свой aspect-ratio из GalleryPhoto.aspect.
 * По клику открывает LightboxModal (через emit).
 */
import type { GalleryPhoto } from '@/entities/gallery/gallery.types'

defineProps<{
  photos: ReadonlyArray<GalleryPhoto>
}>()

const emit = defineEmits<{
  (e: 'open', index: number): void
}>()

function open(i: number) { emit('open', i) }

/** «placeholder://…» — не адрес картинки, а заглушка из старого демо-контента. */
function isRealPhoto(url: string): boolean {
  return /^https?:\/\//i.test(url)
}
</script>

<template>
  <div class="grid">
    <button
      v-for="(p, i) in photos"
      :key="p.id"
      type="button"
      class="grid__item"
      :class="[`grid__item--${p.aspect}`]"
      :style="{ background: p.placeholderColor }"
      :aria-label="p.caption || `Фото ${i + 1}`"
      @click="open(i)"
    >
      <img
        v-if="isRealPhoto(p.url)"
        class="grid__img"
        :src="p.url"
        :alt="p.caption || `Фото ${i + 1}`"
        loading="lazy"
        decoding="async"
      />
          <span v-if="p.caption" class="grid__caption">{{ p.caption }}</span>
      <span v-if="!isRealPhoto(p.url)" class="grid__id">{{ i + 1 }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.grid__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 180px;
  gap: $space-3;

  @media (max-width: $bp-lg) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: $bp-md) {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
  }
}

.grid__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  border: none;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: transform $transition-base, box-shadow $transition-base;

  // aspect-ratio здесь конфликтовал с grid-auto-rows: плитка вырастала выше
  // своей строки и наезжала на соседние и на заголовок следующей секции.
  // Размер задаётся только через span по строкам и колонкам.
  height: 100%;

  &--square {
    grid-row: span 1;
    grid-column: span 1;
  }

  &--portrait {
    grid-row: span 2;
    grid-column: span 1;

    @media (max-width: $bp-md) {
      grid-row: span 1;
    }
  }

  &--landscape {
    grid-row: span 1;
    grid-column: span 2;

    @media (max-width: $bp-md) {
      grid-column: span 1;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;

    .grid__caption {
      opacity: 1;
    }
    .grid__id {
      opacity: 0;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-white;
    outline-offset: 2px;
  }
}

.grid__caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $space-3;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  color: $color-white;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  text-align: left;
  opacity: 0;
  transition: opacity $transition-base;
}

.grid__id {
  font-family: $font-family-display;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: $font-weight-extrabold;
  letter-spacing: 0.04em;
  opacity: 0.4;
  transition: opacity $transition-base;
}
</style>
