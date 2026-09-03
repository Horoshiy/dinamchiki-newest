import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'

const Stub = defineComponent({ render: () => h('div') })

function router() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/contacts', component: Stub },
      { path: '/teams', component: Stub },
    ],
  })
}

async function mountWithRouter(props: Record<string, unknown>, slots = { default: 'Текст' }) {
  const r = router()
  r.push('/')
  await r.isReady()
  return mount(BaseButton, { props, slots, global: { plugins: [r] } })
}

describe('BaseButton', () => {
  it('без to/href рендерится как <button>', () => {
    const w = mount(BaseButton, { slots: { default: 'Жми' } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.text()).toBe('Жми')
  })

  it('с href рендерится как <a> с этим href', () => {
    const w = mount(BaseButton, { props: { href: 'https://example.com' }, slots: { default: 'Ссылка' } })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('https://example.com')
  })

  /**
   * Регресс-тест на реальный баг: `:href="href"` со значением undefined
   * попадал в fallthrough-атрибуты RouterLink и затирал вычисленный им href.
   * Кнопка рендерилась как <a> вообще без href — клик работал, но Ctrl+клик,
   * «открыть в новой вкладке» и краулеры нет.
   */
  it('с to рендерится как <a> и ОБЯЗАТЕЛЬНО имеет href', async () => {
    const w = await mountWithRouter({ to: '/contacts' })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('/contacts')
  })

  it('to с хешем сохраняет якорь в href', async () => {
    const w = await mountWithRouter({ to: '/contacts#lead' })
    expect(w.attributes('href')).toBe('/contacts#lead')
  })

  it('ссылка-роут не получает лишний атрибут type', async () => {
    const w = await mountWithRouter({ to: '/teams' })
    expect(w.attributes('type')).toBeUndefined()
  })

  it('кнопка получает type, по умолчанию button', () => {
    expect(mount(BaseButton).attributes('type')).toBe('button')
    expect(mount(BaseButton, { props: { type: 'submit' } }).attributes('type')).toBe('submit')
  })

  it('disabled блокирует кнопку и не эмитит click', async () => {
    const w = mount(BaseButton, { props: { disabled: true } })
    expect(w.attributes('disabled')).toBeDefined()
    await w.trigger('click')
    expect(w.emitted('click')).toBeUndefined()
  })

  it('loading блокирует кнопку и помечает aria-busy', async () => {
    const w = mount(BaseButton, { props: { loading: true } })
    expect(w.attributes('disabled')).toBeDefined()
    expect(w.attributes('aria-busy')).toBe('true')
    await w.trigger('click')
    expect(w.emitted('click')).toBeUndefined()
  })

  it('обычный клик эмитится', async () => {
    const w = mount(BaseButton)
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })

  it.each([
    ['solid', 'btn--solid'],
    ['outline', 'btn--outline'],
    ['ghost', 'btn--ghost'],
    ['soft', 'btn--soft'],
  ])('вариант %s даёт класс %s', (variant, cls) => {
    expect(mount(BaseButton, { props: { variant } }).classes()).toContain(cls)
  })

  it.each(['sm', 'md', 'lg'])('размер %s даёт свой класс', (size) => {
    expect(mount(BaseButton, { props: { size } }).classes()).toContain(`btn--${size}`)
  })

  it('block даёт модификатор для кнопки во всю ширину', () => {
    expect(mount(BaseButton, { props: { block: true } }).classes()).toContain('btn--block')
  })

  it('иконки слева и справа рендерятся', () => {
    const Icon = defineComponent({ render: () => h('svg', { 'data-test': 'icon' }) })
    const w = mount(BaseButton, { props: { iconLeft: Icon, iconRight: Icon } })
    expect(w.findAll('[data-test="icon"]')).toHaveLength(2)
  })
})
