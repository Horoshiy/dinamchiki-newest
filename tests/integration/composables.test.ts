import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, ref, nextTick, type Ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import {
  useTeamsQuery,
  useTeamQuery,
  useCoachesQuery,
  useCoachQuery,
  useTournamentsQuery,
  useCurrentTournamentQuery,
  useUpcomingTournamentsQuery,
  useFinishedTournamentsQuery,
  usePlayersQuery,
  usePlayerQuery,
  useAlbumsQuery,
  useAllPhotosQuery,
  useContactInfoQuery,
  useVenuesQuery,
  useHomeContentQuery,
  useReviewsQuery,
  useSubmitApplicationMutation,
} from '@/shared/api/composables'
import { submittedLeads } from '../graphql-harness'
import { teamsMock } from '@/entities/team/teams.mocks'
import { playersMock } from '@/entities/player/players.mocks'

/**
 * Слой данных в mock-режиме. Страницы ходят только сюда, поэтому его
 * поведение — контракт для всего UI.
 */

/** Дождаться выполнения условия — фиксированная пауза даёт флаки. */
async function waitFor(cond: () => boolean, timeoutMs = 3000): Promise<void> {
  const started = Date.now()
  while (!cond()) {
    if (Date.now() - started > timeoutMs) throw new Error('waitFor: условие не выполнилось')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 10))
  }
  await flushPromises()
}

/** Смонтировать composable в setup-контексте и дождаться загрузки. */
async function run<T extends { loading: { value: boolean } }>(fn: () => T): Promise<T> {
  let api!: T
  const C = defineComponent({
    setup() {
      api = fn()
      return () => h('div')
    },
  })
  mount(C)
  await waitFor(() => api.loading.value === false)
  return api
}

describe('слой данных: списки', () => {
  it.each([
    ['teams', useTeamsQuery, 'teams'],
    ['coaches', useCoachesQuery, 'coaches'],
    ['tournaments', useTournamentsQuery, 'tournaments'],
    ['albums', useAlbumsQuery, 'albums'],
  ] as const)('%s отдаёт непустой список и снимает loading', async (_n, hook, key) => {
    const { data, loading, error } = await run(hook as () => ReturnType<typeof useTeamsQuery>)
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    const list = (data.value as Record<string, unknown>)[key]
    expect(Array.isArray(list)).toBe(true)
    expect((list as unknown[]).length).toBeGreaterThan(0)
  })

  // Тестовые отзывы клуб попросил убрать (reviewsMock = []): проверяем
  // только, что запрос отрабатывает и отдаёт массив.
  it('reviews отдаёт массив и снимает loading', async () => {
    const { data, loading, error } = await run(useReviewsQuery)
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(Array.isArray((data.value as { reviews?: unknown })?.reviews)).toBe(true)
  })

  it('loading в начале true — UI успевает показать скелетон', () => {
    const C = defineComponent({
      setup() {
        const { loading } = useTeamsQuery()
        expect(loading.value).toBe(true)
        return () => h('div')
      },
    })
    mount(C)
  })

  it('venues и contactInfo отдают данные', async () => {
    const venues = await run(useVenuesQuery)
    expect((venues.data.value as { venues: unknown[] }).venues.length).toBeGreaterThan(0)
    const info = await run(useContactInfoQuery)
    expect((info.data.value as { contactInfo: { phone: string } }).contactInfo.phone).toBeTruthy()
  })

  it('homeContent отдаёт все блоки главной', async () => {
    const { data } = await run(useHomeContentQuery)
    const pc = (data.value as { pageContent: Record<string, unknown[]> }).pageContent
    expect(pc.stats.length).toBeGreaterThan(0)
    expect(pc.features.length).toBeGreaterThan(0)
    expect(pc.programs.length).toBeGreaterThan(0)
    expect(pc.trainingSteps.length).toBeGreaterThan(0)
  })

  it('allPhotos собирает фото из всех альбомов', async () => {
    const { data } = await run(useAllPhotosQuery)
    expect((data.value as { allPhotos: unknown[] }).allPhotos.length).toBeGreaterThan(0)
  })
})

