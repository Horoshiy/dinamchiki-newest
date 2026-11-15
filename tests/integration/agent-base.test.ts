import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { router } from '@/router'
import { appConfig } from '@/app/config/app.config'
import { trackPageView } from '@/shared/lib/metrika'
import { useBaseAuth } from '@/features/base/stores/baseAuth'
import LoginView from '@/features/base/views/LoginView.vue'
import MoodScale from '@/features/base/components/MoodScale.vue'
import GoalPicker from '@/features/base/components/GoalPicker.vue'
import PainScale from '@/features/base/components/PainScale.vue'

/**
 * «Тайная база» скрыта и приватна: guard не пускает без токена, мета не оставляет
 * canonical/og, Метрика не получает просмотров раздела, а вопросы реально
 * отвечают на клик. Это фронтенд-контракт приватности из плана.
 */

const SCALE = ['Устал', 'Так себе', 'Нормально', 'Хорошо', 'Супер!']
const PAIN = ['Ничего не болит', 'Немного болит', 'Болит', 'Сильно болит', 'Очень сильно болит']

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  sessionStorage.clear()
  document.head.innerHTML = ''
})

describe('guard: доступ в базу', () => {
  it('без child-токена миссия уводит на вход', async () => {
    await router.push('/agent-base/mission')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('base-login')
  })

  it('без child-токена досье уводит на вход', async () => {
    await router.push('/agent-base/progress')
    expect(router.currentRoute.value.name).toBe('base-login')
  })

  it('с child-токеном миссия доступна', async () => {
    const auth = useBaseAuth()
    auth.childToken = 'child-token'
    await router.push('/agent-base/mission')
    expect(router.currentRoute.value.name).toBe('base-mission')
  })

  it('без staff-токена карточка агента уводит в штаб', async () => {
    await router.push('/agent-base/staff/child/7')
    expect(router.currentRoute.value.name).toBe('base-staff')
  })

  it('со staff-токеном карточка агента доступна', async () => {
    const auth = useBaseAuth()
    auth.staffToken = 'staff-token'
    await router.push('/agent-base/staff/child/7')
    expect(router.currentRoute.value.name).toBe('base-staff-child')
  })

  it('вошедшего ребёнка со входа уводит на миссию', async () => {
    const auth = useBaseAuth()
    auth.childToken = 'child-token'
    await router.push('/agent-base')
    expect(router.currentRoute.value.name).toBe('base-mission')
  })
})

describe('мета: раздел не оставляет следов', () => {
  it('на базе robots=noindex и нет canonical/og:url', async () => {
    await router.push('/agent-base')
    await router.isReady()
    await Promise.resolve()
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow')
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull()
    expect(document.title).toContain('Тайная база')
  })
})

describe('Метрика: просмотры базы не отправляются', () => {
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

  it('обычная страница счётчик инициализирует (защита именно от базы)', () => {
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
    const opts = ['Скорость', 'Сильный удар', 'Точный пас', 'Игра в команде']
    const w = mount(GoalPicker, { props: { options: opts } })
    await w.findAll('button')[1].trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['Сильный удар'])
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

describe('LoginView: вход по коду', () => {
  it('рендерит поле кода и блокирует кнопку, пока код не полный', async () => {
    await router.push('/agent-base')
    await router.isReady()
    const pinia = createPinia()
    setActivePinia(pinia)
    const w = mount(LoginView, { global: { plugins: [pinia, router] } })
    const input = w.find('#agent-code')
    expect(input.exists()).toBe(true)
    const button = w.findAll('button').find((b) => b.text().includes('Войти'))!
    expect(button.attributes('disabled')).toBeDefined()
    await input.setValue('ab2cd3ef4g')
    expect(button.attributes('disabled')).toBeUndefined()
  })
})