// Apollo Client. Один экземпляр на всё приложение.
// InMemoryCache — дефолт. Подписки включены (пригодится в Этапе 11).
// Адрес HTTP-эндпоинта берётся из env через app.config.ts.

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  ApolloLink,
} from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
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
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

// --- HTTP ----------------------------------------------------------------
const httpLink = new HttpLink({
  uri: appConfig.graphqlHttp,
  credentials: 'include',
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

// --- WS (subscriptions) — необязательный, но не мешает -------------------
let wsLink: GraphQLWsLink | null = null
try {
  wsLink = new GraphQLWsLink(
    createClient({
      url: appConfig.graphqlWs,
      retryAttempts: 3,
    }),
  )
} catch (err) {
  // Если браузер не поддерживает WS — просто работаем без подписок.
  if (import.meta.env.DEV) {
     
    console.warn('[Apollo] WS link disabled:', err)
  }
}

// --- Split: подписки через WS, остальное через HTTP -----------------------
const splitLink = wsLink
  ? split(
      ({ query }) => {
        const def = getMainDefinition(query)
        return def.kind === 'OperationDefinition' && def.operation === 'subscription'
      },
      wsLink,
      logLink.concat(httpLink),
    )
  : logLink.concat(httpLink)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Списки — без merge-логики, всегда свежие из сети
          teams:       { merge: false },
          coaches:     { merge: false },
          tournaments: { merge: false },
          matches:     { merge: false },
          players:     { merge: false },
          galleryAlbums: { merge: false },
          reviews:     { merge: false },
        },
      },
    },
  }),
  connectToDevTools: import.meta.env.DEV,
  defaultOptions: {
    watchQuery:    { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
    query:         { fetchPolicy: 'network-only',     errorPolicy: 'all' },
    mutate:        { errorPolicy: 'all' },
  },
})
