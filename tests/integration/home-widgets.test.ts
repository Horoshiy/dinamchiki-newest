import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import HomeHero from '@/widgets/home/HomeHero.vue'
import HomeStats from '@/widgets/home/HomeStats.vue'
import HomeWhyUs from '@/widgets/home/HomeWhyUs.vue'
import HomeGroups from '@/widgets/home/HomeGroups.vue'
import HomeHowItWorks from '@/widgets/home/HomeHowItWorks.vue'
import HomeCoachesPreview from '@/widgets/home/HomeCoachesPreview.vue'
import HomeGalleryPreview from '@/widgets/home/HomeGalleryPreview.vue'
import HomeTournamentsPreview from '@/widgets/home/HomeTournamentsPreview.vue'
import { homeContentMock, reviewsMock } from '@/entities/content/content.mocks'
import { coachesMock } from '@/entities/coach/coaches.mocks'
import { getCurrentTournament } from '@/entities/tournament/tournaments.mocks'
import { SIGNUP_ROUTE } from '@/shared/config/club'
import { clubYears } from '@/entities/club/club.facts'
import { teamsMock } from '@/entities/team/teams.mocks'

/**
 * Главная раньше держала данные литералами прямо в виджетах: она жила своей
 * жизнью и расходилась с остальными страницами (показывала турнир 2024 года,
 * пока /tournaments показывала 2026-й). Эти тесты проверяют, что каждый блок
 * рендерится ИЗ слоя данных, а не из констант в файле.
 */

const Stub = defineComponent({ render: () => h('div') })

async function routerPlugin() {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/teams', component: Stub },
      { path: '/coaches', component: Stub },
      { path: '/coach/:id', component: Stub },
      { path: '/contacts', component: Stub },
      { path: '/gallery', component: Stub },
      { path: '/tournaments', component: Stub },
      { path: '/tournament/:id', component: Stub },
    ],
  })
  r.push('/')
  await r.isReady()
  return r
}

async function render(Comp: unknown) {
  const w = mount(Comp as never, { global: { plugins: [await routerPlugin()] } })
  await flushPromises()
  await new Promise((r) => setTimeout(r, 150))
  await flushPromises()
  return w
}

describe('HomeHero', () => {
  it('заголовок и лид приходят из pageContent', async () => {
    const w = await render(HomeHero)
    expect(w.text()).toContain(homeContentMock.hero.titleLead)
    expect(w.text()).toContain(homeContentMock.hero.titleAccent)
    expect(w.text()).toContain(homeContentMock.hero.eyebrow)
    expect(w.text()).toContain(homeContentMock.hero.description.slice(0, 30))
  })

  it('ровно один h1 — требование семантики страницы', async () => {
    const w = await render(HomeHero)
    expect(w.findAll('h1')).toHaveLength(1)
  })

  it('главный CTA ведёт на форму записи и имеет href', async () => {
    const w = await render(HomeHero)
    const cta = w.findAll('a').find((a) => a.text().includes('Записаться'))
    expect(cta).toBeTruthy()
    expect(cta!.attributes('href')).toBe(SIGNUP_ROUTE)
  })

  it('второй CTA ведёт на команды', async () => {
    const w = await render(HomeHero)
    const link = w.findAll('a').find((a) => a.text().includes('Смотреть команды'))
    expect(link?.attributes('href')).toBe('/teams')
  })

  it('ни одна кнопка не осталась инертной', async () => {
    const w = await render(HomeHero)
    expect(w.findAll('.hero__actions button')).toHaveLength(0)
    expect(w.findAll('.hero__actions a').length).toBeGreaterThan(0)
  })
})

describe('HomeStats', () => {
  it('рендерит все метрики из pageContent', async () => {
    const w = await render(HomeStats)
    const cards = w.findAll('.stat-card')
    expect(cards).toHaveLength(homeContentMock.stats.length)
    // years и groups считаются сами — их проверяет следующий тест.
    for (const s of homeContentMock.stats.filter((x) => !['years', 'groups'].includes(x.id))) {
      expect(w.text()).toContain(s.value)
      expect(w.text()).toContain(s.label)
    }
  })

  it('возраст клуба и число групп считаются, а не берутся из админки', async () => {
    const w = await render(HomeStats)
    const byId = (id: string) =>
      w.findAll('.stat-card')[homeContentMock.stats.findIndex((x) => x.id === id)].text()
    expect(byId('years')).toContain(String(clubYears()))
    expect(byId('groups')).toContain(String(teamsMock.length))
  })

  it('у каждой метрики есть иконка из реестра', async () => {
    const w = await render(HomeStats)
    expect(w.findAll('.stat-card__icon')).toHaveLength(homeContentMock.stats.length)
  })
})

