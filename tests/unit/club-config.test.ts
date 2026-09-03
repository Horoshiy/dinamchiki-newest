import { describe, it, expect } from 'vitest'
import {
  CLUB_PHONE_E164,
  CLUB_PHONE_DISPLAY,
  CLUB_PHONE_HREF,
  CLUB_TELEGRAM,
  CLUB_TELEGRAM_HREF,
  CLUB_WHATSAPP,
  CLUB_WHATSAPP_DISPLAY,
  CLUB_WHATSAPP_HREF,
  CLUB_TELEGRAM_CHANNEL,
  CLUB_TELEGRAM_CHANNEL_HREF,
  CLUB_EMAIL,
  CLUB_EMAIL_HREF,
  SIGNUP_ROUTE,
} from '@/shared/config/club'
import { contactInfoMock } from '@/entities/contact/contacts.mocks'

/**
 * Контакты были продублированы в трёх местах с тремя РАЗНЫМИ телефонами
 * (шапка, моки, JSON-LD). Эти тесты держат единственный источник правды.
 */
describe('shared/config/club', () => {
  it('телефон в E.164 без разделителей', () => {
    expect(CLUB_PHONE_E164).toMatch(/^\+\d{11}$/)
  })

  it('href для звонка построен из E.164', () => {
    expect(CLUB_PHONE_HREF).toBe(`tel:${CLUB_PHONE_E164}`)
  })

  it('отображаемый телефон содержит те же цифры, что и E.164', () => {
    const digits = (s: string) => s.replace(/\D/g, '')
    expect(digits(CLUB_PHONE_DISPLAY)).toBe(digits(CLUB_PHONE_E164))
  })

  it('WhatsApp — отдельный номер, а не клубный телефон', () => {
    // Раньше номер выводился из CLUB_PHONE_E164, и кнопка вела в чат,
    // которого не существует: WhatsApp у клуба на другом номере.
    expect(CLUB_WHATSAPP).toMatch(/^\d{11}$/)
    expect(CLUB_WHATSAPP).not.toBe(CLUB_PHONE_E164.replace('+', ''))
    expect(CLUB_WHATSAPP_HREF).toBe(`https://wa.me/${CLUB_WHATSAPP}`)
  })

  it('отображаемый WhatsApp содержит те же цифры, что и номер в ссылке', () => {
    expect(CLUB_WHATSAPP_DISPLAY.replace(/\D/g, '')).toBe(CLUB_WHATSAPP)
  })

  it('Telegram для связи и Telegram-канал — разные адреса', () => {
    expect(CLUB_TELEGRAM_CHANNEL.startsWith('@')).toBe(true)
    expect(CLUB_TELEGRAM_CHANNEL_HREF).toBe(`https://t.me/${CLUB_TELEGRAM_CHANNEL.slice(1)}`)
    expect(CLUB_TELEGRAM_CHANNEL_HREF).not.toBe(CLUB_TELEGRAM_HREF)
  })

  it('ссылки на мессенджеры не содержат замаскированных символов', () => {
    // В HomeCta были захардкожены href="tel:+749****4567" и wa.me/749****4567.
    for (const href of [CLUB_PHONE_HREF, CLUB_WHATSAPP_HREF, CLUB_TELEGRAM_HREF, CLUB_EMAIL_HREF]) {
      expect(href).not.toContain('*')
    }
  })

  it('Telegram-ссылка построена из username без @', () => {
    expect(CLUB_TELEGRAM.startsWith('@')).toBe(true)
    expect(CLUB_TELEGRAM_HREF).toBe(`https://t.me/${CLUB_TELEGRAM.slice(1)}`)
    expect(CLUB_TELEGRAM_HREF).not.toContain('@')
  })

  it('email и mailto согласованы', () => {
    expect(CLUB_EMAIL).toContain('@')
    expect(CLUB_EMAIL_HREF).toBe(`mailto:${CLUB_EMAIL}`)
  })

  it('моки контактов не расходятся с конфигом клуба', () => {
    const digits = (s: string) => s.replace(/\D/g, '')
    expect(digits(contactInfoMock.phone)).toBe(digits(CLUB_PHONE_E164))
    expect(contactInfoMock.telegram).toBe(CLUB_TELEGRAM)
    expect(contactInfoMock.email).toBe(CLUB_EMAIL)
  })

  it('маршрут записи указывает на форму на странице контактов', () => {
    expect(SIGNUP_ROUTE).toBe('/contacts#lead')
  })
})
