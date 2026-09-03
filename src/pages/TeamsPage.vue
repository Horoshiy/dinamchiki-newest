<script setup lang="ts">
/**
 * Страница «Команды» (`/teams`).
 *
 * Данные из GraphQL через useTeamsQuery (с mock-fallback).
 */
import { computed, ref, watch } from 'vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import FilterChips from '@/shared/ui/base/FilterChips.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import TeamCard from '@/widgets/team/TeamCard.vue'
import TeamSchedule from '@/widgets/team/TeamSchedule.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import { useTeamsQuery } from '@/shared/api/composables'
import type { Team } from '@/entities/team/team.types'

// Возрастные группы соответствуют образовательным программам по лицензии
// (см. /sveden/education), а не прежнему выдуманному делению 5–7 / 8–10 / 11–14.
const ageGroups = [
  { value: 'all',    label: 'Все возрасты' },
  { value: '3-5',    label: '3–5 лет' },
  { value: '6-7',    label: '6–7 лет' },
  { value: '8-10',   label: '8–10 лет' },
  { value: '11-14',  label: '11–14 лет' },
]
const selectedAge = ref<string | null>('all')

const { data, loading, error } = useTeamsQuery()

/** Безопасный список команд (даже если data ещё нет — пустой массив). */
const teams = computed<ReadonlyArray<Team>>(() => {
  const d = data.value as { teams?: ReadonlyArray<Team> } | null
  return d?.teams ?? []
})

const filteredTeams = computed<ReadonlyArray<Team>>(() => {
  if (!selectedAge.value || selectedAge.value === 'all') return teams.value
  return teams.value.filter((t) => (t.ageGroup as string) === selectedAge.value)
})

const totalPlayers = computed(() =>
  teams.value.reduce((sum, t) => sum + t.playersCount, 0),
)

// Логируем ошибки для отладки (мок fallback прозрачен для UI)
watch(error, (e) => {
  if (e) console.warn('[TeamsPage]', e.message)
})
</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="О клубе"
        title="Наши команды"
        description="В каждой команде — опытный тренер, индивидуальный подход и регулярные тренировки 2–3 раза в неделю. Выберите возраст, чтобы увидеть состав."
      >
        <template #action>
          <FilterChips v-model:selected="selectedAge" :items="ageGroups" />
        </template>
      </PageHeader>

      <p v-if="!loading && teams.length" class="teams-summary">
        <strong>{{ filteredTeams.length }}</strong> команд ·
        <strong>{{ totalPlayers }}</strong> игроков в клубе
      </p>
    </section>

    <!-- Сетка команд -->
    <section class="container">
      <div v-if="loading" class="teams-grid">
        <LoadingSkeleton v-for="i in 6" :key="i" variant="block" height="320px" />
      </div>

      <div v-else-if="error" class="teams-error">
        <EmptyState
          title="Не удалось загрузить команды"
          :description="error.message"
          :icon="IconBall"
          variant="card"
        />
      </div>

      <div v-else-if="filteredTeams.length === 0" class="teams-empty">
        <EmptyState
          title="Нет команд в этой возрастной группе"
          description="Попробуйте выбрать другой возраст или вернитесь к «Все возрасты»."
          :icon="IconBall"
          variant="card"
        />
      </div>

      <div v-else class="teams-grid">
        <TeamCard
          v-for="team in filteredTeams"
          :key="team.id"
          :team="team"
        />
      </div>
    </section>

    <!-- Общее расписание -->
    <section v-if="teams.length > 0" class="container">
      <SectionTitle eyebrow="Расписание" title="Тренировки по командам" />
      <div class="teams-schedule-grid">
        <TeamSchedule
          v-for="team in teams"
          :key="team.id"
          :schedule="team.schedule"
        />
      </div>
    </section>
  </PageContainer>
</template>

<style scoped lang="scss">
.teams-summary {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  margin: $space-2 0 0;

  strong { color: $color-brand-500; font-weight: $font-weight-bold; }
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: $space-5;
}

.teams-error,
.teams-empty {
  display: block;
}

.teams-schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
  gap: $space-5;
}

.teams-error :deep(.empty-state),
.teams-empty :deep(.empty-state) {
  width: 100%;
}
</style>
