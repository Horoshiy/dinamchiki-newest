<script setup lang="ts">
/**
 * Секция «Галерея + отзывы» на главной.
 *
 * По мокапу (скрин 7):
 *   - сетка фото: 1 большое слева + 4 меньших справа (CSS-grid 3 колонки)
 *   - отзывы родителей с большой кавычкой, аватаром и ФИО
 *
 * Отзывы приходят из useReviewsQuery (сущность Review из ТЗ этапа 11),
 * а не из литералов в этом файле.
 */
import { computed } from 'vue'
import { GALLERY_ENABLED } from '@/shared/config/club'
import { RouterLink } from 'vue-router'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import { useReviewsQuery, useAlbumsQuery, useAllPhotosQuery } from '@/shared/api/composables'
import type { Review } from '@/entities/content/content.types'

const { data, loading } = useReviewsQuery()

const reviews = computed<ReadonlyArray<Review>>(() => {
  const d = data.value as { reviews?: ReadonlyArray<Review> } | null
  return d?.reviews ?? []
})

/** Альбомы нужны только для решения, показывать ли секцию отзывов ниже. */
const { data: albumsData } = useAlbumsQuery()
const hasAlbums = computed(() => {
  const d = albumsData.value as { albums?: ReadonlyArray<unknown> } | null
  return (d?.albums?.length ?? 0) > 0
})

/**
 * Семь снимков для превью. Раньше сетка была из статических плиток с мячом —
 * теперь показываем настоящие кадры из галереи клуба.
 */
const { data: photosData } = useAllPhotosQuery()
const preview = computed(() => {
  const d = photosData.value as { allPhotos?: ReadonlyArray<{ id: string; url: string; caption: string }> } | null
  return (d?.allPhotos ?? []).filter((p) => /^https?:\/\//i.test(p.url)).slice(0, 7)
})

/** Ни фото, ни отзывов — секцию рендерить незачем. */
const hasPhotos = computed(() => GALLERY_ENABLED && preview.value.length > 0)
const hasAnything = computed(() => hasPhotos.value || (GALLERY_ENABLED && hasAlbums.value) || reviews.value.length > 0)
</script>

<template>
  <section v-if="hasAnything" class="gallery-preview">
    <div class="container">
      <SectionTitle
        v-if="hasPhotos"
        eyebrow="Атмосфера"
        title="Галерея клуба"
      >
        <template #action>
          <BaseButton variant="outline" size="md" :icon-right="IconArrowRight" :to="'/gallery'">
            Все фото
          </BaseButton>
        </template>
      </SectionTitle>

      <!-- Сетка: первый кадр крупный, остальные — плитками. -->
      <div v-if="hasPhotos" class="gallery">
        <RouterLink
          v-for="(p, i) in preview"
          :key="p.id"
          to="/gallery"
          class="gallery__cell"
          :class="{ 'gallery__cell--lg': i === 0 }"
        >
          <img class="gallery__img" :src="p.url" :alt="p.caption || 'Фото клуба'" loading="lazy" decoding="async" />
        </RouterLink>
        <div class="gallery__cell gallery__cell--cta">
          <RouterLink to="/gallery" class="gallery__more">
            Смотреть все фото
            <IconArrowRight :size="16" />
          </RouterLink>
        </div>
      </div>

      <!--
        Отзывы стояли без заголовка внутри блока «Галерея клуба» — их там
        никто не находил. Теперь у них своя подпись, а пока отзывов нет,
        блок не показывается вовсе (скелетон убран: он мигал впустую).
      -->
      <template v-if="!loading && reviews.length">
        <SectionTitle
          eyebrow="Родители о нас"
          title="Отзывы"
        />
        <div class="reviews">
          <article v-for="r in reviews" :key="r.id" class="review">
            <p class="review__quote-mark" aria-hidden="true">«</p>
            <p class="review__text">{{ r.text }}</p>
            <div class="review__author">
              <span class="review__avatar">{{ r.initials }}</span>
              <div>
                <p class="review__name">{{ r.authorName }}</p>
                <p class="review__role">{{ r.authorRelation }}</p>
              </div>
            </div>
          </article>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped lang="scss">
.gallery-preview {
  padding: $space-16 0;
  background: $color-white;
}

// ---- Галерея -------------------------------------------------------------
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 140px;
  gap: $space-3;
  // Отступ нужен только когда под сеткой есть отзывы; без них секция
  // иначе получает двойной нижний воздух.
  margin-bottom: $space-12;

  &:last-child { margin-bottom: 0; }

  @media (max-width: $bp-md) {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 120px;
  }
}

.gallery__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery__cell {
  position: relative;
  background: linear-gradient(135deg, $color-brand-100 0%, $color-brand-50 100%);
  color: $color-brand-500;
  border-radius: $radius-md;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-base;

  &:hover { transform: scale(1.02); }
}

.gallery__cell--lg {
  grid-column: span 2;
  grid-row: span 2;
  background: linear-gradient(135deg, $color-brand-200 0%, $color-brand-100 100%);

  @media (max-width: $bp-md) {
    grid-column: span 2;
    grid-row: span 1;
  }
}

.gallery__cell--cta {
  background: $color-brand-500;
  color: $color-white;

  &:hover { background: $color-brand-600; transform: scale(1.02); }
}

.gallery__more {
  // При переносе на две строки inline-flex центрировал стрелку по всей
  // высоте блока, и получалось «Смотреть все / фото      →».
  // Стрелка должна идти сразу за текстом.
  //
  // Собственный паддинг обязателен: у ячейки его нет, и блочная ссылка
  // растягивалась во всю ширину — текст упирался в край плитки.
  display: block;
  padding: $space-4;
  text-align: center;
  font-weight: $font-weight-semibold;
  color: $color-white;
  text-decoration: none;
  font-size: $font-size-sm;
  line-height: 1.35;
  text-wrap: balance;

  svg {
    display: inline-block;
    vertical-align: -2px;
    margin-left: $space-2;
  }
}

// ---- Отзывы -------------------------------------------------------------
.reviews {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-5;

  @media (max-width: $bp-md) {
    grid-template-columns: 1fr;
  }
}

.review {
  position: relative;
  padding: $space-8 $space-6 $space-6;
  background: $color-bg-soft;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.review__quote-mark {
  position: absolute;
  top: $space-2;
  left: $space-5;
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: 6rem;
  line-height: 1;
  color: $color-brand-500;
  opacity: 0.25;
  margin: 0;
  pointer-events: none;
}

.review__text {
  font-size: $font-size-md;
  color: $color-fg;
  line-height: $line-height-base;
  margin: 0;
  font-style: italic;
  position: relative;
}

.review__author {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-top: auto;
}

.review__avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-brand-500;
  color: $color-white;
  border-radius: 50%;
  font-family: $font-family-display;
  font-weight: $font-weight-bold;
  font-size: $font-size-md;
  flex-shrink: 0;
}

.review__name {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
}

.review__role {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  margin: 0;
}
</style>
