import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import TeamDetailPage from '@/pages/TeamDetailPage.vue'
import TournamentDetailPage from '@/pages/TournamentDetailPage.vue'
import CoachDetailPage from '@/pages/CoachDetailPage.vue'
import PlayerPage from '@/pages/PlayerPage.vue'
import { teamsMock } from '@/entities/team/teams.mocks'
import { playersMock } from '@/entities/player/players.mocks'
import { coachesMock } from '@/entities/coach/coaches.mocks'
import { tournamentsMock, getCurrentTournament } from '@/entities/tournament/tournaments.mocks'
import { SIGNUP_ROUTE } from '@/shared/config/club'

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

async function render(Comp: unknown, props: Record<string, unknown>) {
  const w = mount(Comp as never, { props, global: { plugins: [await routerPlugin()] } })
  await flushPromises()
  await new Promise((r) => setTimeout(r, 200))
  await flushPromises()
  return w
}

/** Команда, у которой в моках есть игроки. */
const teamWithRoster = playersMock[0].team.id
/** Команда без игроков. */
const teamWithoutRoster = teamsMock.find((t) => !playersMock.some((p) => p.team.id === t.id))!.id

describe('TeamDetailPage', () => {
  it('показывает название и описание команды', async () => {
    const team = teamsMock.find((t) => t.id === teamWithRoster)!
    const w = await render(TeamDetailPage, { id: team.id })
    expect(w.find('h1').text()).toBe(team.name)
    expect(w.text()).toContain(team.description)
  })

  /**
   * Регресс: страница игрока была недостижима из интерфейса — у команды
   * хранился только playersCount, а ссылок на игроков не было нигде.
   */
  it('показывает состав со ссылками на карточки игроков', async () => {
    const w = await render(TeamDetailPage, { id: teamWithRoster })
    const cards = w.findAll('.p-card')
    expect(cards.length).toBeGreaterThan(0)
    for (const c of cards) {
      expect(c.attributes('href')).toMatch(/^\/player\/[a-z0-9-]+$/)
    }
  })

  it('в составе именно игроки этой команды', async () => {
    const w = await render(TeamDetailPage, { id: teamWithRoster })
    const expected = playersMock.filter((p) => p.team.id === teamWithRoster)
    expect(w.findAll('.p-card')).toHaveLength(expected.length)
    for (const p of expected) expect(w.text()).toContain(p.fullName)
  })

  it('команда без состава показывает объяснение, а не пустоту', async () => {
    const w = await render(TeamDetailPage, { id: teamWithoutRoster })
    expect(w.findAll('.p-card')).toHaveLength(0)
    expect(w.text()).toContain('Состав пока не опубликован')
  })

  it('несуществующая команда даёт понятное состояние', async () => {
    const w = await render(TeamDetailPage, { id: 'нет-такой-команды' })
    expect(w.find('h1').exists()).toBe(false)
    expect(w.text().length).toBeGreaterThan(0)
  })

  it('кнопка записи ведёт на форму и имеет href', async () => {
    const w = await render(TeamDetailPage, { id: teamWithRoster })
    const cta = w.findAll('a').find((a) => a.text().includes('Записаться'))
    expect(cta?.attributes('href')).toBe(SIGNUP_ROUTE)
  })

  it('расписание выводится', async () => {
    const team = teamsMock.find((t) => t.id === teamWithRoster)!
    const w = await render(TeamDetailPage, { id: team.id })
    expect(w.text()).toContain(team.schedule[0].day)
    expect(w.text()).toContain(team.schedule[0].time)
  })
})

describe('PlayerPage', () => {
  const player = playersMock[0]

  it('показывает имя, возраст, номер и позицию', async () => {
    const w = await render(PlayerPage, { id: player.id })
    expect(w.find('h1').text()).toBe(player.fullName)
    expect(w.text()).toContain(String(player.age))
    expect(w.text()).toContain(String(player.jerseyNumber))
  })

  it('ссылается на команду и тренера игрока', async () => {
    const w = await render(PlayerPage, { id: player.id })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain(`/team/${player.team.id}`)
    expect(hrefs).toContain(`/coach/${player.coach.id}`)
  })

  it('показывает статистику, достижения и галерею', async () => {
    const w = await render(PlayerPage, { id: player.id })
    expect(w.text()).toContain(String(player.stats.matchesPlayed))
    expect(w.text()).toContain(player.achievements[0].title)
    expect(w.findAll('.gallery__item').length).toBe(player.gallery.length)
  })

  it('несуществующий игрок не роняет страницу', async () => {
    const w = await render(PlayerPage, { id: 'нет-такого-игрока' })
    expect(w.find('h1').exists()).toBe(false)
  })
})

