// Apollo Client. Один экземпляр на всё приложение.
// Адрес HTTP-эндпоинта берётся из env через app.config.ts.
//
// WebSocket-линк для подписок убран: подписок на сайте нет, а graphql-ws
// лежал в стартовом чанке у каждого посетителя.

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client/core'
import { appConfig } from '../config/app.config'
import { GRAPHQL_TIMEOUT_MS } from '@/shared/api/config'

/**
 * fetch с таймаутом.
 *
 * Раньше в fetchOptions лежал только комментарий про 15 секунд, а таймаута
 * не было: при недоступном бэкенде запрос висел до дефолтного таймаута
 * браузера, и страница оставалась в состоянии загрузки.
 */
export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GRAPHQL_TIMEOUT_MS)
  // Apollo отменяет запрос своим сигналом (ушли со страницы) — его нельзя
  // терять, иначе отменённые запросы досиживают до таймаута.
  const outer = init?.signal
  if (outer) {
    if (outer.aborted) controller.abort()
    else outer.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

// --- HTTP ----------------------------------------------------------------
// Запросы публичные: cookie на API не нужны (credentials по умолчанию —
// same-origin), и CORS не обязан разрешать Allow-Credentials.
const httpLink = new HttpLink({
  uri: appConfig.graphqlHttp,
  fetch: fetchWithTimeout,
})

// --- Простой лог-линк (видно запросы/ошибки в devtools) ------------------
const logLink = new ApolloLink((operation, forward) => {
  if (import.meta.env.DEV) {
     
    console.debug(`[GraphQL →] ${operation.operationName ?? '<anonymous>'}`, operation.variables)
  }
  return forward(operation).map((response) => {
    if (import.meta.env.DEV && 'errors' in response && response.errors) {
       
      console.warn(`[GraphQL ←] ${operation.operationName ?? '<anonymous>'} errors:`, response.errors)
    }
    return response
  })
})

export const apolloClient = new ApolloClient({
  link: logLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Списки — без merge-логики, всегда свежие из сети
          teams:       { merge: false },
          coaches:     { merge: false },
          tournaments: { merge: false },
          players:     { merge: false },
          albums:      { merge: false },
          reviews:     { merge: false },
        },
      },
      // id достижений повторяются у разных игроков (a1, a2…): с нормализацией
      // по id все игроки показывали бы одни и те же достижения.
      PlayerAchievement: { keyFields: false },
    },
  }),
  devtools: { enabled: import.meta.env.DEV },
  defaultOptions: {
    watchQuery:    { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
    query:         { fetchPolicy: 'network-only',     errorPolicy: 'all' },
    mutate:        { errorPolicy: 'all' },
  },
})
