import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import AppHeader from '@/shared/ui/layout/AppHeader.vue'
import AppFooter from '@/shared/ui/layout/AppFooter.vue'
import { CLUB_PHONE_HREF, CLUB_PHONE_DISPLAY, SIGNUP_ROUTE } from '@/shared/config/club'

const Stub = defineComponent({ render: () => h('div') })

const ROUTES = ['/', '/teams', '/coaches', '/tournaments', '/gallery', '/contacts']

async function header(at = '/') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [...ROUTES, '/team/:id', '/coach/:id'].map((path) => ({ path, component: Stub })),
  })
  r.push(at)
  await r.isReady()
  const w = mount(AppHeader, { global: { plugins: [r, pinia] } })
  await flushPromises()
  return w
}

describe('AppHeader', () => {
  it('меню содержит все публичные разделы', async () => {
    const w = await header()
    const hrefs = w.findAll('.header__nav-link').map((a) => a.attributes('href'))
    for (const route of ROUTES) expect(hrefs).toContain(route)
  })

  /**
   * Пункт «Новости» вёл на /gallery — страницу с заголовком «Моменты из жизни
   * клуба». Раздела новостей в проекте нет, подменять его галереей нельзя.
   */
  it('пункт, ведущий в галерею, называется «Галерея», а не «Новости»', async () => {
    const w = await header()
    const link = w.findAll('.header__nav-link').find((a) => a.attributes('href') === '/gallery')
    expect(link!.text()).toBe('Галерея')
    expect(w.text()).not.toContain('Новости')
  })

  /** Главный конверсионный элемент раньше был инертной <button>. */
  it('кнопка «Записаться» — ссылка на форму записи', async () => {
    const w = await header()
    const cta = w.find('.header__cta')
    expect(cta.element.tagName).toBe('A')
    expect(cta.attributes('href')).toBe(SIGNUP_ROUTE)
  })

  it('телефон в шапке берётся из конфига клуба', async () => {
    const w = await header()
    const phone = w.find('.header__phone')
    expect(phone.attributes('href')).toBe(CLUB_PHONE_HREF)
    expect(phone.text()).toContain(CLUB_PHONE_DISPLAY)
  })

  it('активный пункт подсвечен на своей странице', async () => {
    const w = await header('/teams')
    const active = w.findAll('.header__nav-link--active')
    expect(active).toHaveLength(1)
    expect(active[0].attributes('href')).toBe('/teams')
  })

  /**
   * Детальные маршруты в единственном числе (`/coach/:id`), пункты меню —
   * во множественном (`/coaches`). Раньше префиксное сравнение не совпадало
   * и на любой детальной странице не подсвечивался ни один раздел.
   */
  it.each([
    ['/coach/maria-petrova', '/coaches'],
    ['/team/u12-blue', '/teams'],
    ['/tournament/autumn-cup-2026', '/tournaments'],
    ['/player/misha-orlov', '/teams'],
  ])('на %s подсвечен раздел %s', async (path, section) => {
    const w = await header(path)
    const active = w.findAll('.header__nav-link--active')
    expect(active, `на ${path} не подсвечен ни один раздел`).toHaveLength(1)
    expect(active[0].attributes('href')).toBe(section)
  })

  it('на главной подсвечен только первый пункт', async () => {
    const w = await header('/')
    expect(w.findAll('.header__nav-link--active')).toHaveLength(1)
  })

  it('бургер доступен для скринридера и переключает меню', async () => {
    const w = await header()
    const burger = w.find('.header__burger')
    expect(burger.attributes('aria-label')).toBeTruthy()
    expect(burger.attributes('aria-controls')).toBe('mobile-menu')
    expect(burger.attributes('aria-expanded')).toBe('false')
    await burger.trigger('click')
    expect(w.find('.header__burger').attributes('aria-expanded')).toBe('true')
    expect(w.find('#mobile-menu').classes()).toContain('mobile-menu--open')
  })

  it('переход по пункту мобильного меню закрывает его', async () => {
    const w = await header()
    await w.find('.header__burger').trigger('click')
    await w.find('.mobile-menu__link').trigger('click')
    await flushPromises()
    expect(w.find('#mobile-menu').classes()).not.toContain('mobile-menu--open')
  })

  it('кнопка записи в мобильном меню тоже ведёт на форму', async () => {
    const w = await header()
    const cta = w.findAll('.mobile-menu a').find((a) => a.text().includes('Записаться'))
    expect(cta?.attributes('href')).toBe(SIGNUP_ROUTE)
  })

  it('в шапке нет ссылок без href', async () => {
    const w = await header()
    for (const a of w.findAll('a')) {
      expect(a.attributes('href'), `ссылка «${a.text()}» без href`).toBeTruthy()
    }
  })
})

describe('AppFooter', () => {
  async function footer() {
    const r = createRouter({
      history: createMemoryHistory(),
      routes: ROUTES.map((path) => ({ path, component: Stub })),
    })
    r.push('/')
    await r.isReady()
    const w = mount(AppFooter, { global: { plugins: [r] } })
    await flushPromises()
    return w
  }

  it('в подвале нет ссылок без href', async () => {
    const w = await footer()
    for (const a of w.findAll('a')) {
      expect(a.attributes('href'), `ссылка «${a.text()}» без href`).toBeTruthy()
    }
  })

  it('внешние ссылки подвала открываются безопасно', async () => {
    const w = await footer()
    for (const a of w.findAll('a[target="_blank"]')) {
      expect(a.attributes('rel')).toContain('noopener')
    }
  })
})