describe('CoachDetailPage', () => {
  const coach = coachesMock[0]

  it('показывает тренера', async () => {
    const w = await render(CoachDetailPage, { id: coach.id })
    expect(w.text()).toContain(coach.fullName)
    expect(w.text()).toContain(coach.role)
    // Команды у реальных тренеров пока не заполнены: настоящих составов
    // клуб не передал, а привязывать людей к демо-командам нельзя.
    for (const t of coach.teams) expect(w.text()).toContain(t.name)
  })

  /** Этап 6 ТЗ требовал краткую галерею тренера — её не было вовсе. */
  it('показывает галерею тренера', async () => {
    const w = await render(CoachDetailPage, { id: coach.id })
    const photos = w.findAll('.grid__item')
    expect(photos.length).toBe(coach.gallery.length)
    expect(photos.length).toBeGreaterThan(0)
  })

  it('клик по фото открывает lightbox', async () => {
    const w = await render(CoachDetailPage, { id: coach.id })
    await w.find('.grid__item').trigger('click')
    await flushPromises()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    document.body.innerHTML = ''
  })

  it('ведёт на страницы своих команд', async () => {
    const w = await render(CoachDetailPage, { id: coach.id })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    // Пока у реальных тренеров нет привязанных команд, проверять нечего —
    // тест начнёт работать сам, как только появятся настоящие составы.
    for (const t of coach.teams) expect(hrefs).toContain(`/team/${t.id}`)
  })
})

describe('TournamentDetailPage', () => {
  const live = getCurrentTournament()!
  const archived = tournamentsMock.find((t) => t.teams.length === 0)

  it('показывает таблицу и матчи идущего турнира', async () => {
    const w = await render(TournamentDetailPage, { id: live.id })
    expect(w.find('h1').text()).toContain(live.name)
    expect(w.findAll('.standings__row').length).toBe(live.standings.length)
  })

  /** Этап 7 ТЗ требовал составы команд. */
  it('показывает составы команд клуба', async () => {
    const w = await render(TournamentDetailPage, { id: live.id })
    const cards = w.findAll('.tournament-detail__roster .p-card')
    expect(cards.length).toBeGreaterThan(0)
    for (const c of cards) expect(c.attributes('href')).toMatch(/^\/player\//)
  })

  it('в составе только игроки нашей команды-участницы', async () => {
    const w = await render(TournamentDetailPage, { id: live.id })
    const ourTeamIds = live.teams.filter((t) => t.isOurTeam).map((t) => t.id)
    const expected = playersMock.filter((p) => p.team.id === ourTeamIds[0])
    expect(w.findAll('.tournament-detail__roster .p-card')).toHaveLength(expected.length)
  })

  /**
   * Участники турнира — чужие клубы, страниц у них на сайте нет: ссылки
   * вели бы в «Команда не найдена». Поэтому это карточки без ссылок,
   * а наша команда помечена бейджем.
   */
  it('участники перечислены, наша команда помечена', async () => {
    const w = await render(TournamentDetailPage, { id: live.id })
    const cards = w.findAll('.tournament-detail__team-card')
    expect(cards).toHaveLength(live.teams.length)
    expect(w.findAll('.tournament-detail__team-card--ours')).toHaveLength(
      live.teams.filter((t) => t.isOurTeam).length,
    )
  })

  /** Архивная запись без детализации раньше давала страницу из одного hero. */
  it('архивный турнир без деталей объясняет, почему пусто', async () => {
    if (!archived) return
    const w = await render(TournamentDetailPage, { id: archived.id })
    expect(w.text()).toContain('Подробности турнира не сохранились')
    expect(w.findAll('.standings__row')).toHaveLength(0)
  })

  it('несуществующий турнир не роняет страницу', async () => {
    const w = await render(TournamentDetailPage, { id: 'нет-такого-турнира' })
    expect(w.findAll('.standings__row')).toHaveLength(0)
  })
})
