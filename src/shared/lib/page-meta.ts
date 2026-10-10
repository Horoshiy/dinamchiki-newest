import { watchEffect } from 'vue'
import { appConfig } from '@/app/config/app.config'

/**
 * Мета-теги страницы: <title>, description, og:*, twitter:*.
 *
 * Роутер выставляет их по `route.meta` при каждом переходе. Детальные страницы
 * (группа, тренер) знают заголовок только после загрузки данных — они
 * переопределяют его через usePageMeta. Пререндер (scripts/prerender.mjs)
 * сохраняет в HTML то, что стоит в <head> к моменту снимка.
 */

export const SITE_NAME = 'ДФК «Динамчики»'

export interface PageMeta {
  /** Заголовок без названия сайта — оно добавляется само. */
  title?: string
  description: string
  ogImage?: string
  /** Закрыть страницу от индексации (несуществующая группа, тренер и т.п.). */
  noIndex?: boolean
}

/**
 * Мета для «не найдено» на детальных страницах. Без noindex адрес
 * /team/xyz отдавал 200 с «index, follow» — поисковик считал его
 * настоящей страницей (soft 404).
 */
export const NOT_FOUND_META: PageMeta = {
  title: 'Страница не найдена',
  description: 'Такой страницы на сайте детского футбольного клуба «Динамчики» нет.',
  noIndex: true,
}

/**
 * ВКонтакте и Telegram не подставляют картинку превью по относительному
 * пути — нужен полный адрес. База — канонический домен из env.
 */
function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${appConfig.siteUrl}${path}`
}

export function applyPageMeta({ title, description, ogImage, noIndex }: PageMeta) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const image = absoluteUrl(ogImage ?? '/og/dinamchiki-cover.png')

  document.title = fullTitle
  setMeta('description', description)
  setOg('og:title', fullTitle)
  setOg('og:description', description)
  setOg('og:image', image)
  setMeta('twitter:title', fullTitle)
  setMeta('twitter:description', description)
  setMeta('twitter:image', image)
  if (noIndex) setMeta('robots', 'noindex, nofollow')
}

/** Мета из данных страницы: срабатывает, когда getter вернул не null. */
export function usePageMeta(getter: () => PageMeta | null) {
  watchEffect(() => {
    const meta = getter()
    if (meta) applyPageMeta(meta)
  })
}

export function setMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setOg(property: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}
