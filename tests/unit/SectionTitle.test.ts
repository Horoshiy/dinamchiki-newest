import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'

/**
 * Действие в заголовке секции было position: absolute (top/right 0).
 * На узком экране заголовок переносился на две строки, вырастал вширь
 * и уезжал под кнопку: «Все фото» накрывала «Галерея клуба».
 *
 * Эти тесты закрепляют структуру, при которой наложение невозможно
 * в принципе: текст и действие — соседи в обычном потоке.
 */
describe('SectionTitle', () => {
  it('показывает eyebrow и заголовок', () => {
    const w = mount(SectionTitle, { props: { eyebrow: 'Атмосфера', title: 'Галерея клуба' } })
    expect(w.find('.section-title__eyebrow').text()).toBe('Атмосфера')
    expect(w.find('.section-title__title').text()).toBe('Галерея клуба')
  })

  it('заголовок — это h2 (семантика секции)', () => {
    const w = mount(SectionTitle, { props: { title: 'Турниры' } })
    expect(w.find('.section-title__title').element.tagName).toBe('H2')
  })

  it('без слота action блок действия не рендерится', () => {
    const w = mount(SectionTitle, { props: { title: 'Заголовок' } })
    expect(w.find('.section-title__action').exists()).toBe(false)
  })

  it('текстовая часть и действие — соседи, а не вложены друг в друга', () => {
    const w = mount(SectionTitle, {
      props: { eyebrow: 'Атмосфера', title: 'Галерея клуба' },
      slots: { action: '<a href="/gallery">Все фото</a>' },
    })
    const main = w.find('.section-title__main').element
    const action = w.find('.section-title__action').element
    expect(main.contains(action), 'действие лежит внутри текстового блока').toBe(false)
    expect(action.contains(main)).toBe(false)
    expect(main.parentElement).toBe(action.parentElement)
  })

  it('заголовок, eyebrow и полоска лежат в текстовом блоке', () => {
    const w = mount(SectionTitle, {
      props: { eyebrow: 'Соревнования', title: 'Турниры и результаты' },
      slots: { action: '<a href="/tournaments">Все турниры</a>' },
    })
    const main = w.find('.section-title__main')
    expect(main.find('.section-title__eyebrow').exists()).toBe(true)
    expect(main.find('.section-title__title').exists()).toBe(true)
    expect(main.find('.section-title__bar').exists()).toBe(true)
  })

  /**
   * Регресс-тест: пока действие в обычном потоке, оно физически не может
   * оказаться поверх заголовка. Абсолютное позиционирование возвращает
   * исходный дефект.
   */
  it('действие не позиционируется абсолютно', () => {
    // Scoped-стили в happy-dom не применяются, поэтому проверяем исходник:
    // именно возврат position: absolute воспроизводит исходный дефект.
    const source = readFileSync(resolve('src/shared/ui/base/SectionTitle.vue'), 'utf8')
    const block = source.slice(source.indexOf('.section-title__action {'))
    const declarations = block.slice(0, block.indexOf('}'))
    expect(declarations, 'действие снова позиционируется абсолютно').not.toContain('position: absolute')
  })

  it('вариант center добавляет модификатор', () => {
    const w = mount(SectionTitle, { props: { title: 'Ц', align: 'center' } })
    expect(w.classes()).toContain('section-title--center')
  })

  it('размер заголовка задаётся модификатором', () => {
    expect(mount(SectionTitle, { props: { title: 'X', size: 'lg' } })
      .find('.section-title__title').classes()).toContain('section-title__title--lg')
  })

  it('слоты имеют приоритет над пропсами', () => {
    const w = mount(SectionTitle, { props: { title: 'Из пропса' }, slots: { default: 'Из слота' } })
    expect(w.find('.section-title__title').text()).toBe('Из слота')
  })
})
