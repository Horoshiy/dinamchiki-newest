import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { router } from '@/router'
import { appConfig } from '@/app/config/app.config'
import { trackPageView } from '@/shared/lib/metrika'
import { useBaseAuth } from '@/features/base/stores/baseAuth'
import * as api from '@/features/base/api/base.api'
import LoginView from '@/features/base/views/LoginView.vue'
import StaffView from '@/features/base/views/StaffView.vue'
import MoodScale from '@/features/base/components/MoodScale.vue'
import GoalPicker from '@/features/base/components/GoalPicker.vue'
import PainScale from '@/features/base/components/PainScale.vue'
import RankBadge from '@/features/base/components/RankBadge.vue'
import QuestionRenderer from '@/features/base/components/QuestionRenderer.vue'
import { useMission } from '@/features/base/composables/useMission'
import { useBaseSound } from '@/features/base/stores/baseSound'
import type { BaseQuestion, BaseMission, BaseMe, SubmitResult, StaffChildRow } from '@/features/base/api/base.types'

/**
 * «Подтрибунка» скрыта и приватна: guard не пускает без токена, мета не оставляет
 * canonical/og, Метрика не получает просмотров раздела, а вопросы реально
 * отвечают на клик. Это фронтенд-контракт приватности из плана.
 */

const SCALE = ['Устал', 'Так себе', 'Нормально', 'Хорошо', 'Супер!']
const ENERGY = ['Мало', 'Немного', 'Средне', 'Много', 'Очень много!']
const PAIN = ['Ничего не болит', 'Немного болит', 'Болит', 'Сильно болит', 'Очень сильно болит']
const SLEEP = ['Много (8–10 часов)', 'Мало (меньше 8)', 'Почти не спал']
const FUEL = ['Позавтракал 🍎', 'Пил воду 💧']

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  sessionStorage.clear()
  document.head.innerHTML = ''
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('guard: доступ в Подтрибунку', () => {
  it('без child-токена разминка уводит на вход', async () => {
    await router.push('/agent-base/mission')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('base-login')
  })

  it('без child-токена карточка уводит на вход', async () => {
    await router.push('/agent-base/progress')
    expect(router.currentRoute.value.name).toBe('base-login')
  })

  it('с child-токеном разминка доступна', async () => {
    const auth = useBaseAuth()
    auth.childToken = 'child-token'
    await router.push('/agent-base/mission')
    expect(router.currentRoute.value.name).toBe('base-mission')
  })

  it('без staff-токена карточка игрока уводит в тренерскую', async () => {
    await router.push('/agent-base/staff/child/7')
    expect(router.currentRoute.value.name).toBe('base-staff')
  })

  it('со staff-токеном карточка игрока доступна', async () => {
    const auth = useBaseAuth()
    auth.staffToken = 'staff-token'
    await router.push('/agent-base/staff/child/7')
    expect(router.currentRoute.value.name).toBe('base-staff-child')
  })

  it('вошедшего ребёнка со входа уводит на разминку', async () => {
    const auth = useBaseAuth()
    auth.childToken = 'child-token'
    await router.push('/agent-base')
    expect(router.currentRoute.value.name).toBe('base-mission')
  })
})

describe('мета: раздел не оставляет следов', () => {
  it('в Подтрибунке robots=noindex и нет canonical/og:url', async () => {
    await router.push('/agent-base')
    await router.isReady()
    await Promise.resolve()
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow')
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull()
    expect(document.title).toContain('Подтрибунка')
  })
})

describe('Метрика: просмотры Подтрибунки не отправляются', () => {
  const original = appConfig.metrikaId
  beforeEach(() => {
    ;(appConfig as { metrikaId: number | null }).metrikaId = 12345
    localStorage.setItem('dinamchiki-cookie-consent', '1')
  })
  afterEach(() => {
    ;(appConfig as { metrikaId: number | null }).metrikaId = original
    delete window.ym
    document.head.innerHTML = ''
  })

  it('trackPageView для /agent-base не инициализирует счётчик', () => {
    trackPageView('/agent-base/mission#code=SECRET')
    expect(window.ym).toBeUndefined()
  })

  it('обычная страница счётчик инициализирует (защита именно от Подтрибунки)', () => {
    trackPageView('/teams')
    expect(window.ym).toBeDefined()
  })
})

describe('компоненты: вопросы отвечают на клик', () => {
  it('MoodScale отдаёт значение 1..5', async () => {
    const w = mount(MoodScale, { props: { options: SCALE } })
    await w.findAll('button')[2].trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([3])
  })

  it('GoalPicker отдаёт выбранный вариант строкой', async () => {
    const w = mount(GoalPicker, { props: { options: SLEEP } })
    await w.findAll('button')[1].trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['Мало (меньше 8)'])
  })

  it('PainScale при боли >= 3 показывает предупреждение', async () => {
    const w = mount(PainScale, { props: { options: PAIN } })
    expect(w.text()).not.toContain('скажи тренеру')
    await w.findAll('.pain__opt')[3].trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([4])
    // Компонент управляемый: родитель возвращает значение через v-model.
    await w.setProps({ modelValue: 4 })
    expect(w.text()).toContain('скажи тренеру')
  })
})

