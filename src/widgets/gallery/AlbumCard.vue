<script setup lang="ts">
/**
 * Карточка альбома для сетки /gallery.
 *
 * Большая обложка с категорией-бейджем + название + дата + количество фото.
 * По клику можно открыть альбом (на будущее) или прокрутить к сетке.
 */
import { computed } from 'vue'
import type { GalleryAlbum } from '@/entities/gallery/gallery.types'
import {
  GALLERY_CATEGORY_LABELS,
  GALLERY_CATEGORY_COLORS,
} from '@/entities/gallery/gallery.types'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import { formatShort } from '@/shared/lib/date'

const props = defineProps<{
  album: GalleryAlbum
}>()

const emit = defineEmits<{ (e: 'open', id: string): void }>()

const cover = computed(() => props.album.photos.find((p) => p.id === props.album.coverPhotoId) ?? props.album.photos[0])
const categoryLabel = computed(() => GALLERY_CATEGORY_LABELS[props.album.category])
const categoryColor = computed(() => GALLERY_CATEGORY_COLORS[props.album.category])
const dateFmt = computed(() => formatShort(props.album.date))

/** «placeholder://…» — не адрес картинки, а заглушка из старого демо-контента. */
function isRealPhoto(url: string): boolean {
  return /^https?:\/\//i.test(url)
}
</script>

<template>
  <!-- Открывает альбом кнопка в заголовке, растянутая на всю карточку
       (::after): <article @click> не получал фокус и не открывался с клавиатуры. -->
  <article
    class="album"
    :style="{ '--album-color': categoryColor }"
  >
    <div
      class="album__cover"
      :style="{ background: cover?.placeholderColor ?? '#d8dde6' }"
    >
      <img
        v-if="cover && isRealPhoto(cover.url)"
        class="album__img"
        :src="cover.url"
        :alt="album.title"
        loading="lazy"
        decoding="async"
      />
      <span class="album__category">{{ categoryLabel }}</span>
      <span class="album__count">{{ album.photosCount }} фото</span>
    </div>

    <div class="album__body">
      <h3 class="album__title">
        <button type="button" class="album__open" @click="emit('open', album.id)">{{ album.title }}</button>
      </h3>
      <p class="album__date">
        <IconCalendar :size="14" />
        {{ dateFmt }} · {{ album.venue }}
      </p>
      <p class="album__desc">{{ album.description }}</p>
    </div>
  </article>
</template>

<style scoped lang="scss">
.album {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
  cursor: pointer;
  box-shadow: $shadow-xs;
  transition: box-shadow $transition-base, transform $transition-base, border-color $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $color-border-strong;
  }
}

.album__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album__cover {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: $space-3 $space-4;
  aspect-ratio: 4 / 3;
  color: $color-white;
}

// Бейджи лежат поверх снимка — поднимаем их над картинкой и притеняем,
// иначе белый текст теряется на светлом кадре.
.album__category,
.album__count {
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
}

.album__category {
  display: inline-block;
  padding: 2px $space-3;
  background: rgba(0, 0, 0, 0.4);
  color: $color-white;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.album__count {
  display: inline-block;
  padding: 2px $space-3;
  background: rgba(255, 255, 255, 0.2);
  color: $color-white;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
}

.album__body {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding: $space-5;
}

.album__title {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.01em;
}

.album__date {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-xs;
  color: $color-fg-muted;
  margin: 0;
}

.album__desc {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
}

.album__open {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  &:focus-visible {
    outline: none;

    &::after {
      outline: 3px solid $color-brand-500;
      outline-offset: 2px;
    }
  }
}
</style>
