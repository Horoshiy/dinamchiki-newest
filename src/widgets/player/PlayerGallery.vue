<script setup lang="ts">
/**
 * Фотогалерея игрока.
 *
 * Сейчас в моках фото — placeholder (нет реальных url).
 * Рендерим цветные плейсхолдеры с инициалами имени + подпись к фото.
 * На Этапе 11, когда придут реальные url, заменим `<div class="ph">` на `<img>`.
 */
import { computed } from 'vue'
import type { PlayerPhoto, Player } from '@/entities/player/player.types'

const props = defineProps<{
  gallery: ReadonlyArray<PlayerPhoto>
  player: Player
}>()

const initials = computed<string>(() => {
  const parts = props.player.fullName.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts[1]?.[0] ?? ''
  return (first + last).toUpperCase()
})

/** Цвет плейсхолдера — на основе gradient. */
const bgColor = computed(() => props.player.avatarGradient)
</script>

<template>
  <div class="gallery">
    <div
      v-for="p in gallery"
      :key="p.id"
      class="gallery__item"
      :class="[`gallery__item--${p.aspect}`]"
      :style="{ background: bgColor }"
    >
      <span class="gallery__initials">{{ initials }}</span>
      <span v-if="p.caption" class="gallery__caption">{{ p.caption }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-3;

  @media (max-width: $bp-lg) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: $bp-md) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.gallery__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: transform $transition-base, box-shadow $transition-base;
  min-height: 140px;

  &--square {
    aspect-ratio: 1 / 1;
  }
  &--portrait {
    aspect-ratio: 3 / 4;
  }
  &--landscape {
    aspect-ratio: 4 / 3;
    grid-column: span 2;

    @media (max-width: $bp-md) {
      grid-column: span 1;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;

    .gallery__caption {
      opacity: 1;
    }
  }
}

.gallery__initials {
  font-family: $font-family-display;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: $font-weight-extrabold;
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.gallery__caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $space-3;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  color: $color-white;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  opacity: 0;
  transition: opacity $transition-base;
}
</style>
