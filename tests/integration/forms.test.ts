import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import LeadForm from '@/widgets/contact/LeadForm.vue'
import HomeCta from '@/widgets/home/HomeCta.vue'
import DirectContacts from '@/widgets/contact/DirectContacts.vue'
import {
  CLUB_PHONE_HREF,
  CLUB_TELEGRAM_HREF,
  CLUB_WHATSAPP_HREF,
  CLUB_EMAIL_HREF,
} from '@/shared/config/club'
import { setSubmitBehavior, submittedLeads } from '../graphql-harness'

const Stub = defineComponent({ render: () => h('div') })

async function routerPlugin() {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: Stub }, { path: '/contacts', component: Stub }, { path: '/teams', component: Stub }],
  })
  r.push('/')
  await r.isReady()
  return r
}

async function settle() {
  await flushPromises()
  await new Promise((r) => setTimeout(r, 150))
  await flushPromises()
}

describe('DirectContacts', () => {
  it('даёт все четыре канала связи из единого конфига', () => {
    const w = mount(DirectContacts)
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain(CLUB_PHONE_HREF)
    expect(hrefs).toContain(CLUB_TELEGRAM_HREF)
    expect(hrefs).toContain(CLUB_WHATSAPP_HREF)
    expect(hrefs).toContain(CLUB_EMAIL_HREF)
  })

  it('внешние ссылки открываются безопасно', () => {
    const w = mount(DirectContacts)
    for (const a of w.findAll('a[target="_blank"]')) {
      expect(a.attributes('rel')).toContain('noopener')
    }
  })
})

describe('LeadForm — форма заявки на /contacts', () => {
  async function form(opts: { attachTo?: HTMLElement } = {}) {
    const w = mount(LeadForm, { ...opts, global: { plugins: [await routerPlugin()] } })
    await settle()
    return w
  }

  /**
   * Форма с 09.10.2026 — только телефон; как зовут и про ребёнка тренер
   * спрашивает при звонке. Согласие даётся нажатием кнопки.
   */
  async function fillValid(w: Awaited<ReturnType<typeof form>>) {
    await w.find('input[type="tel"]').setValue('8 999 123-45-67')
  }

  it('изначально показывает форму, а не результат', async () => {
    const w = await form()
    expect(w.find('form').exists()).toBe(true)
    expect(w.find('.lform__state').exists()).toBe(false)
  })

  it('спрашивает только телефон', async () => {
    const w = await form()
    expect(w.findAll('input').map((i) => i.attributes('type'))).toEqual(['tel'])
  })

  it('пустая отправка показывает ошибки валидации и не уходит с формы', async () => {
    const w = await form()
    await w.find('form').trigger('submit')
    await settle()
    expect(w.findAll('.lform__error').length).toBeGreaterThan(0)
    expect(w.find('form').exists()).toBe(true)
  })

  it('ошибка телефона связана с полем для читалки экрана', async () => {
    const w = await form()
    await w.find('form').trigger('submit')
    await settle()
    const input = w.find('input[type="tel"]')
    expect(input.attributes('aria-invalid')).toBe('true')
    const errId = input.attributes('aria-describedby')
    expect(errId).toBeTruthy()
    expect(w.find(`[id="${errId}"]`).text()).toContain('телефон')
  })

  it('после отправки фокус переходит на результат', async () => {
    const w = await form({ attachTo: document.body })
    await fillValid(w)
    await w.find('form').trigger('submit')
    await settle()
    expect(document.activeElement?.textContent).toContain('Заявка отправлена')
    w.unmount()
  })

  it('невалидная заявка не уходит на бэкенд', async () => {
    const w = await form()
    await w.find('form').trigger('submit')
    await settle()
    expect(submittedLeads).toHaveLength(0)
  })

  /** Бэкенд развёрнут — заявка обязана реально отправляться. */
  it('валидная заявка отправляется и подтверждается номером', async () => {
    const w = await form()
    await fillValid(w)
    await w.find('form').trigger('submit')
    await settle()
    expect(w.text()).toContain('Заявка отправлена')
    expect(submittedLeads).toHaveLength(1)
  })

  it('введённые данные доходят до бэкенда без потерь', async () => {
    const w = await form()
    await fillValid(w)
    await w.find('form').trigger('submit')
    await settle()
    expect(submittedLeads[0].parentName ?? '').toBe('')
    // В бэкенд уходит каноничный номер, а не то, что видно в поле.
    expect(submittedLeads[0].phone).toBe('+79991234567')
    expect(submittedLeads[0].consent).toBe(true)
  })

  /** Согласие по нажатию информированное, только если подпись ведёт на его текст. */
  it('под кнопкой подпись со ссылками на согласие и политику', async () => {
    const w = await form()
    expect(w.find('.consent-note').text()).toContain('Записаться на бесплатную пробную')
    expect(w.find('.consent-note a[href="/consent"]').exists()).toBe(true)
    expect(w.find('.consent-note a[href="/privacy"]').exists()).toBe(true)
  })

  /**
   * Главная гарантия честности: даже когда бэкенд есть, при ошибке
   * сохранения UI не имеет права показать благодарность.
   */
  it('ошибка сервера НЕ выдаётся за успешную отправку', async () => {
    setSubmitBehavior('server-error')
    const w = await form()
    await fillValid(w)
    await w.find('form').trigger('submit')
    await settle()
    expect(w.text()).not.toContain('Заявка отправлена')
    expect(w.text()).toMatch(/не удалось|ошибк|позвонить/i)
    expect(submittedLeads).toHaveLength(0)
  })

  it('при недоступном сервере заявок показываются прямые контакты', async () => {
    setSubmitBehavior('unavailable')
    const w = await form()
    await fillValid(w)
    await w.find('form').trigger('submit')
    await settle()
    expect(w.text()).not.toContain('Заявка отправлена')
  })

  it('после успешной отправки можно оставить ещё одну заявку', async () => {
    const w = await form()
    await fillValid(w)
    await w.find('form').trigger('submit')
    await settle()
    const again = w.findAll('button').find((b) => b.text().includes('ещё одну'))
    expect(again).toBeTruthy()
    await again!.trigger('click')
    await flushPromises()
    expect(w.find('form').exists()).toBe(true)
  })
})

