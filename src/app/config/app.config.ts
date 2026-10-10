// Конфигурация приложения. Все env-доступы изолированы здесь,
// чтобы в остальном коде не размазывать import.meta.env.

export interface AppConfig {
  title: string
  graphqlHttp: string
  /** Канонический адрес сайта — база для canonical и og:url. */
  siteUrl: string
  /** Разрешена ли индексация этой сборки (на стенде — нет). */
  allowIndexing: boolean
  /** Номер счётчика Яндекс.Метрики; пусто — Метрика не подключается. */
  metrikaId: number | null
}

function readEnv(key: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[key]
  return (value && value.length > 0) ? value : fallback
}

/**
 * Адрес API берётся только из env.
 *
 * Раньше здесь стоял бета-хост как значение по умолчанию: боевая сборка
 * с забытой переменной молча ходила бы в бета-бэкенд. Теперь отсутствие
 * переменной видно сразу — запрос уходит на заведомо нерабочий адрес,
 * а сборка прода с бета-хостом падает (vite-plugins/env-guard.ts).
 */
const MISSING_API = 'https://graphql-endpoint-not-configured.invalid/query'

export const appConfig: AppConfig = {
  title: readEnv('VITE_APP_TITLE', 'ДФК «Динамчики»'),
  graphqlHttp: readEnv('VITE_GRAPHQL_HTTP', MISSING_API),
  // Без завершающего слэша — иначе canonical получит двойной.
  siteUrl: readEnv('VITE_SITE_URL', '').replace(/\/+$/, ''),
  allowIndexing: readEnv('VITE_ALLOW_INDEXING', 'false') === 'true',
  metrikaId: Number(readEnv('VITE_YM_ID', '')) || null,
}
