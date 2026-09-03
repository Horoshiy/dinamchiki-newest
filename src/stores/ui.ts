// UI-store: глобальное состояние shell'а (бургер-меню, модалки).
// Конкретные доменные store'ы (teams, coaches, ...) добавим на Этапе 11.

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isMobileMenuOpen = ref(false)

  function openMobileMenu()  { isMobileMenuOpen.value = true }
  function closeMobileMenu() { isMobileMenuOpen.value = false }
  function toggleMobileMenu() { isMobileMenuOpen.value = !isMobileMenuOpen.value }

  return {
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
  }
})
