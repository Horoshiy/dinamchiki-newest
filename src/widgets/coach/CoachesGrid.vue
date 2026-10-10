<script setup lang="ts">
/**
 * Сетка карточек тренеров с состояниями loading/empty.
 * Фильтры лежат в странице (CoachesPage) — паттерн совпадает с /teams.
 */
import type { Coach } from '@/entities/coach/coach.types'
import CoachCard from './CoachCard.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import IconUsers from '@/shared/ui/icons/IconUsers.vue'
import { LOAD_ERROR_HINT } from '@/shared/config/club'

defineProps<{
  coaches: ReadonlyArray<Coach> | null
  loading: boolean
  error: Error | null
}>()
</script>

<template>
  <div v-if="loading" class="coaches-grid">
    <LoadingSkeleton
      v-for="i in 6"
      :key="i"
      variant="block"
      height="380px"
    />
  </div>

  <div v-else-if="error" class="coaches-grid-state">
    <EmptyState
      title="Не удалось загрузить тренеров"
      :description="LOAD_ERROR_HINT"
      :icon="IconUsers"
      variant="card"
    />
  </div>

  <div v-else-if="coaches && coaches.length === 0" class="coaches-grid-state">
    <EmptyState
      title="Пока никого не нашли"
      description="Попробуйте изменить фильтры — возможно, в выбранной категории сейчас нет тренеров."
      :icon="IconUsers"
      variant="card"
    />
  </div>

  <div v-else class="coaches-grid">
    <CoachCard
      v-for="coach in coaches ?? []"
      :key="coach.id"
      :coach="coach"
    />
  </div>
</template>

<style scoped lang="scss">
.coaches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: $space-5;
}

.coaches-grid-state {
  display: block;
}

.coaches-grid-state :deep(.empty-state) {
  width: 100%;
}
</style>
