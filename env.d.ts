/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_HTTP: string
  readonly VITE_GRAPHQL_WS: string
  readonly VITE_APP_TITLE: string
  /** Канонический адрес сборки — источник canonical, og:url и sitemap. */
  readonly VITE_SITE_URL: string
  /** 'true' — разрешить индексацию. На стенде должно быть 'false'. */
  readonly VITE_ALLOW_INDEXING: string
  /** Телефон клуба для JSON-LD. */
  readonly VITE_CLUB_PHONE: string
  /** Номер счётчика Яндекс.Метрики. На стенде не задаётся. */
  readonly VITE_YM_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
