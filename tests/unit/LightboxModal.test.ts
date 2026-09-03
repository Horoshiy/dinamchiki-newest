import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LightboxModal from '@/widgets/gallery/LightboxModal.vue'
import type { GalleryPhoto } from '@/entities/gallery/gallery.types'

const photos: GalleryPhoto[] = [0, 1, 2].map((i) => ({
  id: `p${i}`,
  albumId: 'a1',
  url: `placeholder://a1/${i}`,
  caption: `Фото ${i}`,
  aspect: 'landscape',
  placeholderColor: '#1e50d8',
}))

function open(currentIndex = 0) {
  return mount(LightboxModal, {
    props: { photos, currentIndex, open: true },
    attachTo: document.body,
  })
}

function press(key: string, shiftKey = false) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }))
}

describe('LightboxModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('закрытый lightbox ничего не рендерит', () => {
    mount(LightboxModal, { props: { photos, currentIndex: 0, open: false }, attachTo: document.body })
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('открытый рендерит диалог с aria-modal', () => {
    open()
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
  })

  it('диалог подписан подписью текущего фото', () => {
    open(1)
    expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Фото 1')
  })

  it('счётчик показывает позицию', () => {
    open(1)
    expect(document.querySelector('.lightbox__counter')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('2 / 3')
  })

  it('Escape закрывает', async () => {
    const w = open()
    press('Escape')
    await nextTick()
    expect(w.emitted('update:open')?.[0]).toEqual([false])
  })

  it('стрелка вправо листает вперёд', async () => {
    const w = open(0)
    press('ArrowRight')
    await nextTick()
    expect(w.emitted('update:currentIndex')?.[0]).toEqual([1])
  })

  it('стрелка влево листает назад', async () => {
    const w = open(2)
    press('ArrowLeft')
    await nextTick()
    expect(w.emitted('update:currentIndex')?.[0]).toEqual([1])
  })

  it('на первом фото влево не листает', async () => {
    const w = open(0)
    press('ArrowLeft')
    await nextTick()
    expect(w.emitted('update:currentIndex')).toBeUndefined()
  })

  it('на последнем фото вправо не листает', async () => {
    const w = open(2)
    press('ArrowRight')
    await nextTick()
    expect(w.emitted('update:currentIndex')).toBeUndefined()
  })

  it('кнопка «назад» скрыта на первом фото, «вперёд» — на последнем', () => {
    open(0)
    expect(document.querySelector('.lightbox__nav--prev')).toBeNull()
    expect(document.querySelector('.lightbox__nav--next')).not.toBeNull()
    document.body.innerHTML = ''
    open(2)
    expect(document.querySelector('.lightbox__nav--next')).toBeNull()
  })

  it('блокирует скролл body пока открыт и снимает блокировку при закрытии', async () => {
    const w = open()
    expect(document.body.style.overflow).toBe('hidden')
    await w.setProps({ open: false })
    expect(document.body.style.overflow).toBe('')
  })

  it('снимает блокировку скролла при размонтировании', async () => {
    const w = open()
    expect(document.body.style.overflow).toBe('hidden')
    w.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('после закрытия перестаёт слушать клавиатуру', async () => {
    const w = open()
    await w.setProps({ open: false })
    press('ArrowRight')
    await nextTick()
    expect(w.emitted('update:currentIndex')).toBeUndefined()
  })

  /**
   * В шапке файла был заявлен «Focus-trap (Escape + Tab)», но Tab не
   * перехватывался: фокус уходил на элементы страницы под модалкой.
   */
  describe('focus-trap', () => {
    it('при открытии фокус уходит внутрь модалки', async () => {
      open()
      await nextTick()
      await nextTick()
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog?.contains(document.activeElement)).toBe(true)
    })

    it('Tab с последнего элемента возвращает на первый', async () => {
      open(1)
      await nextTick(); await nextTick()
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('button'))
      focusables[focusables.length - 1].focus()
      press('Tab')
      await nextTick()
      expect(document.activeElement).toBe(focusables[0])
    })

    it('Shift+Tab с первого элемента уводит на последний', async () => {
      open(1)
      await nextTick(); await nextTick()
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('button'))
      focusables[0].focus()
      press('Tab', true)
      await nextTick()
      expect(document.activeElement).toBe(focusables[focusables.length - 1])
    })

    it('фокус, ушедший наружу, возвращается внутрь по Tab', async () => {
      const outside = document.createElement('button')
      document.body.appendChild(outside)
      open()
      await nextTick(); await nextTick()
      outside.focus()
      press('Tab')
      await nextTick()
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog?.contains(document.activeElement)).toBe(true)
    })

    it('после закрытия фокус возвращается на элемент, с которого открыли', async () => {
      const trigger = document.createElement('button')
      document.body.appendChild(trigger)
      trigger.focus()
      const w = mount(LightboxModal, {
        props: { photos, currentIndex: 0, open: false },
        attachTo: document.body,
      })
      await w.setProps({ open: true })
      await nextTick(); await nextTick()
      await w.setProps({ open: false })
      await nextTick()
      expect(document.activeElement).toBe(trigger)
    })
  })
})
