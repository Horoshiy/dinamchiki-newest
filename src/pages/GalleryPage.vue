<script setup lang="ts">
/**
 * Страница «Галерея» (`/gallery`).
 */
import { computed, ref, watch } from 'vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import FilterChips from '@/shared/ui/base/FilterChips.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import PhotoGrid from '@/widgets/gallery/PhotoGrid.vue'
import AlbumCard from '@/widgets/gallery/AlbumCard.vue'
import LightboxModal from '@/widgets/gallery/LightboxModal.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import { useAlbumsQuery, useAllPhotosQuery } from '@/shared/api/composables'
import type { GalleryAlbum, GalleryPhoto } from '@/entities/gallery/gallery.types'

const { data: albumsData, loading: albumsLoading, error: albumsError } = useAlbumsQuery()
const { data: photosData, loading: photosLoading, error: photosError } = useAllPhotosQuery()

const loading = computed(() => albumsLoading.value || photosLoading.value)
const error   = computed<Error | null>(() => albumsError.value ?? photosError.value)

const albums = computed<ReadonlyArray<GalleryAlbum>>(() => {
  const d = albumsData.value as { albums?: ReadonlyArray<GalleryAlbum> } | null
  return d?.albums ?? []
})

const photos = computed<ReadonlyArray<GalleryPhoto>>(() => {
  const d = photosData.value as { allPhotos?: ReadonlyArray<GalleryPhoto> } | null
  return d?.allPhotos ?? []
})

watch(error, (e) => { if (e) console.warn('[GalleryPage]', e.message) })

const albumOptions = computed(() => [
  { value: 'all', label: 'Все альбомы' },
  ...albums.value.map((a) => ({ value: a.id, label: a.title })),
])

const selectedAlbum = ref<string | null>('all')

const visiblePhotos = computed<ReadonlyArray<GalleryPhoto>>(() => {
  if (!selectedAlbum.value || selectedAlbum.value === 'all') return photos.value
  return photos.value.filter((p) => p.albumId === selectedAlbum.value)
})

const lightboxOpen = ref(false)
const currentIndex = ref(0)

function openPhoto(index: number) {
  currentIndex.value = index
  lightboxOpen.value = true
}

function openAlbum(albumId: string) {
  selectedAlbum.value = albumId
  setTimeout(() => {
    document.querySelector('.gallery__grid-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 100)
}
</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="Фотогалерея"
        title="Моменты из жизни клуба"
        description="Тренировки, матчи, турниры и праздники — лучшие кадры наших команд. Кликните на фото для полноразмерного просмотра."
      >
        <template #action>
          <FilterChips
            v-if="albums.length"
            v-model:selected="selectedAlbum"
            :items="albumOptions"
          />
        </template>
      </PageHeader>
    </section>

    <section v-if="loading" class="container">
      <LoadingSkeleton variant="block" height="400px" />
    </section>

    <section v-else-if="error" class="container">
      <EmptyState
        title="Не удалось загрузить галерею"
        :description="error.message"
        :icon="IconBall"
        variant="card"
      />
    </section>

    <section v-else-if="visiblePhotos.length === 0" class="container">
      <EmptyState
        title="Фотографии скоро появятся"
        description="Снимки с тренировок, матчей и турниров сейчас готовим к публикации. Пока можно посмотреть, как проходят занятия, на главной странице."
        :icon="IconBall"
        variant="card"
      />
    </section>

    <section v-else class="container gallery__grid-anchor">
      <p class="gallery__count">
        <strong>{{ visiblePhotos.length }}</strong> фото
        в {{ selectedAlbum === 'all' || !selectedAlbum ? 'общей галерее' : 'альбоме' }}
      </p>
      <PhotoGrid :photos="visiblePhotos" @open="openPhoto" />
    </section>

    <section v-if="albums.length" class="container">
      <SectionTitle eyebrow="Альбомы" title="Все альбомы" />
      <div class="gallery__albums">
        <AlbumCard
          v-for="album in albums"
          :key="album.id"
          :album="album"
          @open="openAlbum"
        />
      </div>
    </section>

    <LightboxModal
      v-model:open="lightboxOpen"
      v-model:current-index="currentIndex"
      :photos="visiblePhotos"
    />
  </PageContainer>
</template>

<style scoped lang="scss">
.gallery__grid-anchor {
  scroll-margin-top: $space-20;
}

.gallery__count {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  margin: 0 0 $space-4;

  strong { color: $color-brand-500; font-weight: $font-weight-bold; }
}

.gallery__albums {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: $space-5;
}
</style>