describe('RankBadge: звания игрока', () => {
  it.each(['Новичок', 'Игрок', 'Мастер', 'Капитан', 'Легенда клуба'])('рендерит звание «%s»', (rank) => {
    const w = mount(RankBadge, { props: { rank } })
    expect(w.find('.rank-badge__title').text()).toBe(rank)
  })
})

describe('QuestionRenderer: звук выбора', () => {
  const q = (over: Partial<BaseQuestion>): BaseQuestion => ({
    id: 1, template_key: 'mood', kind: 'scale', text: 'Вопрос?', options: SCALE,
    is_required: true, max_len: 0, position: 1, ...over,
  })
  function spySound() {
    return vi.spyOn(useBaseSound(), 'play').mockImplementation(() => {})
  }

  it('шкала (настрой/энергия/боль) играет select', async () => {
    const play = spySound()
    const w = mount(QuestionRenderer, { props: { question: q({}) } })
    await w.findAll('.mood__opt')[2].trigger('click')
    expect(play).toHaveBeenCalledWith('select')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([{ question_id: 1, value_int: 3 }])
  })

  it('одиночный выбор (сон) играет select', async () => {
    const play = spySound()
    const w = mount(QuestionRenderer, { props: { question: q({ id: 4, template_key: 'sleep', kind: 'single', options: SLEEP }) } })
    await w.findAll('.goal__opt')[1].trigger('click')
    expect(play).toHaveBeenCalledWith('select')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([{ question_id: 4, value_text: 'Мало (меньше 8)' }])
  })

  it('мультивыбор (еда/вода) играет select', async () => {
    const play = spySound()
    const w = mount(QuestionRenderer, { props: { question: q({ id: 5, template_key: 'fuel', kind: 'multi', options: FUEL }) } })
    await w.findAll('.ab-chip')[0].trigger('click')
    expect(play).toHaveBeenCalledWith('select')
  })

  it('свободный текст не шумит на каждый ввод', async () => {
    const play = spySound()
    const w = mount(QuestionRenderer, { props: { question: q({ id: 6, template_key: 'dream', kind: 'text', options: [], max_len: 200 }) } })
    await w.find('.dream__area').setValue('Забить гол в девятку')
    expect(play).not.toHaveBeenCalled()
    expect(w.emitted('update:modelValue')?.[0]).toEqual([{ question_id: 6, value_text: 'Забить гол в девятку' }])
  })
})

describe('LoginView: вход по коду', () => {
  it('рендерит поле кода и блокирует кнопку, пока код не полный', async () => {
    await router.push('/agent-base')
    await router.isReady()
    const pinia = createPinia()
    setActivePinia(pinia)
    const w = mount(LoginView, { global: { plugins: [pinia, router] } })
    const input = w.find('#agent-code')
    expect(input.exists()).toBe(true)
    const button = w.findAll('button').find((b) => b.text().includes('Войти в Подтрибунку'))!
    expect(button.attributes('disabled')).toBeDefined()
    await input.setValue('ab2cd3ef4g')
    expect(button.attributes('disabled')).toBeUndefined()
  })
})

