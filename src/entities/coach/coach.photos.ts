// Фото тренеров: портреты в одном масштабе (лицо + шея) на клубном полосатом фоне.
// Файлы — public/images/coaches/<id>-{200,600}.{webp,jpg}. Тренер без записи
// здесь показывается заглушкой (градиент + инициалы).
// Исходники и скрипт: ~/Pictures/coaches-photos (scripts/headshot.py) на бете.

const WITH_PHOTO = new Set(['sergey-ushakov', 'roman-manuylo', 'andrey-kopylov', 'rolan-chadaev'])

export interface CoachPhoto {
  /** jpg 600×600 — запасной src */
  src: string
  srcsetJpg: string
  srcsetWebp: string
}

export function coachPhoto(id: string): CoachPhoto | null {
  if (!WITH_PHOTO.has(id)) return null
  const b = `/images/coaches/${id}`
  return {
    src: `${b}-600.jpg`,
    srcsetJpg: `${b}-200.jpg 200w, ${b}-600.jpg 600w`,
    srcsetWebp: `${b}-200.webp 200w, ${b}-600.webp 600w`,
  }
}
