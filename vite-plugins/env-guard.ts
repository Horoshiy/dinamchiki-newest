import type { Plugin } from 'vite'

/**
 * Защита от раскатки боевой сборки с бета-настройками.
 *
 * Самая незаметная ошибка при переходе бета → прод: собрать прод с
 * VITE_GRAPHQL_HTTP, оставшимся на бета-домене. Сайт будет работать,
 * но ходить в бета-бэкенд, и заметить это можно очень нескоро.
 *
 * Поэтому сборка с VITE_ALLOW_INDEXING=true и бета-хостом падает.
 */

/** Хосты бета-окружения. Дополнять при появлении новых. */
const BETA_HOSTS = ['flowise.dinamchiki.ru', 'apigql.dinamchiki.ru']

export function envGuardPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dinamchiki-env-guard',
    apply: 'build',
    buildStart() {
      const isProdBuild = env.VITE_ALLOW_INDEXING === 'true'
      if (!isProdBuild) return

      const problems: string[] = []

      for (const key of ['VITE_GRAPHQL_HTTP', 'VITE_GRAPHQL_WS', 'VITE_SITE_URL'] as const) {
        const value = env[key] ?? ''
        if (!value) {
          problems.push(`${key} не задан`)
          continue
        }
        if (value.includes('<')) {
          problems.push(`${key} содержит незаполненный плейсхолдер: ${value}`)
          continue
        }
        const beta = BETA_HOSTS.find((h) => value.includes(h))
        if (beta) problems.push(`${key} указывает на бета-хост ${beta}: ${value}`)
      }

      const phone = env.VITE_CLUB_PHONE ?? ''
      if (phone.includes('X') || phone.includes('<')) {
        problems.push(`VITE_CLUB_PHONE не заполнен: ${phone}`)
      }

      if (problems.length > 0) {
        this.error(
          'Боевая сборка с бета-настройками:\n  - ' +
            problems.join('\n  - ') +
            '\n\nЗаполните .env.production (см. .env.production.example) ' +
            'или соберите бету с VITE_ALLOW_INDEXING=false.',
        )
      }
    },
  }
}
