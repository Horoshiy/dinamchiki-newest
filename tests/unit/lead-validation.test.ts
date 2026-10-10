import { describe, it, expect } from 'vitest'
import { validateLeadForm } from '@/entities/contact/lead.validation'
import type { LeadFormDraft } from '@/entities/contact/contact.types'
import { formatPhone, normalizePhone } from '@/shared/lib/phone'

/** Форма с 09.10.2026: только телефон; согласие — нажатие кнопки. */
function draft(over: Partial<LeadFormDraft> = {}): LeadFormDraft {
  return {
    phone: '+7 999 123-45-67',
    consent: true,
    ...over,
  }
}

describe('validateLeadForm', () => {
  it('полностью заполненная форма проходит', () => {
    expect(validateLeadForm(draft())).toEqual({})
  })

  it.each([
    ['phone', { phone: '' }, 'phone'],
    ['consent', { consent: false }, 'consent'],
  ])('обязательное поле %s даёт ошибку', (_name, over, key) => {
    const errors = validateLeadForm(draft(over as Partial<LeadFormDraft>))
    expect(errors).toHaveProperty(key)
  })

  it('пробелы не считаются заполненным полем', () => {
    expect(validateLeadForm(draft({ phone: '   ' }))).toHaveProperty('phone')
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

  it('несколько ошибок возвращаются разом', () => {
    const errors = validateLeadForm(draft({ phone: '', consent: false }))
    expect(Object.keys(errors).sort()).toEqual(['consent', 'phone'])
  })
})

describe('маска телефона', () => {
  it.each([
    ['8 928 320-04-94', '+7 (928) 320-04-94'],
    ['+7 8 928 320 04 94', '+7 (928) 320-04-94'],
    ['79283200494', '+7 (928) 320-04-94'],
    ['9283200494', '+7 (928) 320-04-94'],
    // Городской номер без «8» впереди: его восьмёрка — часть кода города.
    ['8652123456', '+7 (865) 212-34-56'],
  ])('вставка %s → %s', (raw, masked) => {
    expect(formatPhone(raw)).toBe(masked)
  })

  /** Раньше «) » возвращался после каждого Backspace и номер не стирался. */
  it('Backspace после третьей цифры стирает дальше', () => {
    expect(formatPhone('+7 (928) ')).toBe('+7 (928')
    expect(formatPhone('+7 (92')).toBe('+7 (92')
    expect(formatPhone('+7 (')).toBe('')
  })

  it('первая 8 или 7 в пустом поле — начало номера, а не его цифра', () => {
    expect(formatPhone('8')).toBe('')
    expect(formatPhone('7')).toBe('')
    expect(formatPhone('9')).toBe('+7 (9')
  })

  it('в бэкенд уходит +7 и десять цифр', () => {
    expect(normalizePhone('+7 (928) 320-04-94')).toBe('+79283200494')
    expect(normalizePhone('+7 (928) 320')).toBe('')
  })
})
