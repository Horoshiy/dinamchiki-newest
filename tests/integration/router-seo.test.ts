import { describe, it, expect, beforeEach } from 'vitest'
import { router } from '@/router'
import { appConfig } from '@/app/config/app.config'

/**
 * SEO-мета выставляется в router.afterEach. Раньше canonical и og:url
 * строились из window.location.origin — стенд объявлял каноничными
 * собственные адреса вместо боевого домена.
 */

function meta(name: string) {
  return document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content
}
function og(property: string) {
  return document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.content
}
function canonical() {
  return document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href
}

async function go(path: string) {
  await router.push(path)
  await router.isReady()
  // afterEach отрабатывает синхронно после навигации
  await Promise.resolve()
}

describe('роутер: маршруты', () => {
  it.each([
    '/', '/teams', '/coaches', '/tournaments', '/gallery', '/contacts',
    '/team/u12-blue', '/coach/maria-petrova', '/tournament/autumn-cup-2026', '/player/misha-orlov',
  ])('%s резолвится в существующий компонент', (path) => {
    const resolved = router.resolve(path)
    expect(resolved.matched.length, `${path} не сопоставлен ни с одним маршрутом`).toBeGreaterThan(0)
    expect(resolved.name).not.toBe('not-found-page')
  })

  it('неизвестный путь попадает в 404', () => {
    expect(router.resolve('/такой-страницы-нет').name).toBe('not-found-page')
  })

  it('детальные маршруты передают id как props', () => {
    const r = router.resolve('/player/misha-orlov')
    expect(r.params.id).toBe('misha-orlov')
    expect(r.matched.some((m) => m.props.default === true)).toBe(true)
  })

  it('все публичные маршруты имеют title и description', () => {
    for (const path of ['/', '/teams', '/coaches', '/tournaments', '/gallery', '/contacts']) {
      const m = router.resolve(path).meta
      expect(m.title, `${path}: нет title`).toBeTruthy()
      expect(m.description, `${path}: нет description`).toBeTruthy()
    }
  })

  it('404 помечен noIndex', () => {
    expect(router.resolve('/нет-такой').meta.noIndex).toBe(true)
  })
})

describe('роутер: SEO-мета', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('title собирается из meta и имени сайта', async () => {
    await go('/teams')
    expect(document.title).toContain('Группы и расписание')
    expect(document.title).toContain('Динамчики')
  })

  it('description берётся из meta маршрута', async () => {
    await go('/coaches')
    expect(meta('description')).toBe(router.resolve('/coaches').meta.description)
  })

  it('canonical строится из VITE_SITE_URL, а не из origin вкладки', async () => {
    await go('/teams')
    expect(canonical()).toBe(`${appConfig.siteUrl}/teams`)
    expect(canonical()).not.toContain('localhost')
  })

  it('og:url тоже опирается на канонический домен', async () => {
    await go('/contacts')
    expect(og('og:url')).toBe(`${appConfig.siteUrl}/contacts`)
  })

  it('og:title и og:description заполняются', async () => {
    await go('/gallery')
    expect(og('og:title')).toContain('Галерея')
    expect(og('og:description')).toBeTruthy()
  })

  it('og:image задан на каждой публичной странице', async () => {
    for (const path of ['/', '/teams', '/coaches', '/tournaments', '/gallery', '/contacts']) {
      await go(path)
      expect(og('og:image'), `${path}: нет og:image`).toBeTruthy()
    }
  })

  it('twitter-карточка заполняется', async () => {
    await go('/')
    expect(meta('twitter:title')).toBeTruthy()
    expect(meta('twitter:description')).toBeTruthy()
    expect(meta('twitter:image')).toBeTruthy()
  })

  /**
   * Стенд не должен индексироваться целиком, даже на страницах,
   * у которых нет meta.noIndex.
   */
  it('на неиндексируемой сборке robots = noindex на любой странице', async () => {
    await go('/teams')
    if (!appConfig.allowIndexing) {
      expect(meta('robots')).toBe('noindex, nofollow')
    } else {
      expect(meta('robots')).toBe('index, follow')
    }
  })

  it('404 всегда noindex', async () => {
    await go('/несуществующая')
    expect(meta('robots')).toBe('noindex, nofollow')
  })

  it('мета не дублируются при повторных переходах', async () => {
    await go('/teams')
    await go('/coaches')
    await go('/teams')
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('meta[property="og:url"]')).toHaveLength(1)
  })

  it('canonical обновляется при переходе', async () => {
    await go('/teams')
    expect(canonical()).toBe(`${appConfig.siteUrl}/teams`)
    await go('/gallery')
    expect(canonical()).toBe(`${appConfig.siteUrl}/gallery`)
  })
})

describe('роутер: прокрутка к якорю', () => {
  /**
   * Страницы грузятся лениво, поэтому на момент навигации элемента якоря
   * ещё нет в DOM и обычный { el: hash } молча ничего не делает.
   */
  it('scrollBehavior ждёт появления элемента и возвращает его с отступом', async () => {
    const el = document.createElement('div')
    el.id = 'lead'
    document.body.appendChild(el)
    const result = await router.options.scrollBehavior!(
      router.resolve('/contacts#lead'),
      router.resolve('/'),
      null,
    )
    expect(result).toMatchObject({ el: '#lead', behavior: 'smooth' })
    expect((result as { top: number }).top).toBeGreaterThan(0)
    el.remove()
  })

  it('если элемента так и не появилось — уводит наверх, а не зависает', async () => {
    const result = await router.options.scrollBehavior!(
      router.resolve('/contacts#такого-якоря-нет'),
      router.resolve('/'),
      null,
    )
    expect(result).toEqual({ top: 0 })
  })

  it('навигация без хеша уводит наверх', async () => {
    const result = await router.options.scrollBehavior!(router.resolve('/teams'), router.resolve('/'), null)
    expect(result).toEqual({ top: 0 })
  })

  it('сохранённая позиция возвращается при переходе назад', async () => {
    const saved = { left: 0, top: 420 }
    const result = await router.options.scrollBehavior!(router.resolve('/teams'), router.resolve('/'), saved)
    expect(result).toEqual(saved)
  })
})
