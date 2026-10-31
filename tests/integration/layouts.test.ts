import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import App from '@/App.vue'
import HomePage from '@/pages/HomePage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import DefaultLayout from '@/shared/ui/layout/DefaultLayout.vue'
import BareLayout from '@/shared/ui/layout/BareLayout.vue'

const Stub = defineComponent({ render: () => h('div', 'содержимое страницы') })

const PATHS = ['/', '/teams', '/coaches', '/tournaments', '/gallery', '/contacts', '/team/:id', '/coach/:id', '/tournament/:id', '/player/:id']

function makeRouter(layout: unknown) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: layout as never, children: PATHS.map((p) => ({ path: p === '/' ? '' : p.slice(1), component: Stub })) },
      ...PATHS.filter((p) => p !== '/').map((p) => ({ path: p, component: Stub })),
    ],
  })
}

async function mountWith(layout: unknown, at = '/') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const r = makeRouter(layout)
  r.push(at)
  await r.isReady()
  const w = mount(App, { global: { plugins: [r, pinia] } })
  await flushPromises()
  return w
}

describe('DefaultLayout', () => {
  it('оборачивает страницу шапкой и подвалом', async () => {
    const w = await mountWith(DefaultLayout)
    expect(w.find('header').exists()).toBe(true)
    expect(w.find('footer').exists()).toBe(true)
    expect(w.text()).toContain('содержимое страницы')
  })

  it('содержимое лежит в <main> — семантика для скринридеров', async () => {
    const w = await mountWith(DefaultLayout)
    expect(w.find('main').exists()).toBe(true)
  })

  it('шапка одинакова на всех маршрутах (требование ТЗ)', async () => {
    const links = new Set<string>()
    for (const at of ['/', '/teams', '/coaches', '/contacts']) {
      const w = await mountWith(DefaultLayout, at)
      const nav = w.findAll('.header__nav-link').map((a) => a.attributes('href')).join(',')
      links.add(nav)
    }
    expect(links.size, 'состав меню различается между страницами').toBe(1)
  })
})

describe('BareLayout', () => {
  it('рендерит страницу без шапки и подвала', async () => {
    const w = await mountWith(BareLayout)
    expect(w.find('header').exists()).toBe(false)
    expect(w.find('footer').exists()).toBe(false)
    expect(w.text()).toContain('содержимое страницы')
  })
})

describe('HomePage', () => {
  async function home() {
    const pinia = createPinia()
    setActivePinia(pinia)
    const r = createRouter({
      history: createMemoryHistory(),
      routes: PATHS.map((path) => ({ path, component: Stub })),
    })
    r.push('/')
    await r.isReady()
    const w = mount(HomePage, { global: { plugins: [r, pinia] } })
    await flushPromises()
    await new Promise((res) => setTimeout(res, 200))
    await flushPromises()
    return w
  }

  it('собирает все секции главной', async () => {
    const w = await home()
    for (const cls of [
      '.hero', '.why-us', '.stats', '.groups',
      '.how-it-works', '.coaches-preview', '.tournaments-preview',
      '.cta',
    ]) {
      expect(w.find(cls).exists(), `нет секции ${cls}`).toBe(true)
    }
  })

  it('ровно один h1 на странице', async () => {
    const w = await home()
    expect(w.findAll('h1')).toHaveLength(1)
  })

  it('на главной нет ссылок без href', async () => {
    const w = await home()
    for (const a of w.findAll('a')) {
      expect(a.attributes('href'), `ссылка «${a.text().slice(0, 30)}» без href`).toBeTruthy()
    }
  })
})

describe('NotFoundPage', () => {
  async function notFound() {
    const r = createRouter({ history: createMemoryHistory(), routes: PATHS.map((path) => ({ path, component: Stub })) })
    r.push('/')
    await r.isReady()
    const w = mount(NotFoundPage, { global: { plugins: [r] } })
    await flushPromises()
    return w
  }

  it('объясняет, что страница не найдена', async () => {
    const w = await notFound()
    expect(w.find('h1').text()).toContain('не найдена')
  })

  it('даёт путь обратно на сайт', async () => {
    const w = await notFound()
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('/')
    for (const a of w.findAll('a')) expect(a.attributes('href')).toBeTruthy()
  })
})
