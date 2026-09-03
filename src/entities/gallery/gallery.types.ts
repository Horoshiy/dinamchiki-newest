// =============================================================================
// Типы доменной сущности Gallery (фотогалерея клуба).
//
// Совместимы с будущей GraphQL-схемой (Этап 11).
// До подключения GraphQL данные приходят из моков (./gallery.mocks.ts).
// =============================================================================

/** Категория фото/альбома. */
export type GalleryCategory = 'training' | 'matches' | 'tournaments' | 'events' | 'lifestyle'

/** Соотношение сторон фотографии (для masonry grid). */
export type PhotoAspect = 'square' | 'portrait' | 'landscape'

/** Одна фотография в галерее. */
export interface GalleryPhoto {
  id: string
  /** ID альбома, в котором лежит фото */
  albumId: string
  /** URL изображения (для моков — placeholder) */
  url: string
  /** Подпись / описание к фото */
  caption?: string
  /** Соотношение сторон */
  aspect: PhotoAspect
  /** Hex-цвет для плейсхолдера (разный у каждого фото) */
  placeholderColor: string
}

/** Альбом фотографий. */
export interface GalleryAlbum {
  id: string
  /** Название альбома */
  title: string
  /** Описание (1-2 предложения) */
  description: string
  /** Категория */
  category: GalleryCategory
  /** Дата съёмки (ISO) */
  date: string
  /** Место съёмки */
  venue: string
  /** Количество фото в альбоме */
  photosCount: number
  /** ID фото обложки (первое фото альбома) */
  coverPhotoId: string
  /** Фото в альбоме (полный список) */
  photos: ReadonlyArray<GalleryPhoto>
}

/** Локализованные лейблы категорий. */
export const GALLERY_CATEGORY_LABELS: Readonly<Record<GalleryCategory, string>> = {
  training:   'Тренировки',
  matches:    'Матчи',
  tournaments:'Турниры',
  events:     'События',
  lifestyle:  'Жизнь клуба',
}

/** Цвета бейджей категорий. */
export const GALLERY_CATEGORY_COLORS: Readonly<Record<GalleryCategory, string>> = {
  training:   '#1e50d8',
  matches:    '#dc2626',
  tournaments:'#ca8a04',
  events:     '#7c3aed',
  lifestyle:  '#16a34a',
}
