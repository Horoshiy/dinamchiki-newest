import { appConfig } from '@/app/config/app.config'

/**
 * Яндекс.Метрика. Подключается, только если в сборке задан VITE_YM_ID:
 * стенд не должен портить статистику боевого сайта.
 *
 * Счётчик инициализируется с defer: true, просмотры отправляет роутер
 * на каждом переходе — иначе SPA засчитывала бы только первую страницу.
 * При пререндере (scripts/prerender.mjs) счётчик не грузится, чтобы его
 * тег не попал в статический HTML.
 *
 * Счётчик ставит cookie и собирает IP и данные устройства, поэтому
 * запускается только после согласия в баннере (CookieNotice.vue). До этого
 * просмотры не отправляются; последний запоминается и уходит после согласия.
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
let pendingUrl: string | null = null
let consentInSession = false

const CONSENT_KEY = 'dinamchiki-cookie-consent'

/** Счётчик вообще включён в этой сборке (на бете VITE_YM_ID пуст). */
export function isMetrikaEnabled(): boolean {
  return !!appConfig.metrikaId && !navigator.userAgent.includes(PRERENDER_UA_MARK)
}

export function hasCookieConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === '1'
  } catch {
    return false
  }
}

/** Посетитель согласился: запомнить и отправить отложенный просмотр. */
export function acceptCookies() {
  try {
    localStorage.setItem(CONSENT_KEY, '1')
  } catch {
    // Приватный режим: согласие действует до закрытия вкладки.
  }
  consentInSession = true
  if (pendingUrl) {
    const url = pendingUrl
    pendingUrl = null
    trackPageView(url)
  }
}

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
  if (!id || !isMetrikaEnabled()) return
  if (!consentInSession && !hasCookieConsent()) {
    pendingUrl = url
    return
  }
  if (!initialized) init(id)
  // Для переходов внутри сайта источник — предыдущая страница, а не внешний referrer.
  const referer = previousUrl ? `${location.origin}${previousUrl}` : document.referrer
  window.ym?.(id, 'hit', url, { referer })
  previousUrl = url
}
