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

  it('кириллицу и любые нелатинские символы отбрасывает', () => {
    // Ввод с русской раскладки не подменяется «похожими» буквами —
    // иначе код превращается в другой и не подходит.
    expect(normalizeAgentCode('ПОДТРИБУНКА')).toBe('')
    expect(normalizeAgentCode('2AW5ФПРB')).toBe('2AW5B')
    expect(normalizeAgentCode('Н')).toBe('')
  })

  it('O, I и L приводит к цифрам — как сервер', () => {
    expect(normalizeAgentCode('OIL')).toBe('011')
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
