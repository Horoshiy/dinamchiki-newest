import { appConfig } from '@/app/config/app.config'

/**
 * Яндекс.Метрика. Подключается, только если в сборке задан VITE_YM_ID:
 * стенд не должен портить статистику боевого сайта.
 *
 * Счётчик инициализируется с defer: true, просмотры отправляет роутер
 * на каждом переходе — иначе SPA засчитывала бы только первую страницу.
 * При пререндере (scripts/prerender.mjs) счётчик не грузится, чтобы его
 * тег не попал в статический HTML.
 */

type Ym = ((id: number, method: string, ...args: unknown[]) => void) & { a?: unknown[][]; l?: number }

declare global {
  interface Window {
    ym?: Ym
  }
}

export const PRERENDER_UA_MARK = 'DinamchikiPrerender'

let initialized = false
let previousUrl: string | null = null

function init(id: number) {
  const ym: Ym = (...args) => {
    ;(ym.a = ym.a || []).push(args)
  }
  ym.l = Date.now()
  window.ym = ym

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://mc.yandex.ru/metrika/tag.js'
  document.head.appendChild(script)

  window.ym(id, 'init', {
    defer: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  })
  initialized = true
}

export function trackPageView(url: string) {
  const id = appConfig.metrikaId
  if (!id || navigator.userAgent.includes(PRERENDER_UA_MARK)) return
  if (!initialized) init(id)
  // Для переходов внутри сайта источник — предыдущая страница, а не внешний referrer.
  const referer = previousUrl ? `${location.origin}${previousUrl}` : document.referrer
  window.ym?.(id, 'hit', url, { referer })
  previousUrl = url
}
