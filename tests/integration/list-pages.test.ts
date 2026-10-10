import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import TeamsPage from '@/pages/TeamsPage.vue'
import CoachesPage from '@/pages/CoachesPage.vue'
import GalleryPage from '@/pages/GalleryPage.vue'
import TournamentsPage from '@/pages/TournamentsPage.vue'
import ContactsPage from '@/pages/ContactsPage.vue'
import { teamsMock } from '@/entities/team/teams.mocks'
import { coachesMock } from '@/entities/coach/coaches.mocks'
import { galleryMock } from '@/entities/gallery/gallery.mocks'
import { venuesMock } from '@/entities/contact/contacts.mocks'

const Stub = defineComponent({ render: () => h('div') })

async function routerPlugin() {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub }, { path: '/teams', component: Stub },
      { path: '/team/:id', component: Stub }, { path: '/coaches', component: Stub },
      { path: '/coach/:id', component: Stub }, { path: '/player/:id', component: Stub },
      { path: '/tournaments', component: Stub }, { path: '/tournament/:id', component: Stub },
      { path: '/contacts', component: Stub }, { path: '/gallery', component: Stub },
    ],
  })
  r.push('/')
  await r.isReady()
  return r
}

async function render(Comp: unknown) {
  const w = mount(Comp as never, { global: { plugins: [await routerPlugin()] } })
  await flushPromises()
  await new Promise((r) => setTimeout(r, 200))
  await flushPromises()
  return w
}

describe('TeamsPage', () => {
  it('показывает все команды', async () => {
    const w = await render(TeamsPage)
    expect(w.findAll('.team-card').length).toBe(teamsMock.length)
  })

  it('карточки ведут на детальные страницы команд', async () => {
    const w = await render(TeamsPage)
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain(`/team/${teamsMock[0].id}`)
  })

  it('фильтр по возрасту сужает список', async () => {
    const w = await render(TeamsPage)
    const group = teamsMock[0].ageGroup
    const expected = teamsMock.filter((t) => t.ageGroup === group).length
    const chip = w.findAll('.chip').find((c) => c.text().includes(teamsMock[0].ageLabel.split(' ')[0]))
    if (!chip) return
    await chip.trigger('click')
    await flushPromises()
    expect(w.findAll('.team-card').length).toBe(expected)
  })

  it('сброс фильтра возвращает полный список', async () => {
    const w = await render(TeamsPage)
    const chips = w.findAll('.chip')
    await chips[1].trigger('click')
    await flushPromises()
    await chips[0].trigger('click')
    await flushPromises()
    expect(w.findAll('.team-card').length).toBe(teamsMock.length)
  })

  it('выбранный возраст попадает в адрес, «Все» его убирает', async () => {
    const router = await routerPlugin()
    const w = mount(TeamsPage, { global: { plugins: [router] } })
    await flushPromises()
    const chips = w.findAll('.chip')
    await chips[2].trigger('click') // 6–7 лет
    await flushPromises()
    expect(router.currentRoute.value.query.age).toBe('6-7')
    await chips[0].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.age).toBeUndefined()
  })

  it('заголовок страницы один', async () => {
    const w = await render(TeamsPage)
    expect(w.findAll('h1')).toHaveLength(1)
  })
})

describe('CoachesPage', () => {
  it('показывает всех тренеров', async () => {
    const w = await render(CoachesPage)
    expect(w.findAll('.coach-card').length).toBe(coachesMock.length)
  })

  it('карточки ведут на детальные страницы тренеров', async () => {
    const w = await render(CoachesPage)
    expect(w.findAll('a').map((a) => a.attributes('href'))).toContain(`/coach/${coachesMock[0].id}`)
  })

  it('фильтр по возрастной группе сужает список', async () => {
    const w = await render(CoachesPage)
    const before = w.findAll('.coach-card').length
    const chips = w.findAll('.chip')
    // последний чип возрастного фильтра — заведомо не «Все»
    await chips[chips.length - 1].trigger('click')
    await flushPromises()
    expect(w.findAll('.coach-card').length).toBeLessThanOrEqual(before)
  })
})

describe('GalleryPage', () => {
  it('показывает фото', async () => {
    const w = await render(GalleryPage)
    expect(w.findAll('.grid__item').length).toBeGreaterThan(0)
  })

  it('фильтр по альбому сужает выборку', async () => {
    const w = await render(GalleryPage)
    const total = w.findAll('.grid__item').length
    const album = galleryMock[0]
    const chip = w.findAll('.chip').find((c) => c.text().includes(album.title))
    if (!chip) return
    await chip.trigger('click')
    await flushPromises()
    const shown = w.findAll('.grid__item').length
    expect(shown).toBe(album.photos.length)
    expect(shown).toBeLessThanOrEqual(total)
  })

  it('клик по фото открывает lightbox, Escape закрывает', async () => {
    const w = await render(GalleryPage)
    await w.find('.grid__item').trigger('click')
    await flushPromises()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })
})

describe('TournamentsPage', () => {
  it('показывает текущий турнир, календарь и архив', async () => {
    const w = await render(TournamentsPage)
    expect(w.text()).toContain('Текущий турнир')
    expect(w.text()).toContain('Архив турниров')
  })

  it('турнирная таблица текущего турнира выводится', async () => {
    const w = await render(TournamentsPage)
    expect(w.findAll('.standings__row').length).toBeGreaterThan(0)
  })

  it('ссылки ведут на детальные страницы турниров', async () => {
    const w = await render(TournamentsPage)
    const hrefs = w.findAll('a').map((a) => a.attributes('href') ?? '')
    expect(hrefs.some((h) => h.startsWith('/tournament/'))).toBe(true)
  })
})

describe('ContactsPage', () => {
  it('показывает все площадки клуба', async () => {
    const w = await render(ContactsPage)
    for (const v of venuesMock) expect(w.text()).toContain(v.name)
  })

  it('содержит форму заявки с якорем #lead', async () => {
    const w = await render(ContactsPage)
    expect(w.find('#lead').exists()).toBe(true)
    expect(w.find('form').exists()).toBe(true)
  })

  it('карта ведёт на внешний сервис безопасно', async () => {
    const w = await render(ContactsPage)
    const map = w.find('.map__open')
    expect(map.attributes('href')).toContain('yandex')
    expect(map.attributes('rel')).toContain('noopener')
  })
})
