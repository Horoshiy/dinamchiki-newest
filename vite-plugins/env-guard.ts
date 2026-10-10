import type { Plugin } from 'vite'

/**
 * Проверка окружения перед сборкой.
 *
 * Любая сборка (бета или прод) падает, если не задан адрес API или сайта
 * либо в нём остался плейсхолдер из *.example. Раньше Docker-образ собирался
 * без .env (его отсекал .dockerignore) и молча выходил с API
 * «graphql-endpoint-not-configured.invalid» и литералами %VITE_SITE_URL% в HTML.
 *
 * Боевая сборка (VITE_ALLOW_INDEXING=true) дополнительно не должна смотреть
 * на бета-хосты: сайт работал бы, но ходил в бета-бэкенд, и заметили бы
 * это очень нескоро.
 */

/** Хосты бета-окружения. Дополнять при появлении новых. */
const BETA_HOSTS = ['flowise.dinamchiki.ru', 'apigql.dinamchiki.ru']

const REQUIRED = ['VITE_GRAPHQL_HTTP', 'VITE_SITE_URL', 'VITE_CLUB_PHONE'] as const

/** Ошибки окружения; пустой массив — можно собирать. */
export function checkEnv(env: Record<string, string>): string[] {
  const problems: string[] = []

  for (const key of REQUIRED) {
    const value = env[key] ?? ''
    if (!value) problems.push(`${key} не задан`)
    else if (value.includes('<') || /X{3,}/.test(value)) {
      problems.push(`${key} содержит незаполненный плейсхолдер: ${value}`)
    }
  }

  if (env.VITE_ALLOW_INDEXING === 'true') {
    for (const key of ['VITE_GRAPHQL_HTTP', 'VITE_SITE_URL'] as const) {
      const beta = BETA_HOSTS.find((h) => (env[key] ?? '').includes(h))
      if (beta) problems.push(`${key} указывает на бета-хост ${beta}: ${env[key]}`)
    }
  }

  return problems
}

export function envGuardPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dinamchiki-env-guard',
    apply: 'build',
    buildStart() {
      const problems = checkEnv(env)
      if (problems.length > 0) {
        this.error(
          'Окружение сборки не заполнено:\n  - ' +
            problems.join('\n  - ') +
            '\n\nБета — .env (см. .env.example), прод — .env.production ' +
            '(см. .env.production.example).',
        )
      }
    },
  }
}
