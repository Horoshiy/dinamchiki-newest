// =============================================================================
// Версия сайта для слабовидящих.
//
// Требование не косметическое: атрибут микроразметки itemprop="copy" —
// первая строка проверочной таблицы КАЖДОГО подраздела «Сведений
// об образовательной организации», а сама версия, по Методическим
// рекомендациям Рособрнадзора, разрабатывается для всего сайта и должна
// быть доступна с любой страницы.
//
// Реализация без сторонних виджетов: режим выставляет data-атрибуты
// на <html>, а стили (app/styles/bvi.scss) перекрывают палитру и размер
// шрифта. Токены типографики заданы в rem, поэтому смена размера
// на корневом элементе масштабирует весь текст.
// =============================================================================
import { ref, watch } from 'vue'

export type BviTheme = 'white' | 'black' | 'blue'
export type BviSize = 1 | 2 | 3

const STORAGE_KEY = 'dinamchiki:bvi'

interface BviState {
  enabled: boolean
  theme: BviTheme
  size: BviSize
  images: boolean
}

const DEFAULT_STATE: BviState = { enabled: false, theme: 'white', size: 1, images: true }

/** Чтение настроек. Приватный режим и запрет хранилища не должны ронять сайт. */
function readState(): BviState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Partial<BviState>
    return {
      enabled: parsed.enabled === true,
      theme: (['white', 'black', 'blue'] as const).includes(parsed.theme as BviTheme)
        ? (parsed.theme as BviTheme)
        : DEFAULT_STATE.theme,
      size: ([1, 2, 3] as const).includes(parsed.size as BviSize)
        ? (parsed.size as BviSize)
        : DEFAULT_STATE.size,
      images: parsed.images !== false,
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

// Состояние модульное: панель, кнопка в шапке и подвал смотрят на один объект.
const state = ref<BviState>(readState())

function apply(s: BviState): void {
  const root = document.documentElement
  if (s.enabled) {
    root.setAttribute('data-bvi', 'on')
    root.setAttribute('data-bvi-theme', s.theme)
    root.setAttribute('data-bvi-size', String(s.size))
    root.setAttribute('data-bvi-images', s.images ? 'on' : 'off')
  } else {
    root.removeAttribute('data-bvi')
    root.removeAttribute('data-bvi-theme')
    root.removeAttribute('data-bvi-size')
    root.removeAttribute('data-bvi-images')
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // Хранилище недоступно — режим всё равно работает до конца сессии.
  }
}

let started = false

/** Вызывается один раз при старте приложения. */
export function initBvi(): void {
  if (started) return
  started = true
  apply(state.value)
  watch(state, apply, { deep: true })
}

export function useBvi() {
  return {
    state,
    enable: () => { state.value.enabled = true },
    disable: () => { state.value.enabled = false },
    toggle: () => { state.value.enabled = !state.value.enabled },
    setTheme: (theme: BviTheme) => { state.value.theme = theme },
    setSize: (size: BviSize) => { state.value.size = size },
    toggleImages: () => { state.value.images = !state.value.images },
  }
}
