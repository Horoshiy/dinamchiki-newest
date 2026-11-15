<script setup lang="ts">
// Вкладки раздела. Ребёнок: Разминка / Карточка. Тренер: Тренерская.
import { useRoute } from 'vue-router'

defineProps<{ mode: 'child' | 'staff' }>()
const route = useRoute()
</script>

<template>
  <nav class="base-nav" aria-label="Разделы Подтрибунки">
    <template v-if="mode === 'child'">
      <RouterLink :to="{ name: 'base-mission' }" class="base-nav__tab" :class="{ 'is-active': route.name === 'base-mission' }">
        <span aria-hidden="true">⚽</span> Разминка
      </RouterLink>
      <RouterLink :to="{ name: 'base-progress' }" class="base-nav__tab" :class="{ 'is-active': route.name === 'base-progress' }">
        <span aria-hidden="true">📇</span> Карточка
      </RouterLink>
    </template>
    <template v-else>
      <RouterLink :to="{ name: 'base-staff' }" class="base-nav__tab" :class="{ 'is-active': route.name === 'base-staff' || route.name === 'base-staff-child' }">
        <span aria-hidden="true">🧢</span> Тренерская
      </RouterLink>
    </template>
  </nav>
</template>

<style scoped lang="scss">
.base-nav { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: rgba(6, 9, 18, 0.6); border: 1px solid var(--ab-line); }
.base-nav__tab {
  display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 18px;
  border-radius: 999px; color: var(--ab-text-dim); text-decoration: none;
  font-family: var(--ab-font-display); font-weight: 700; font-size: 0.9rem; transition: all 150ms ease;
}
.base-nav__tab:hover { color: var(--ab-text); }
.base-nav__tab.is-active { background: linear-gradient(180deg, var(--ab-blue-bright), var(--ab-blue)); color: #fff; box-shadow: 0 4px 16px rgba(30, 80, 216, 0.4); }
</style>