describe('StaffView: доска дня на одном экране', () => {
  const row = (over: Partial<StaffChildRow>): StaffChildRow => ({
    child_id: 1, full_name: 'Игрок', codename: 'Сокол', rank: 'Игрок', xp: 105,
    streak_current: 3, completed_today: true, needs_attention_today: false, has_code: true,
    last_mission_date: '2026-11-15', mood_today: 4, energy_today: 3, pain_today: 1,
    sleep_today: 'Много (8–10 часов)', fuel_today: ['Позавтракал 🍎', 'Пил воду 💧'], ...over,
  })
  const rows: StaffChildRow[] = [
    row({ child_id: 1, full_name: 'Анна Орлова' }),
    row({ child_id: 2, full_name: 'Борис Соколов', codename: 'Ястреб', rank: 'Мастер', xp: 320, streak_current: 7, mood_today: 2, energy_today: 2, pain_today: 4, sleep_today: 'Мало (меньше 8)', fuel_today: ['Пил воду 💧'], needs_attention_today: true }),
    row({ child_id: 3, full_name: 'Виктор Волков', codename: 'Игрок', rank: 'Новичок', xp: 0, streak_current: 0, completed_today: false, has_code: false, mood_today: 0, energy_today: 0, pain_today: 0, sleep_today: '', fuel_today: [] }),
  ]

  async function mountStaff() {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useBaseAuth()
    auth.staffToken = 'staff-token'
    auth.staffRole = 'coach'
    auth.staffName = 'Роман Мануйло'
    vi.spyOn(api, 'staffOverview').mockResolvedValue({ success: true, items: rows, total: rows.length, limit: 200, offset: 0 })
    vi.spyOn(api, 'staffAttention').mockResolvedValue({ success: true, items: [], total: 0, limit: 100, offset: 0 })
    const w = mount(StaffView, { global: { plugins: [pinia, router] } })
    await flushPromises()
    return w
  }

  it('сводка дня считает средние только по прошедшим', async () => {
    const w = await mountStaff()
    const summary = w.find('.staff__board-summary')
    expect(summary.exists()).toBe(true)
    expect(summary.text()).toContain('Ответили')
    expect(summary.text()).toContain('2')
    expect(summary.text()).toContain('3')
    expect(summary.text()).toContain('3.0')
    expect(summary.text()).toContain('2.5')
    expect(summary.text()).toContain('Тревоги')
  })

  it('таблица показывает все колонки ответов дня', async () => {
    const w = await mountStaff()
    const head = w.find('.staff__row--head').text()
    for (const c of ['Игрок', 'Настрой', 'Силы', 'Болит', 'Сон', 'Еда/вода', 'Статус']) expect(head).toContain(c)
    expect(w.find('.staff__item .staff__c-pain.is-warn').exists()).toBe(true)
    expect(w.text()).toContain('😴 много')
    expect(w.text()).toContain('🍎')
    expect(w.text()).toContain('✓ прошёл')
    expect(w.text()).toContain('боль')
    expect(w.text()).toContain('ждём')
  })

  it('Прогресс скрыт по умолчанию и раскрывается по клику', async () => {
    const w = await mountStaff()
    expect(w.find('.staff__progress').exists()).toBe(false)
    const toggle = w.find('.staff__progress-toggle')
    expect(toggle.text()).toContain('Прогресс')
    await toggle.trigger('click')
    const prog = w.find('.staff__progress')
    expect(prog.exists()).toBe(true)
    expect(prog.text()).toContain('Игрок')
    expect(prog.text()).toContain('XP 105')
    await toggle.trigger('click')
    expect(w.find('.staff__progress').exists()).toBe(false)
  })
})

describe('useMission: fuel необязательный', () => {
  const q = (id: number, template_key: string, kind: BaseQuestion['kind'], is_required: boolean, options: string[] = []): BaseQuestion =>
    ({ id, template_key, kind, text: 'Вопрос?', options, is_required, max_len: 0, position: id })
  const mission: BaseMission = {
    mission_id: 1, day_key: '2026-11-15', weekday: 6, theme: 'Тема дня',
    slogan: 'СТАРайся • ПОДДЕРЖИВАЙ • ИГРАЙ ЧЕСТНО', completed: false,
    questions: [
      q(1, 'mood', 'scale', true, SCALE),
      q(2, 'energy', 'scale', true, ENERGY),
      q(3, 'pain', 'scale', true, PAIN),
      q(4, 'sleep', 'single', true, SLEEP),
      q(5, 'fuel', 'multi', false, FUEL),
    ],
  }

  it('отправка без fuel проходит и не включает fuel в ответы', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useBaseAuth()
    auth.childToken = 'child-token'
    vi.spyOn(api, 'getTodayMission').mockResolvedValue(mission)
    vi.spyOn(api, 'saveDraft').mockResolvedValue({ success: true })
    vi.spyOn(api, 'getMe').mockResolvedValue({} as BaseMe)
    const submit = vi.spyOn(api, 'submitAnswers').mockResolvedValue({
      already: false, xp_granted: 15, total_xp: 40, streak: 1, streak_best: 1,
      rank: 'Игрок', new_badges: [], needs_attention: false, motivation: 'М', joke: 'Ш',
    } as SubmitResult)

    const m = useMission()
    await m.load()
    m.setAnswer({ question_id: 1, value_int: 3 })
    m.setAnswer({ question_id: 2, value_int: 3 })
    m.setAnswer({ question_id: 3, value_int: 1 })
    m.setAnswer({ question_id: 4, value_text: 'Много (8–10 часов)' })

    expect(m.requiredDone.value).toBe(true)
    expect(m.isAnswered(mission.questions[4])).toBe(false)

    const res = await m.submit()
    expect(res).not.toBeNull()
    expect(submit).toHaveBeenCalledTimes(1)
    const sent = submit.mock.calls[0][1]
    expect(sent).toHaveLength(4)
    expect(sent.find((a) => a.question_id === 5)).toBeUndefined()
  })
})