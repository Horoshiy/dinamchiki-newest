import { describe, it, expect } from 'vitest'
import { givenName, initials } from '@/shared/lib/person'
import { isRealPhoto } from '@/shared/lib/photo'

describe('initials', () => {
  it('первые буквы двух первых слов', () => {
    expect(initials('Третьяков Дмитрий Михайлович')).toBe('ТД')
    expect(initials('  миша   орлов ')).toBe('МО')
  })
  it('одно слово и пустое имя не ломаются', () => {
    expect(initials('Ролан')).toBe('Р')
    expect(initials(undefined)).toBe('')
  })
})

describe('isRealPhoto', () => {
  it('только http(s)-адреса — настоящие фото', () => {
    expect(isRealPhoto('https://minio.dinamchiki.ru/a.jpg')).toBe(true)
    expect(isRealPhoto('placeholder://album-1')).toBe(false)
    expect(isRealPhoto(null)).toBe(false)
  })
})

describe('givenName', () => {
  it('ФИО фамилией вперёд → имя и отчество', () => {
    expect(givenName('Третьяков Дмитрий Михайлович')).toBe('Дмитрий Михайлович')
  })
  it('не три слова — как есть', () => {
    expect(givenName('Дмитрий Третьяков')).toBe('Дмитрий Третьяков')
  })
})