describe('слой данных: элемент по id', () => {
  it('существующий id возвращает объект', async () => {
    const id = ref(teamsMock[0].id)
    const { data } = await run(() => useTeamQuery(id))
    expect((data.value as { team: { id: string } }).team.id).toBe(teamsMock[0].id)
  })

  it('несуществующий id возвращает null, а не бросает', async () => {
    const id = ref('такой-команды-нет')
    const { data, error } = await run(() => useTeamQuery(id))
    expect((data.value as { team: unknown }).team).toBeNull()
    expect(error.value).toBeNull()
  })

  it.each([
    ['coach', useCoachQuery, 'coach'],
    ['player', usePlayerQuery, 'player'],
  ] as const)('%s по несуществующему id даёт null', async (_n, hook, key) => {
    const id = ref('нет-такого')
    const { data } = await run(() => (hook as (r: Ref<string>) => ReturnType<typeof useCoachQuery>)(id))
    expect((data.value as Record<string, unknown>)[key]).toBeNull()
  })

  /**
   * Регресс: в mock-режиме mockFn вызывался ровно один раз и не реагировал
   * на смену переменных. Переключение вкладок состава и переходы между
   * детальными страницами показывали данные предыдущего объекта.
   */
  it('смена id перезапрашивает данные', async () => {
    const id = ref(teamsMock[0].id)
    let api!: ReturnType<typeof useTeamQuery>
    const C = defineComponent({
      setup() {
        api = useTeamQuery(id)
        return () => h('div')
      },
    })
    mount(C)
    await flushPromises()
    await new Promise((r) => setTimeout(r, 120))
    expect((api.data.value as { team: { id: string } }).team.id).toBe(teamsMock[0].id)

    id.value = teamsMock[1].id
    await nextTick()
    await new Promise((r) => setTimeout(r, 120))
    await flushPromises()
    expect((api.data.value as { team: { id: string } }).team.id).toBe(teamsMock[1].id)
  })

  it('быстрая смена id: остаётся результат последнего запроса', async () => {
    const id = ref(teamsMock[0].id)
    let api!: ReturnType<typeof useTeamQuery>
    const C = defineComponent({
      setup() {
        api = useTeamQuery(id)
        return () => h('div')
      },
    })
    mount(C)
    id.value = teamsMock[1].id
    await nextTick()
    id.value = teamsMock[2].id
    await nextTick()
    await new Promise((r) => setTimeout(r, 200))
    await flushPromises()
    expect((api.data.value as { team: { id: string } }).team.id).toBe(teamsMock[2].id)
  })
})

describe('слой данных: состав команды', () => {
  it('игроки фильтруются по команде', async () => {
    const teamId = playersMock[0].team.id
    const id = ref<string | null>(teamId)
    const { data } = await run(() => usePlayersQuery(id))
    const players = (data.value as { players: Array<{ team: { id: string } }> }).players
    expect(players.length).toBeGreaterThan(0)
    expect(players.every((p) => p.team.id === teamId)).toBe(true)
  })

  it('команда без игроков даёт пустой список, а не ошибку', async () => {
    const id = ref<string | null>('команда-без-состава')
    const { data, error } = await run(() => usePlayersQuery(id))
    expect((data.value as { players: unknown[] }).players).toEqual([])
    expect(error.value).toBeNull()
  })

  it('без teamId возвращаются все игроки', async () => {
    const { data } = await run(() => usePlayersQuery())
    expect((data.value as { players: unknown[] }).players.length).toBe(playersMock.length)
  })
})

