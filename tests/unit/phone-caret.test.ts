import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { applyPhoneMask, onPhoneBlur, onPhoneFocus, placePhoneCaret, PHONE_PREFIX } from '@/shared/lib/phone'
import { validateLeadForm } from '@/entities/contact/lead.validation'

/** Поле телефона: при фокусе сразу «+7 (», курсор на месте первой цифры. */
describe('поле телефона: префикс и курсор', () => {
  let el: HTMLInputElement
  beforeEach(() => {
    vi.useFakeTimers()
    el = document.createElement('input')
    el.type = 'text'
    document.body.appendChild(el)
  })
  afterEach(() => {
    el.remove()
    vi.useRealTimers()
  })

  it('фокус на пустом поле подставляет «+7 (» и ставит курсор после него', () => {
    el.focus()
    expect(onPhoneFocus(el)).toBe(PHONE_PREFIX)
    vi.runAllTimers()
    expect(el.selectionStart).toBe(PHONE_PREFIX.length)
  })

  it('фокус на поле с частью номера уводит курсор к следующей цифре', () => {
    el.value = '+7 (928) 32'
    el.focus()
    el.setSelectionRange(0, 0)
    onPhoneFocus(el)
    expect(el.selectionStart).toBe(el.value.length)
  })

  it('Tab с выделением всего поля: выделение снимается, курсор в конце', () => {
    el.value = '+7 (928) 320'
    el.focus()
    el.setSelectionRange(0, el.value.length)
    onPhoneFocus(el)
    expect([el.selectionStart, el.selectionEnd]).toEqual([el.value.length, el.value.length])
  })

  it('клик в середину номера курсор не двигает', () => {
    el.value = '+7 (928) 320-04-94'
    el.focus()
    el.setSelectionRange(6, 6)
    placePhoneCaret(el)
    expect(el.selectionStart).toBe(6)
  })

  it('выделение мышью клик не сбрасывает', () => {
    el.value = '+7 (928) 320-04-94'
    el.focus()
    el.setSelectionRange(4, 8)
    placePhoneCaret(el)
    expect([el.selectionStart, el.selectionEnd]).toEqual([4, 8])
  })

  it('клик по «+7 (» переносит курсор к следующей цифре', () => {
    el.value = '+7 (928'
    el.focus()
    el.setSelectionRange(1, 1)
    placePhoneCaret(el)
    expect(el.selectionStart).toBe(7)
  })

  it('первая цифра после префикса идёт в номер, а не съедается как код страны', () => {
    el.focus()
    onPhoneFocus(el)
    for (const ch of ['8', '9']) {
      el.value += ch
      el.setSelectionRange(el.value.length, el.value.length)
      applyPhoneMask(el)
    }
    expect(el.value).toBe('+7 (89')
  })

  it('Backspace по последней цифре оставляет «+7 (», пока поле в фокусе', () => {
    el.value = '+7 (9'
    el.focus()
    el.value = '+7 ('
    el.setSelectionRange(4, 4)
    expect(applyPhoneMask(el)).toBe(PHONE_PREFIX)
  })

  it('уход из поля без цифр убирает «+7 (»', () => {
    el.value = PHONE_PREFIX
    expect(onPhoneBlur(el)).toBe('')
    el.value = '+7 (92'
    expect(onPhoneBlur(el)).toBe('+7 (92')
  })

  it('«+7 (» без цифр при отправке — «Укажите телефон»', () => {
    expect(validateLeadForm({ phone: PHONE_PREFIX, consent: true }).phone).toBe('Укажите телефон')
  })
})
