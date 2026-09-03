// =============================================================================
// Конфиг GraphQL-слоя.
//
// USE_MOCKS_ONLY = true  — фронт НЕ ходит на бэкенд, всегда моки.
// USE_MOCKS_ONLY = false — фронт идёт в бэкенд, при ошибке падает на мок.
//
// Бэкенд развёрнут: apigql.dinamchiki.ru (systemd-юнит dinamchiki-gql,
// исходники в /home/clawd/dinamchiki-gql). Приём заявок работает —
// submitApplication пишет в SQLite на сервере.
//
// Вернуть true имеет смысл только для локальной работы без сети.
// =============================================================================

export const USE_MOCKS_ONLY = false

/** Таймаут GraphQL-запроса (мс). Используется в HttpLink (app/providers/apollo.ts). */
export const GRAPHQL_TIMEOUT_MS = 8000
