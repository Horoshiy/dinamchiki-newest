import { describe, it, expect } from 'vitest'
import { formatDay, formatShort, formatFull, formatRange, formatTime } from '@/shared/lib/date'

describe('shared/lib/date', () => {
  const iso = '2026-05-15T17:00:00'

  it('formatDay даёт день и месяц без года', () => {
    const out = formatDay(iso)
    expect(out).toContain('15')
    expect(out).toContain('ма')
    expect(out).not.toContain('2026')
  })

  it('formatShort даёт сокращённый месяц с годом', () => {
    const out = formatShort(iso)
    expect(out).toContain('15')
    expect(out).toContain('2026')
  })

  it('formatFull даёт полный месяц с годом', () => {
    const out = formatFull(iso)
    expect(out).toContain('15')
    expect(out).toContain('2026')
  })

  it('formatFull даёт более длинный месяц, чем formatShort', () => {
    // В ru-RU «мая» одинаково в обоих форматах, поэтому берём сентябрь:
    // «сент.» против «сентября».
    const sep = '2026-09-05T12:00:00'
    expect(formatFull(sep).length).toBeGreaterThan(formatShort(sep).length)
    expect(formatFull(sep)).toContain('сентября')
  })

  it('formatRange склеивает две даты через тире', () => {
    const out = formatRange('2026-05-15T00:00:00', '2026-06-30T00:00:00')
    expect(out).toMatch(/—/)
    expect(out).toContain('15')
    expect(out).toContain('30')
  })

  it('формат стабилен для полуночи и конца суток (нет сдвига на сутки)', () => {
    expect(formatDay('2026-05-15T00:00:00')).toBe(formatDay('2026-05-15T23:59:00'))
  })

  /** Даты в базе без пояса — это московское время клуба, а не пояс браузера. */
  it('время без пояса показывается как есть (МСК), в любом поясе браузера', () => {
    expect(formatTime('2026-08-20T17:00:00')).toBe('17:00')
    expect(formatTime('2026-08-20T17:00:00+03:00')).toBe('17:00')
    expect(formatTime('2026-08-20T14:00:00Z')).toBe('17:00')
  })

  it('дата без времени не съезжает на соседние сутки', () => {
    expect(formatDay('2026-09-03')).toContain('03')
  })
})
