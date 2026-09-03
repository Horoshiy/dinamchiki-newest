import { describe, it, expect, vi } from 'vitest'
import { envGuardPlugin } from '../../vite-plugins/env-guard'

/**
 * Самая незаметная ошибка при переходе бета → прод — собрать боевую версию
 * с адресом бета-бэкенда. Сайт работает, но данные берёт не оттуда, и
 * заметить это можно очень нескоро. Сборка обязана падать.
 */
function build(env: Record<string, string>) {
  const errors: string[] = []
  const ctx = { error: vi.fn((msg: string) => { errors.push(msg); throw new Error(msg) }) }
  const plugin = envGuardPlugin(env) as unknown as { buildStart: (this: typeof ctx) => void }
  try {
    plugin.buildStart.call(ctx)
  } catch {
    // this.error в Rollup бросает — нас интересует текст
  }
  return errors.join('\n')
}

const VALID_PROD = {
  VITE_ALLOW_INDEXING: 'true',
  VITE_GRAPHQL_HTTP: 'https://api.example.ru/query',
  VITE_GRAPHQL_WS: 'wss://api.example.ru/query',
  VITE_SITE_URL: 'https://example.ru',
  VITE_CLUB_PHONE: '+78652123456',
}

describe('vite-plugins/env-guard', () => {
  it('работает только на сборке', () => {
    expect(envGuardPlugin({}).apply).toBe('build')
  })

  it('корректная боевая сборка проходит', () => {
    expect(build(VALID_PROD)).toBe('')
  })

  it('бета-сборка не проверяется — там бета-хосты законны', () => {
    expect(build({
      VITE_ALLOW_INDEXING: 'false',
      VITE_GRAPHQL_HTTP: 'https://apigql.dinamchiki.ru/query',
      VITE_SITE_URL: 'https://flowise.dinamchiki.ru',
    })).toBe('')
  })

  it.each([
    ['VITE_GRAPHQL_HTTP', 'https://apigql.dinamchiki.ru/query'],
    ['VITE_GRAPHQL_WS', 'wss://apigql.dinamchiki.ru/query'],
    ['VITE_SITE_URL', 'https://flowise.dinamchiki.ru'],
  ])('боевая сборка падает, если %s указывает на бету', (key, value) => {
    const out = build({ ...VALID_PROD, [key]: value })
    expect(out).toContain('бета-хост')
    expect(out).toContain(key)
  })

  it('незаполненный плейсхолдер из шаблона валит сборку', () => {
    const out = build({ ...VALID_PROD, VITE_SITE_URL: 'https://<боевой-домен>' })
    expect(out).toContain('плейсхолдер')
  })

  it('пропущенная переменная валит сборку', () => {
    const out = build({ ...VALID_PROD, VITE_GRAPHQL_HTTP: '' })
    expect(out).toContain('не задан')
  })

  it('незаполненный телефон валит сборку', () => {
    expect(build({ ...VALID_PROD, VITE_CLUB_PHONE: '+7XXXXXXXXXX' })).toContain('VITE_CLUB_PHONE')
  })

  it('сообщение объясняет, что делать', () => {
    const out = build({ ...VALID_PROD, VITE_SITE_URL: 'https://flowise.dinamchiki.ru' })
    expect(out).toContain('.env.production')
    expect(out).toContain('VITE_ALLOW_INDEXING=false')
  })

  it('перечисляются все проблемы разом, а не первая', () => {
    const out = build({
      VITE_ALLOW_INDEXING: 'true',
      VITE_GRAPHQL_HTTP: 'https://apigql.dinamchiki.ru/query',
      VITE_GRAPHQL_WS: '',
      VITE_SITE_URL: 'https://<боевой-домен>',
      VITE_CLUB_PHONE: '+7XXXXXXXXXX',
    })
    expect(out).toContain('VITE_GRAPHQL_HTTP')
    expect(out).toContain('VITE_GRAPHQL_WS')
    expect(out).toContain('VITE_SITE_URL')
    expect(out).toContain('VITE_CLUB_PHONE')
  })
})