describe('HomeCta — компактная форма на главной', () => {
  async function cta() {
    const w = mount(HomeCta, { global: { plugins: [await routerPlugin()] } })
    await settle()
    return w
  }

  it('рендерит только телефон и подпись о согласии со ссылкой', async () => {
    const w = await cta()
    expect(w.findAll('form input').map((i) => i.attributes('id'))).toEqual(['lead-phone'])
    expect(w.find('.consent-note a[href="/consent"]').exists()).toBe(true)
  })

  async function fillCta(w: Awaited<ReturnType<typeof cta>>) {
    await w.find('#lead-phone').setValue('+7 999 123-45-67')
  }

  /**
   * Раньше onSubmit просто ставил submitted=true и через 3.5 с очищал форму:
   * ни валидации, ни сети, ни следа заявки. Теперь форма ходит в бэкенд.
   */
  it('отправка доходит до бэкенда', async () => {
    const w = await cta()
    await fillCta(w)
    await w.find('form').trigger('submit')
    await settle()
    expect(submittedLeads).toHaveLength(1)
    expect(submittedLeads[0].consent).toBe(true)
    expect(w.text()).toContain('Спасибо')
  })

  it('заявка с главной помечается источником', async () => {
    const w = await cta()
    await fillCta(w)
    await w.find('form').trigger('submit')
    await settle()
    expect(submittedLeads[0].message).toContain('главной')
  })

  it('ошибка сервера не выдаётся за успех', async () => {
    setSubmitBehavior('server-error')
    const w = await cta()
    await fillCta(w)
    await w.find('form').trigger('submit')
    await settle()
    expect(w.text()).not.toContain('Заявка отправлена')
    expect(submittedLeads).toHaveLength(0)
  })

  /** В разметке были href="tel:+749****4567" и wa.me/749****4567. */
  it('в контактах справа нет замаскированных ссылок', async () => {
    const w = await cta()
    for (const a of w.findAll('a')) {
      expect(a.attributes('href') ?? '').not.toContain('*')
    }
  })

  it('телефон и мессенджеры берутся из конфига клуба', async () => {
    const w = await cta()
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain(CLUB_PHONE_HREF)
    expect(hrefs).toContain(CLUB_WHATSAPP_HREF)
    expect(hrefs).toContain(CLUB_TELEGRAM_HREF)
  })
})
