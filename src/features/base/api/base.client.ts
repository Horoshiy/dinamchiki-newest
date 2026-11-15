// HTTP-клиент «Тайной базы». Same-origin прокси /api/base/ → бот /api/v1/base/.
// Токен передаётся явно (child или staff) — клиент не хранит состояние.
import { appConfig } from '@/app/config/app.config'

export class BaseApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'BaseApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

const TIMEOUT_MS = 12000

function url(path: string): string {
  const base = appConfig.baseApi.replace(/\/+$/, '')
  return `${base}/${path.replace(/^\/+/, '')}`
}

export async function baseRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const onAbort = () => controller.abort()
  opts.signal?.addEventListener('abort', onAbort)

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`

  try {
    const res = await fetch(url(path), {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    })
    const text = await res.text()
    let data: unknown = null
    if (text) {
      try { data = JSON.parse(text) } catch { data = null }
    }
    if (!res.ok) {
      const msg = (data as { error?: string } | null)?.error || defaultError(res.status)
      throw new BaseApiError(res.status, msg)
    }
    return data as T
  } catch (e) {
    if (e instanceof BaseApiError) throw e
    if ((e as Error).name === 'AbortError') {
      throw new BaseApiError(0, 'База не отвечает. Проверь связь и попробуй ещё раз.')
    }
    throw new BaseApiError(0, 'Не удалось связаться с базой. Попробуй ещё раз.')
  } finally {
    clearTimeout(timer)
    opts.signal?.removeEventListener('abort', onAbort)
  }
}

function defaultError(status: number): string {
  switch (status) {
    case 401: return 'Код не подошёл. Проверь и попробуй снова.'
    case 403: return 'Доступ запрещён.'
    case 404: return 'Не найдено.'
    case 429: return 'Слишком много попыток. Подожди немного.'
    case 503: return 'База временно недоступна.'
    default: return 'Что-то пошло не так. Попробуй ещё раз.'
  }
}