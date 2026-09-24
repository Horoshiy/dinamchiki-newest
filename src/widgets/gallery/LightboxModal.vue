<script setup lang="ts">
/**
 * LightboxModal — полноразмерный просмотр фото.
 *
 * Поддержка:
 *   - Закрытие по клику на фон, по крестику, по Escape
 *   - Навигация: стрелки ←/→, кнопки prev/next
 *   - Счётчик «N из M»
 *   - Блокировка скролла body, пока открыт
 *   - Focus-trap (Escape + Tab)
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { GalleryPhoto } from '@/entities/gallery/gallery.types'
import IconClose from '@/shared/ui/icons/IconClose.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'

const props = defineProps<{
  photos: ReadonlyArray<GalleryPhoto>
  /** Индекс открытого фото */
  currentIndex: number
  /** Открыт ли lightbox */
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:currentIndex', value: number): void
}>()

const currentPhoto = computed<GalleryPhoto | null>(() =>
  props.photos[props.currentIndex] ?? null,
)

const hasPrev = computed(() => props.currentIndex > 0)
const hasNext = computed(() => props.currentIndex < props.photos.length - 1)

function close() { emit('update:open', false) }
function prev() {
  if (hasPrev.value) emit('update:currentIndex', props.currentIndex - 1)
}
function next() {
  if (hasNext.value) emit('update:currentIndex', props.currentIndex + 1)
}

/** Корневой элемент модалки — нужен для перехвата Tab. */
const dialogRef = ref<HTMLElement | null>(null)

/** Элемент, на который вернём фокус после закрытия. */
let lastFocused: HTMLElement | null = null

const FOCUSABLE = 'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function focusableItems(): HTMLElement[] {
  if (!dialogRef.value) return []
  return Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((el) => el.offsetParent !== null)
}

/**
 * Замыкаем Tab внутри модалки.
 *
 * Раньше в шапке файла было заявлено «Focus-trap (Escape + Tab)», но Tab
 * не перехватывался: фокус уходил на ссылки под модалкой, а скринридер
 * зачитывал скрытую страницу.
 */
function trapTab(e: KeyboardEvent) {
  const items = focusableItems()
  if (items.length === 0) {
    e.preventDefault()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement as HTMLElement | null

  if (e.shiftKey) {
    if (active === first || !dialogRef.value?.contains(active)) {
      e.preventDefault()
      last.focus()
    }
  } else if (active === last || !dialogRef.value?.contains(active)) {
    e.preventDefault()
    first.focus()
  }
}

function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'Tab') trapTab(e)
}

/** Блокируем скролл body пока lightbox открыт. */
function lockScroll(lock: boolean) {
  if (typeof document === 'undefined') return
  document.body.style.overflow = lock ? 'hidden' : ''
}

watch(() => props.open, (val) => {
  if (val) {
    lastFocused = document.activeElement as HTMLElement | null
    lockScroll(true)
    document.addEventListener('keydown', onKey)
    // Фокус внутрь модалки — иначе Tab начнёт с элементов страницы под ней.
    nextTick(() => focusableItems()[0]?.focus())
  } else {
    lockScroll(false)
    document.removeEventListener('keydown', onKey)
    lastFocused?.focus()
    lastFocused = null
  }
}, { immediate: true })

onBeforeUnmount(() => {
  lockScroll(false)
  document.removeEventListener('keydown', onKey)
})

/** «placeholder://…» — не адрес картинки, а заглушка из старого демо-контента. */
function isRealPhoto(url: string): boolean {
  return /^https?:\/\//i.test(url)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="open && currentPhoto"
        ref="dialogRef"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="currentPhoto.caption || 'Просмотр фото'"
        @click.self="close"
      >
        <!-- Кнопка закрытия -->
        <button
          type="button"
          class="lightbox__close"
          aria-label="Закрыть"
          @click="close"
        >
          <IconClose :size="24" />
        </button>

        <!-- Счётчик -->
        <div class="lightbox__counter">
          {{ currentIndex + 1 }} / {{ photos.length }}
        </div>

        <!-- Стрелка влево -->
        <button
          v-if="hasPrev"
          type="button"
          class="lightbox__nav lightbox__nav--prev"
          aria-label="Предыдущее фото"
          @click="prev"
        >
          <IconArrowRight :size="28" class="lightbox__nav-icon lightbox__nav-icon--left" />
        </button>

        <!-- Фото -->
        <div
          class="lightbox__photo"
          :style="{ background: currentPhoto.placeholderColor }"
        >
          <img
            v-if="isRealPhoto(currentPhoto.url)"
            class="lightbox__img"
            :src="currentPhoto.url"
            :alt="currentPhoto.caption || 'Фото клуба'"
          />
          <span v-else class="lightbox__photo-id">{{ currentPhoto.id }}</span>
        </div>

        <!-- Подпись -->
        <div v-if="currentPhoto.caption" class="lightbox__caption">
          {{ currentPhoto.caption }}
        </div>

        <!-- Стрелка вправо -->
        <button
          v-if="hasNext"
          type="button"
          class="lightbox__nav lightbox__nav--next"
          aria-label="Следующее фото"
          @click="next"
        >
          <IconArrowRight :size="28" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.lightbox {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  background: rgba(13, 18, 32, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-12 $space-6;
}

.lightbox__close {
  position: absolute;
  top: $space-5;
  right: $space-5;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: $color-white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid $color-white;
    outline-offset: 2px;
  }
}

.lightbox__counter {
  position: absolute;
  top: $space-5;
  left: $space-5;
  padding: $space-2 $space-4;
  background: rgba(255, 255, 255, 0.1);
  color: $color-white;
  border-radius: $radius-pill;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
}

.lightbox__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: $radius-lg;
}

.lightbox__photo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(90vw, 1200px);
  height: min(80vh, 800px);
  border-radius: $radius-lg;
  color: rgba(255, 255, 255, 0.4);
  box-shadow: $shadow-lg;
}

.lightbox__photo-id {
  font-family: $font-family-display;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: $font-weight-bold;
  letter-spacing: 0.04em;
  text-align: center;
  padding: 0 $space-6;
}

.lightbox__caption {
  margin-top: $space-5;
  font-size: $font-size-md;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  max-width: 70ch;
}

.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: $color-white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid $color-white;
    outline-offset: 2px;
  }

  &--prev { left: $space-5; }
  &--next { right: $space-5; }
}

.lightbox__nav-icon--left {
  transform: rotate(180deg);
}

// Анимации
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

@media (max-width: $bp-md) {
  .lightbox {
    padding: $space-8 $space-3;
  }
  .lightbox__photo {
    width: 95vw;
    height: 60vh;
  }
  .lightbox__nav {
    width: 44px;
    height: 44px;
    &--prev { left: $space-2; }
    &--next { right: $space-2; }
  }
  .lightbox__close {
    width: 40px;
    height: 40px;
  }
}
</style>
