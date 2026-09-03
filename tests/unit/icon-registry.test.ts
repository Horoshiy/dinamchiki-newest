import { describe, it, expect } from 'vitest'
import { iconByKey } from '@/shared/ui/icons/registry'
import { homeContentMock } from '@/entities/content/content.mocks'
import type { IconKey } from '@/entities/content/content.types'

const ALL_KEYS: IconKey[] = ['trophy', 'users', 'ball', 'award', 'shield', 'calendar', 'star', 'heart']

describe('shared/ui/icons/registry', () => {
  it.each(ALL_KEYS)('ключ %s резолвится в компонент', (key) => {
    expect(iconByKey(key)).toBeTruthy()
  })

  it('разные ключи дают разные компоненты', () => {
    const components = ALL_KEYS.map((k) => iconByKey(k))
    expect(new Set(components).size).toBe(ALL_KEYS.length)
  })

  it('неизвестный ключ не роняет приложение, а даёт запасную иконку', () => {
    expect(iconByKey('такой-иконки-нет')).toBeTruthy()
    expect(iconByKey('')).toBeTruthy()
  })

  it('все iconKey из контента главной есть в реестре', () => {
    // Сравнивать с fallback нельзя: запасная иконка — это ball, который сам
    // является легальным ключом. Проверяем принадлежность списку ключей.
    const known = new Set<string>(ALL_KEYS)
    const used = [
      ...homeContentMock.stats.map((s) => s.iconKey),
      ...homeContentMock.features.map((f) => f.iconKey),
      ...homeContentMock.trainingSteps.map((s) => s.iconKey),
    ]
    expect(used.length).toBeGreaterThan(0)
    for (const key of used) {
      expect(known.has(key), `iconKey «${key}» не зарегистрирован — отрендерится запасная иконка`).toBe(true)
    }
  })
})
