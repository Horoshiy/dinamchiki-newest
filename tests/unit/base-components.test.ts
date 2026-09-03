import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import FilterChips from '@/shared/ui/base/FilterChips.vue'
import Breadcrumbs from '@/shared/ui/base/Breadcrumbs.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import StatCard from '@/shared/ui/base/StatCard.vue'
import UiCard from '@/shared/ui/base/UiCard.vue'

const Stub = defineComponent({ render: () => h('div') })

async function withRouter() {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: Stub }, { path: '/teams', component: Stub }, { path: '/team/:id', component: Stub }],
  })
  r.push('/')
  await r.isReady()
  return r
}

describe('FilterChips', () => {
  const items = [
    { value: 'all', label: 'Все' },
    { value: '5-7', label: '5–7 лет' },
    { value: '8-10', label: '8–10 лет' },
  ]

  it('рендерит чип на каждый пункт', () => {
    const w = mount(FilterChips, { props: { items, selected: 'all' } })
    expect(w.findAll('.chip')).toHaveLength(3)
  })

  it('помечает выбранный чип классом и aria-selected', () => {
    const w = mount(FilterChips, { props: { items, selected: '5-7' } })
    const chips = w.findAll('.chip')
    expect(chips[1].classes()).toContain('chip--active')
    expect(chips[1].attributes('aria-selected')).toBe('true')
    expect(chips[0].attributes('aria-selected')).toBe('false')
  })

  it('клик по невыбранному чипу выбирает его', async () => {
    const w = mount(FilterChips, { props: { items, selected: 'all' } })
    await w.findAll('.chip')[1].trigger('click')
    expect(w.emitted('update:selected')?.[0]).toEqual(['5-7'])
  })

  it('повторный клик по выбранному чипу сбрасывает выбор', async () => {
    const w = mount(FilterChips, { props: { items, selected: '5-7' } })
    await w.findAll('.chip')[1].trigger('click')
    expect(w.emitted('update:selected')?.[0]).toEqual([null])
  })

  it('пустой список не ломает рендер', () => {
    expect(mount(FilterChips, { props: { items: [], selected: null } }).findAll('.chip')).toHaveLength(0)
  })

  it('чипы — кнопки в роли tablist (доступность)', () => {
    const w = mount(FilterChips, { props: { items, selected: null } })
    expect(w.attributes('role')).toBe('tablist')
    expect(w.find('.chip').attributes('role')).toBe('tab')
  })
})

describe('Breadcrumbs', () => {
  it('промежуточные пункты со ссылкой — это ссылки', async () => {
    const w = mount(Breadcrumbs, {
      props: { items: [{ label: 'Главная', to: '/' }, { label: 'Команды', to: '/teams' }, { label: 'U-12' }] },
      global: { plugins: [await withRouter()] },
    })
    const links = w.findAll('a')
    expect(links).toHaveLength(2)
    expect(links[0].attributes('href')).toBe('/')
    expect(links[1].attributes('href')).toBe('/teams')
  })

  it('последний пункт не ссылка и помечен aria-current', async () => {
    const w = mount(Breadcrumbs, {
      props: { items: [{ label: 'Главная', to: '/' }, { label: 'U-12' }] },
      global: { plugins: [await withRouter()] },
    })
    const items = w.findAll('.breadcrumbs__item')
    expect(items[1].attributes('aria-current')).toBe('page')
    expect(items[1].find('a').exists()).toBe(false)
  })

  it('навигация подписана для скринридера', async () => {
    const w = mount(Breadcrumbs, {
      props: { items: [{ label: 'Главная' }] },
      global: { plugins: [await withRouter()] },
    })
    expect(w.attributes('aria-label')).toBe('Хлебные крошки')
  })
})

describe('EmptyState', () => {
  it('показывает заголовок', () => {
    expect(mount(EmptyState, { props: { title: 'Ничего нет' } }).text()).toContain('Ничего нет')
  })

  it('описание опционально', () => {
    expect(mount(EmptyState, { props: { title: 'X' } }).find('.empty-state__description').exists()).toBe(false)
    expect(mount(EmptyState, { props: { title: 'X', description: 'Пояснение' } }).text()).toContain('Пояснение')
  })

  it('слот action рендерится', () => {
    const w = mount(EmptyState, { props: { title: 'X' }, slots: { action: '<button>Действие</button>' } })
    expect(w.find('.empty-state__action').exists()).toBe(true)
  })
})

describe('LoadingSkeleton', () => {
  it('вариант text рендерит нужное число строк', () => {
    expect(mount(LoadingSkeleton, { props: { variant: 'text', count: 3 } }).findAll('.skeleton-line')).toHaveLength(3)
  })

  it('вариант block принимает высоту', () => {
    const w = mount(LoadingSkeleton, { props: { variant: 'block', height: '320px' } })
    expect(w.find('.skeleton-block').attributes('style')).toContain('320px')
  })

  it('вариант circle квадратный по размеру', () => {
    const style = mount(LoadingSkeleton, { props: { variant: 'circle', size: 64 } }).find('.skeleton-circle').attributes('style')
    expect(style).toContain('64px')
  })
})

describe('StatCard', () => {
  const props = { value: '650+', label: 'игроков', caption: 'Мальчиков и девочек тренируются в клубе' }

  it('показывает значение, подпись и пояснение', () => {
    const w = mount(StatCard, { props })
    expect(w.find('.stat-card__value').text()).toBe('650+')
    expect(w.find('.stat-card__label').text()).toBe('игроков')
    expect(w.find('.stat-card__caption').text()).toContain('Мальчиков')
  })

  /**
   * Раньше карточка была сплошным горизонтальным flex и пояснение
   * ломалось в узкую колонку. По мокапу пояснение должно лежать вне
   * верхней строки с иконкой — на всю ширину карточки.
   */
  it('пояснение вынесено из строки с иконкой', () => {
    const w = mount(StatCard, { props: { ...props, icon: defineComponent({ render: () => h('svg') }) } })
    expect(w.find('.stat-card__head .stat-card__caption').exists()).toBe(false)
    expect(w.find('.stat-card__caption').exists()).toBe(true)
  })

  it('иконка опциональна', () => {
    expect(mount(StatCard, { props }).find('.stat-card__icon').exists()).toBe(false)
  })

  it('пояснение опционально', () => {
    const w = mount(StatCard, { props: { value: '28', label: 'команд' } })
    expect(w.find('.stat-card__caption').exists()).toBe(false)
  })
})

describe('UiCard', () => {
  it('без ссылок — это div', () => {
    expect(mount(UiCard, { props: { title: 'Заголовок' } }).element.tagName).toBe('DIV')
  })

  it('с href — это <a> с href', () => {
    const w = mount(UiCard, { props: { href: 'https://example.com', title: 'X' } })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('https://example.com')
  })

  // Тот же класс дефекта, что был у BaseButton: undefined-href затирал
  // вычисленный RouterLink адрес, и карточка-ссылка теряла href.
  it('с to — это <a> и обязательно имеет href', async () => {
    const w = mount(UiCard, { props: { to: '/team/u12-blue', title: 'X' }, global: { plugins: [await withRouter()] } })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('/team/u12-blue')
  })
})
