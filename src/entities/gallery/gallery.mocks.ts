// =============================================================================
// Mock-данные галереи. До подключения GraphQL (Этап 11).
//
// Структура 1-в-1 с будущим ответом albums query.
// Каждое фото — плейсхолдер с уникальным цветом (для визуального разнообразия).
// =============================================================================
import type { GalleryAlbum, GalleryPhoto, PhotoAspect } from './gallery.types'

const PALETTE = [
  '#1e50d8', '#5180f4', '#143494', '#0d2b6e', // brand
  '#dc2626', '#f59e0b', '#ca8a04',           // warm
  '#16a34a', '#0d9488', '#2563eb',           // cool accent
  '#7c3aed', '#db2777', '#475569',           // muted
]

function makePhotos(
  albumId: string,
  count: number,
  prefix: string,
  aspects: ReadonlyArray<PhotoAspect>,
): ReadonlyArray<GalleryPhoto> {
  const out: GalleryPhoto[] = []
  for (let i = 0; i < count; i++) {
    out.push({
      id: `${albumId}-p${i + 1}`,
      albumId,
      url: `placeholder://gallery/${albumId}/${i + 1}`,
      caption: `${prefix} — фото ${i + 1}`,
      aspect: aspects[i % aspects.length],
      placeholderColor: PALETTE[(i + albumId.length) % PALETTE.length],
    })
  }
  return out
}

const ASPECTS_MIXED: ReadonlyArray<PhotoAspect> = ['landscape', 'portrait', 'square', 'square', 'landscape', 'portrait', 'square', 'landscape']
const ASPECTS_PORTRAIT: ReadonlyArray<PhotoAspect> = ['portrait', 'portrait', 'portrait', 'portrait', 'portrait', 'portrait', 'portrait', 'portrait']
const ASPECTS_LANDSCAPE: ReadonlyArray<PhotoAspect> = ['landscape', 'landscape', 'landscape', 'landscape', 'landscape', 'landscape', 'landscape', 'landscape']

export const galleryMock: ReadonlyArray<GalleryAlbum> = [
  // 1. Тренировки U-10
  {
    id: 'u10-training-august',
    title: 'Тренировки U-10 — Август 2026',
    description: 'Будни младшей группы: разминка, упражнения с мячом, первые двусторонки.',
    category: 'training',
    date: '2026-08-15',
    venue: 'Манеж «Динамо»',
    photosCount: 8,
    coverPhotoId: 'u10-training-august-p1',
    photos: makePhotos('u10-training-august', 8, 'Тренировка U-10', ASPECTS_MIXED),
  },
  // 2. Матчи Осеннего кубка
  {
    id: 'autumn-cup-matches',
    title: 'Осенний кубок — групповой этап',
    description: 'Матчи Осеннего кубка Ставрополя среди команд U-10. Эмоции, голы, праздник.',
    category: 'matches',
    date: '2026-08-20',
    venue: 'Стадион «Динамо»',
    photosCount: 8,
    coverPhotoId: 'autumn-cup-matches-p1',
    photos: makePhotos('autumn-cup-matches', 8, 'Матч', ASPECTS_MIXED),
  },
  // 3. Турнир (финал Весеннего кубка 2026 — мы победили)
  {
    id: 'spring-cup-final',
    title: 'Финал Весеннего кубка 2026',
    description: 'Наши U-10 взяли кубок! Финальный матч против Спартака — 2:0, эмоции, кубок над головой.',
    category: 'tournaments',
    date: '2026-04-25',
    venue: 'Стадион «Динамо»',
    photosCount: 8,
    coverPhotoId: 'spring-cup-final-p1',
    photos: makePhotos('spring-cup-final', 8, 'Финал', ASPECTS_LANDSCAPE),
  },
  // 4. Событие — открытие сезона
  {
    id: 'season-opening-2026',
    title: 'Открытие сезона 2026/2027',
    description: 'Праздник для всей семьи: мастер-классы, конкурсы, фотозона, общая тренировка.',
    category: 'events',
    date: '2026-08-25',
    venue: 'Стадион «Динамо»',
    photosCount: 8,
    coverPhotoId: 'season-opening-2026-p1',
    photos: makePhotos('season-opening-2026', 8, 'Праздник', ASPECTS_MIXED),
  },
  // 5. Жизнь клуба — портреты игроков
  {
    id: 'player-portraits',
    title: 'Портреты игроков U-12',
    description: 'Фотосессия для афиши сезона 2026/2027. Характер каждого — во взгляде.',
    category: 'lifestyle',
    date: '2026-09-01',
    venue: 'Манеж «Динамо»',
    photosCount: 8,
    coverPhotoId: 'player-portraits-p1',
    photos: makePhotos('player-portraits', 8, 'Портрет', ASPECTS_PORTRAIT),
  },
  // 6. Турнир — Летний турнир 2025 (архив)
  {
    id: 'summer-cup-2025',
    title: 'Летний турнир 2025',
    description: 'Архив: турнир среди U-12 летом 2025. Серебро клуба.',
    category: 'tournaments',
    date: '2025-07-15',
    venue: 'Манеж «Динамо»',
    photosCount: 8,
    coverPhotoId: 'summer-cup-2025-p1',
    photos: makePhotos('summer-cup-2025', 8, 'Турнир', ASPECTS_MIXED),
  },
]

/** Утилита: все фото одного альбома (используется для lightbox). */
export function photosOfAlbum(albumId: string): ReadonlyArray<GalleryPhoto> {
  return galleryMock.find((a) => a.id === albumId)?.photos ?? []
}
