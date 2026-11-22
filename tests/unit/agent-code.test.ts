import { describe, it, expect } from 'vitest'
import { formatAgentCode, normalizeAgentCode } from '@/features/base/utils/agentCode'

/** Код игрока: всегда заглавными, цифры — как есть. */
describe('код игрока: нормализация ввода', () => {
  it('строчные буквы поднимает в заглавные', () => {
    expect(normalizeAgentCode('2aw583gtpv')).toBe('2AW583GTPV')
  })

  it('цифры не трогает', () => {
    expect(normalizeAgentCode('0123456789')).toBe('0123456789')
  })

  it('дефисы и пробелы убирает', () => {
    expect(normalizeAgentCode('2AW5-83GT PV')).toBe('2AW583GTPV')
  })

  it('кириллические двойники превращает в латинские, остальные — отбрасывает', () => {
    // П О Д Т Р И Б У Н К А → 0 T P Y H K A (у П, Д, И, Б латинских двойников нет)
    expect(normalizeAgentCode('ПОДТРИБУНКА')).toBe('0TPYHKA')
  })

  it('O, I и L приводит к цифрам — как сервер', () => {
    expect(normalizeAgentCode('OIL')).toBe('011')
    // Кириллическая «О» — тоже буква O, в коде её не бывает: сервер заменит на 0.
    expect(normalizeAgentCode('О')).toBe('0')
  })

  it('обрезает всё, что длиннее 10 символов', () => {
    expect(normalizeAgentCode('2AW583GTPVX')).toBe('2AW583GTPV')
  })

  it('пустая строка и мусор дают пустой код', () => {
    expect(normalizeAgentCode('')).toBe('')
    expect(normalizeAgentCode('!!!')).toBe('')
  })
})

describe('код игрока: разбивка на группы', () => {
  it('расставляет дефисы как на карточке', () => {
    expect(formatAgentCode('2aw583gtpv')).toBe('2AW5-83GT-PV')
  })

  it('недостающий код не раздувает', () => {
    expect(formatAgentCode('2AW5')).toBe('2AW5')
  })
})
