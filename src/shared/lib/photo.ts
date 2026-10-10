/** «placeholder://…» — не адрес картинки, а заглушка из старого демо-контента. */
export function isRealPhoto(url: string | null | undefined): boolean {
  return /^https?:\/\//i.test(url ?? '')
}
