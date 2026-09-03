import { describe, it, expect, vi, afterEach } from 'vitest'
import { createApp } from 'vue'
import { apolloClient, fetchWithTimeout } from '@/app/providers/apollo'
import { apolloProvider } from '@/app/providers/apollo-provider'
import { GRAPHQL_TIMEOUT_MS } from '@/shared/api/config'
import { appConfig } from '@/app/config/app.config'

describe('app/providers/apollo', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('клиент создан и настроен на адрес из конфига', () => {
    expect(apolloClient).toBeTruthy()
    expect(appConfig.graphqlHttp).toMatch(/^https?:\/\//)
  })

  it('плагин отдаёт клиента через provide', () => {
    const app = createApp({ render: () => null })
    app.use(apolloProvider)
    const provides = (app._context as unknown as { provides: Record<PropertyKey, unknown> }).provides
    const values = Reflect.ownKeys(provides).map((k) => provides[k as string])
    expect(values).toContain(apolloClient)
  })

  it('плагин регистрирует клиента под именем default', () => {
    const app = createApp({ render: () => null })
    app.use(apolloProvider)
    const provides = (app._context as unknown as { provides: Record<PropertyKey, unknown> }).provides
    const clients = Reflect.ownKeys(provides)
      .map((k) => provides[k as string])
      .find((v) => v && typeof v === 'object' && 'default' in (v as object))
    expect((clients as { default: unknown }).default).toBe(apolloClient)
  })

  /**
   * Раньше в fetchOptions лежал только комментарий про таймаут, а самого
   * таймаута не было: при недоступном бэкенде запрос висел до дефолтного
   * таймаута браузера и страница оставалась в состоянии загрузки.
   */
  describe('fetchWithTimeout', () => {
    it('прокидывает ответ, если сервер ответил вовремя', async () => {
      const body = new Response('ok')
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(body))
      await expect(fetchWithTimeout('https://example.com/query')).resolves.toBe(body)
      vi.unstubAllGlobals()
    })

    it('передаёт AbortSignal в fetch', async () => {
      const spy = vi.fn().mockResolvedValue(new Response('ok'))
      vi.stubGlobal('fetch', spy)
      await fetchWithTimeout('https://example.com/query', { method: 'POST' })
      const init = spy.mock.calls[0][1] as RequestInit
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(init.method).toBe('POST')
      vi.unstubAllGlobals()
    })

    it('прерывает запрос по истечении таймаута', async () => {
      vi.stubGlobal('fetch', (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
        }),
      )
      vi.useFakeTimers()
      const promise = fetchWithTimeout('https://example.com/query')
      const assertion = expect(promise).rejects.toThrow('aborted')
      await vi.advanceTimersByTimeAsync(GRAPHQL_TIMEOUT_MS + 10)
      await assertion
      vi.unstubAllGlobals()
    })

    it('не прерывает запрос до истечения таймаута', async () => {
      let aborted = false
      vi.stubGlobal('fetch', (_url: string, init?: RequestInit) =>
        new Promise((resolve) => {
          init?.signal?.addEventListener('abort', () => { aborted = true })
          setTimeout(() => resolve(new Response('ok')), GRAPHQL_TIMEOUT_MS - 1000)
        }),
      )
      vi.useFakeTimers()
      const promise = fetchWithTimeout('https://example.com/query')
      await vi.advanceTimersByTimeAsync(GRAPHQL_TIMEOUT_MS - 500)
      await promise
      expect(aborted).toBe(false)
      vi.unstubAllGlobals()
    })

    it('таймаут задан разумной величиной', () => {
      expect(GRAPHQL_TIMEOUT_MS).toBeGreaterThan(1000)
      expect(GRAPHQL_TIMEOUT_MS).toBeLessThanOrEqual(30000)
    })
  })
})

describe('app/config/app.config', () => {
  it('siteUrl без завершающего слэша — иначе canonical получит двойной', () => {
    expect(appConfig.siteUrl.endsWith('/')).toBe(false)
  })

  it('allowIndexing — булево, а не строка из env', () => {
    expect(typeof appConfig.allowIndexing).toBe('boolean')
  })

  it('заголовок сайта задан', () => {
    expect(appConfig.title).toBeTruthy()
  })
})