describe('слой данных: турниры по статусам', () => {
  it('текущий турнир — со статусом live', async () => {
    const { data } = await run(useCurrentTournamentQuery)
    const t = (data.value as { currentTournament: { status: string } | null }).currentTournament
    if (t) expect(t.status).toBe('live')
  })

  it('предстоящие — только upcoming', async () => {
    const { data } = await run(useUpcomingTournamentsQuery)
    const list = (data.value as { upcomingTournaments: Array<{ status: string }> }).upcomingTournaments
    expect(list.every((t) => t.status === 'upcoming')).toBe(true)
  })

  it('завершённые — только finished', async () => {
    const { data } = await run(useFinishedTournamentsQuery)
    const list = (data.value as { finishedTournaments: Array<{ status: string }> }).finishedTournaments
    expect(list.every((t) => t.status === 'finished')).toBe(true)
  })

  it('статусы не пересекаются', async () => {
    const up = await run(useUpcomingTournamentsQuery)
    const fin = await run(useFinishedTournamentsQuery)
    const upIds = new Set((up.data.value as { upcomingTournaments: Array<{ id: string }> }).upcomingTournaments.map((t) => t.id))
    const finIds = (fin.data.value as { finishedTournaments: Array<{ id: string }> }).finishedTournaments.map((t) => t.id)
    expect(finIds.some((id) => upIds.has(id))).toBe(false)
  })
})

/**
 * Контракт приёма заявок.
 *
 * Раньше бэкенда не было и мутация возвращала notDelivered — форма честно
 * сообщала, что заявка никуда не ушла. Теперь apigql.dinamchiki.ru развёрнут,
 * и заявка обязана реально приниматься. Тесты закрепляют оба свойства:
 * валидная — принимается, невалидная — отклоняется с причиной.
 */
describe('useSubmitApplicationMutation с развёрнутым бэкендом', () => {
  const valid = {
    childName: 'Ваня', childAge: '8', parentName: 'Анна',
    phone: '+7 999 123-45-67', email: '', preferredTime: '',
    message: '', ageGroup: '', consent: true,
  }

  beforeEach(() => {
    submittedLeads.length = 0
  })

  it('валидная заявка принимается и получает номер', async () => {
    const api = await runMutation()
    const res = await api.submit(valid)
    expect(res.ok).toBe(true)
    expect(res.leadId).toBeTruthy()
    expect(res.notDelivered).toBeFalsy()
  })

  it('заявка действительно доходит до бэкенда', async () => {
    const api = await runMutation()
    await api.submit({ ...valid, childName: 'Проверка доставки' })
    expect(submittedLeads).toHaveLength(1)
    expect(submittedLeads[0].childName).toBe('Проверка доставки')
  })

  it('поля заявки передаются без потерь', async () => {
    const api = await runMutation()
    await api.submit({ ...valid, message: 'удобно вечером', ageGroup: '8-10', email: 'a@b.ru' })
    const lead = submittedLeads[0]
    expect(lead.phone).toBe(valid.phone)
    expect(lead.message).toBe('удобно вечером')
    expect(lead.ageGroup).toBe('8-10')
    expect(lead.email).toBe('a@b.ru')
  })

  it('невалидная заявка отклоняется и на бэкенд не уходит', async () => {
    const api = await runMutation()
    const res = await api.submit({ ...valid, phone: '' })
    expect(res.ok).toBe(false)
    expect(res.error).toBeTruthy()
    expect(submittedLeads).toHaveLength(0)
  })

  it('заявка без согласия на обработку данных отклоняется', async () => {
    const api = await runMutation()
    const res = await api.submit({ ...valid, consent: false })
    expect(res.ok).toBe(false)
    expect(submittedLeads).toHaveLength(0)
  })

  it('submitting сбрасывается после завершения', async () => {
    const api = await runMutation()
    await api.submit(valid)
    expect(api.submitting.value).toBe(false)
  })

  it('useMutation вызывается в setup — без предупреждений Vue', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const api = await runMutation()
    await api.submit(valid)
    const lifecycleWarn = warn.mock.calls.find(
      (c) => String(c[0]).includes('onServerPrefetch') || String(c[0]).includes('outside'),
    )
    expect(lifecycleWarn).toBeUndefined()
    warn.mockRestore()
  })
})

/** Мутация не имеет loading-флага списка — монтируем отдельно. */
async function runMutation() {
  let api!: ReturnType<typeof useSubmitApplicationMutation>
  const C = defineComponent({
    setup() {
      api = useSubmitApplicationMutation()
      return () => h('div')
    },
  })
  mount(C)
  await flushPromises()
  return api
}
