import { describe, it, expect } from 'vitest'
import { validateLeadForm } from '@/entities/contact/lead.validation'
import type { LeadFormDraft } from '@/entities/contact/contact.types'

function draft(over: Partial<LeadFormDraft> = {}): LeadFormDraft {
  return {
    childName: 'Ваня',
    childAge: '8',
    parentName: 'Анна',
    phone: '+7 999 123-45-67',
    email: '',
    preferredTime: '',
    message: '',
    ageGroup: '',
    consent: true,
    ...over,
  }
}

describe('validateLeadForm', () => {
  it('полностью заполненная форма проходит', () => {
    expect(validateLeadForm(draft())).toEqual({})
  })

  it.each([
    ['childName', { childName: '' }, 'childName'],
    ['childAge', { childAge: '' }, 'childAge'],
    ['parentName', { parentName: '' }, 'parentName'],
    ['phone', { phone: '' }, 'phone'],
    ['consent', { consent: false }, 'consent'],
  ])('обязательное поле %s даёт ошибку', (_name, over, key) => {
    const errors = validateLeadForm(draft(over as Partial<LeadFormDraft>))
    expect(errors).toHaveProperty(key)
  })

  it('пробелы не считаются заполненным полем', () => {
    expect(validateLeadForm(draft({ childName: '   ' }))).toHaveProperty('childName')
  })

  it('слишком короткий телефон отклоняется', () => {
    expect(validateLeadForm(draft({ phone: '123' }))).toHaveProperty('phone')
  })

  it('телефон из букв отклоняется', () => {
    expect(validateLeadForm(draft({ phone: 'позвоните мне' }))).toHaveProperty('phone')
  })

  it.each(['+7 (999) 123-45-67', '89991234567', '8 999 123 45 67'])(
    'валидный телефон %s принимается',
    (phone) => {
      expect(validateLeadForm(draft({ phone }))).not.toHaveProperty('phone')
    },
  )

  it('пустой email не проверяется — поле необязательное', () => {
    expect(validateLeadForm(draft({ email: '' }))).not.toHaveProperty('email')
  })

  it('заполненный кривой email отклоняется', () => {
    expect(validateLeadForm(draft({ email: 'не-почта' }))).toHaveProperty('email')
  })

  it('корректный email принимается', () => {
    expect(validateLeadForm(draft({ email: 'a@b.ru' }))).not.toHaveProperty('email')
  })

  it('несколько ошибок возвращаются разом', () => {
    const errors = validateLeadForm(draft({ childName: '', phone: '', consent: false }))
    expect(Object.keys(errors).sort()).toEqual(['childName', 'consent', 'phone'])
  })
})
