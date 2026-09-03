// Общая настройка тестовой среды.

import { config } from '@vue/test-utils'
import { beforeEach, vi } from 'vitest'
import { installTestApolloClient, resetHarness } from './graphql-harness'

// happy-dom не реализует matchMedia — некоторые компоненты его трогают.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

// Тесты проверяют поведение, а не консольный шум обработчиков ошибок.
config.global.config.warnHandler = () => {}

/**
 * Apollo-клиент ставится глобально — ровно как в main.ts. Без этого
 * composables в режиме USE_MOCKS_ONLY = false падают с «Apollo client
 * with id default not found».
 *
 * Транспорт — in-process схема бэкенда (см. graphql-harness.ts), поэтому
 * сеть не нужна, а контракт проверяется настоящий.
 */
beforeEach(() => {
  resetHarness()
  installTestApolloClient()
})
