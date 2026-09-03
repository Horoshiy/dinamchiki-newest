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
  async function form() {
    const w = mount(LeadForm, { global: { plugins: [await routerPlugin()] } })
    await settle()
    return w
  }

  /** Заполняем по placeholder — единственный однозначный признак в разметке. */
  async function fillValid(w: Awaited<ReturnType<typeof form>>) {
    await w.find('input[placeholder="Иван Иванов"]').setValue('Ваня')
    await w.find('input[placeholder="7 лет"]').setValue('8')
    await w.find('input[placeholder="Сергей Иванов"]').setValue('Анна')
    await w.find('input[placeholder="+7 (___) ___-__-__"]').setValue('+7 999 123-45-67')
    await w.find('input[type="checkbox"]').setValue(true)
  }

  it('изначально показывает форму, а не результат', async () => {
    const w = await form()
    expect(w.find('form').exists()).toBe(true)
    expect(w.find('.lform__state').exists()).toBe(false)
  })

  it('пустая отправка показывает ошибки валидации и не уходит с формы', async () => {
    const w = await form()
    await w.find('form').trigger('submit')
    await settle()
    expect(w.findAll('.lform__error').length).toBeGreaterThan(0)
    expect(w.find('form').exists()).toBe(true)
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
    expect(submittedLeads[0].childName).toBe('Ваня')
    expect(submittedLeads[0].parentName).toBe('Анна')
    expect(submittedLeads[0].phone).toContain('999')
    expect(submittedLeads[0].consent).toBe(true)
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

  it('рендерит три поля по мокапу', async () => {
    const w = await cta()
    expect(w.find('#lead-name').exists()).toBe(true)
    expect(w.find('#lead-phone').exists()).toBe(true)
    expect(w.find('#lead-age').exists()).toBe(true)
  })

  /**
   * Раньше onSubmit просто ставил submitted=true и через 3.5 с очищал форму:
   * ни валидации, ни сети, ни следа заявки. Теперь форма ходит в бэкенд.
   */
  it('отправка доходит до бэкенда', async () => {
    const w = await cta()
    await w.find('#lead-name').setValue('Ваня')
    await w.find('#lead-phone').setValue('+7 999 123-45-67')
    await w.find('#lead-age').setValue('8-10')
    await w.find('form').trigger('submit')
    await settle()
    expect(submittedLeads).toHaveLength(1)
    expect(w.text()).toContain('Спасибо')
  })

  it('заявка с главной помечается источником', async () => {
    const w = await cta()
    await w.find('#lead-name').setValue('Ваня')
    await w.find('#lead-phone').setValue('+7 999 123-45-67')
    await w.find('#lead-age').setValue('8-10')
    await w.find('form').trigger('submit')
    await settle()
    expect(submittedLeads[0].message).toContain('главной')
  })

  it('ошибка сервера не выдаётся за успех', async () => {
    setSubmitBehavior('server-error')
    const w = await cta()
    await w.find('#lead-name').setValue('Ваня')
    await w.find('#lead-phone').setValue('+7 999 123-45-67')
    await w.find('#lead-age').setValue('8-10')
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