describe('HomeWhyUs', () => {
  it('рендерит все преимущества из pageContent', async () => {
    const w = await render(HomeWhyUs)
    expect(w.findAll('.why-us__item')).toHaveLength(homeContentMock.features.length)
    for (const f of homeContentMock.features) {
      expect(w.text()).toContain(f.title)
    }
  })
})

describe('HomeGroups', () => {
  it('рендерит все возрастные программы', async () => {
    const w = await render(HomeGroups)
    expect(w.findAll('.group')).toHaveLength(homeContentMock.programs.length)
  })

  it('«Подробнее» ведёт на команды с фильтром возраста', async () => {
    const w = await render(HomeGroups)
    const links = w.findAll('.group__link')
    expect(links).toHaveLength(homeContentMock.programs.length)
    links.forEach((l, i) => {
      expect(l.attributes('href')).toBe(`/teams?age=${homeContentMock.programs[i].ageGroup}`)
    })
  })
})

describe('HomeHowItWorks', () => {
  it('рендерит все шаги тренировки по порядку', async () => {
    const w = await render(HomeHowItWorks)
    const steps = w.findAll('.step')
    expect(steps).toHaveLength(homeContentMock.trainingSteps.length)
    steps.forEach((s, i) => {
      expect(s.text()).toContain(homeContentMock.trainingSteps[i].title)
      expect(s.find('.step__num').text()).toBe(String(i + 1))
    })
  })
})

describe('HomeCoachesPreview', () => {
  it('берёт тренеров из того же источника, что и /coaches', async () => {
    const w = await render(HomeCoachesPreview)
    const cards = w.findAll('.coach')
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.length).toBeLessThanOrEqual(coachesMock.length)
    expect(w.text()).toContain(coachesMock[0].fullName)
  })

  it('карточка ведёт на конкретного тренера, а не на общий список', async () => {
    const w = await render(HomeCoachesPreview)
    const link = w.find('.coach__link')
    expect(link.attributes('href')).toBe(`/coach/${coachesMock[0].id}`)
  })

  it('опыт выводится из данных тренера', async () => {
    const w = await render(HomeCoachesPreview)
    expect(w.text()).toContain(String(coachesMock[0].experienceYears))
  })
})

describe('HomeGalleryPreview', () => {
  it('отзывы приходят из сущности Review', async () => {
    const w = await render(HomeGalleryPreview)
    expect(w.findAll('.review')).toHaveLength(reviewsMock.length)
    for (const r of reviewsMock) {
      expect(w.text()).toContain(r.authorName)
      expect(w.text()).toContain(r.authorRelation)
    }
  })
})

describe('HomeTournamentsPreview', () => {
  const live = getCurrentTournament()!

  it('показывает идущий турнир из слоя данных', async () => {
    const w = await render(HomeTournamentsPreview)
    expect(w.text()).toContain(live.name)
    expect(w.text()).toContain(live.venue)
  })

  it('кнопка ведёт на страницу именно этого турнира', async () => {
    const w = await render(HomeTournamentsPreview)
    const btn = w.findAll('a').find((a) => a.text().includes('Подробнее о турнире'))
    expect(btn?.attributes('href')).toBe(`/tournament/${live.id}`)
  })

  it('таблица строится из standings, а не из литералов', async () => {
    const w = await render(HomeTournamentsPreview)
    const rows = w.findAll('.standings tbody tr')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThanOrEqual(live.standings.length)
    const leader = [...live.standings].sort((a, b) => a.position - b.position)[0]
    const leaderName = live.teams.find((t) => t.id === leader.teamId)!.name
    expect(rows[0].text()).toContain(leaderName)
  })

  it('в таблице нет несуществующих идентификаторов вместо названий', async () => {
    const w = await render(HomeTournamentsPreview)
    for (const row of w.findAll('.standings tbody tr')) {
      const name = row.findAll('td')[1].text()
      expect(live.teams.some((t) => t.name === name), `в таблице «${name}» — не название команды`).toBe(true)
    }
  })

  it('показываются только сыгранные матчи', async () => {
    const w = await render(HomeTournamentsPreview)
    const items = w.findAll('.match')
    expect(items.length).toBeGreaterThan(0)
    for (const m of items) {
      expect(m.find('.match__score').text()).toMatch(/^\d+\s*:\s*\d+$/)
    }
  })

  it('данные совпадают с турниром со страницы /tournaments (нет расхождения)', async () => {
    const w = await render(HomeTournamentsPreview)
    // раньше здесь был захардкожен «Кубок 2024», которого нет в моках вовсе
    expect(w.text()).not.toContain('2024')
  })
})
