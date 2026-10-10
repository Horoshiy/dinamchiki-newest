import { describe, it, expect } from 'vitest'
import { resolveContacts } from '@/entities/contact/useClubContacts'
import type { ContactInfo } from '@/entities/contact/contact.types'
import { CLUB_PHONE_DISPLAY } from '@/shared/config/club'

const info: ContactInfo = {
  phone: '89283200494',
  phoneFormatted: '',
  whatsapp: '79283200494',
  telegram: 'https://t.me/Dinamchiki_DFC',
  email: 'info@dinamchiki.ru',
  legalAddress: 'Ставрополь',
  socials: { max: 'https://max.ru/join/abc' },
}

describe('каналы связи', () => {
  it('порядок один на весь сайт: звонок, мессенджеры, почта', () => {
    expect(resolveContacts(info).channels.map((c) => c.id))
      .toEqual(['phone', 'whatsapp', 'telegram', 'max', 'email'])
  })

  it('номер с восьмёркой даёт тот же tel:, что и с семёркой', () => {
    expect(resolveContacts(info).phoneHref).toBe('tel:+79283200494')
    expect(resolveContacts(info).phoneDisplay).toBe('+7 (928) 320-04-94')
  })

  it('мессенджеры открываются в новой вкладке, звонок и почта — нет', () => {
    const ext = Object.fromEntries(resolveContacts(info).channels.map((c) => [c.id, c.external]))
    expect(ext).toEqual({ phone: false, whatsapp: true, telegram: true, max: true, email: false })
  })

  it('ссылка Telegram собирается из любой записи ника', () => {
    expect(resolveContacts({ ...info, telegram: '@Dinamchiki_DFC' }).telegramHref).toBe('https://t.me/Dinamchiki_DFC')
  })

  it('без базы — константы клуба, а не пустые строки', () => {
    const c = resolveContacts(null)
    expect(c.phoneDisplay).toBe(CLUB_PHONE_DISPLAY)
    expect(c.channels.every((x) => x.href && x.value)).toBe(true)
  })

  it('пустое поле в базе тоже уходит на константу', () => {
    expect(resolveContacts({ ...info, email: '' }).email).toBeTruthy()
  })
})
