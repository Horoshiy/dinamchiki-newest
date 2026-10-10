import { describe, it, expect } from 'vitest'
import {
  clubDescription,
  clubYears,
  clubYearsLabel,
  MIN_PRICE,
  STAFF_EXPERIENCE_TEXT,
  STUDENTS_TOTAL,
} from '@/entities/club/club.facts'

describe('цифры о клубе', () => {
  it('возраст клуба меняется в день регистрации, 16 июля', () => {
    expect(clubYears(new Date(2026, 6, 15))).toBe(10)
    expect(clubYears(new Date(2026, 6, 16))).toBe(11)
    expect(clubYears(new Date(2036, 6, 16))).toBe(21)
  })

  it('подпись к возрасту согласована с числом', () => {
    expect(clubYearsLabel(11)).toBe('лет')
    expect(clubYearsLabel(21)).toBe('год')
    expect(clubYearsLabel(22)).toBe('года')
  })

  it('учащиеся и цены — из «Сведений»', () => {
    expect(STUDENTS_TOTAL).toBe(208)
    expect(MIN_PRICE).toBe(3500)
  })

  it('стаж тренеров без незаполненных строк', () => {
    expect(STAFF_EXPERIENCE_TEXT).toBe('от 9 до 22 лет')
  })

  it('описание главной: с числом групп и без него', () => {
    expect(clubDescription(17)).toContain('17 групп для детей')
    expect(clubDescription(17)).toContain('от 3 500 ₽')
    expect(clubDescription()).toContain('в Ставрополе: группы для детей')
    expect(clubDescription()).not.toMatch(/\d+ групп/)
  })
})
