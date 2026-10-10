<script setup lang="ts">
/**
 * Страница «Команды» (`/teams`).
 *
 * Данные из GraphQL через useTeamsQuery (с mock-fallback).
 */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import FilterChips from '@/shared/ui/base/FilterChips.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import { SIGNUP_ROUTE, LOAD_ERROR_HINT } from '@/shared/config/club'
import { plural } from '@/shared/lib/plural'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import TeamCard from '@/widgets/team/TeamCard.vue'
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
/**
 * Возраст берётся из ?age= — на него ведут карточки программ с главной
 * и пункты «Программы» в подвале. Раньше параметр игнорировался,
 * и все ссылки открывали один и тот же нефильтрованный список.
 */
const route = useRoute()
const validAges = ageGroups.map((g) => g.value)
const initialAge = typeof route.query.age === 'string' && validAges.includes(route.query.age)
  ? route.query.age
  : 'all'
const selectedAge = ref<string | null>(initialAge)

watch(() => route.query.age, (a) => {
  if (typeof a === 'string' && validAges.includes(a)) selectedAge.value = a
})

const { data, loading, error } = useTeamsQuery()

/** Безопасный список команд (даже если data ещё нет — пустой массив). */
const teams = computed<ReadonlyArray<Team>>(() => {
  const d = data.value as { teams?: ReadonlyArray<Team> } | null
  return d?.teams ?? []
})

/**
 * Фильтруем по ПЕРЕСЕЧЕНИЮ диапазонов, а не по совпадению строки.
 *
 * Группа «Юг школьники» охватывает 7–14 лет и раньше попадала ровно в одну
 * корзину — родитель двенадцатилетнего, выбрав «11–14», её не видел.
 * Диапазон берём из подписи возраста («7–14 лет», «10 лет»); если подписи нет
 * (в CRM у группы нет ни года рождения, ни слова «младшие»), падаем обратно
 * на строковое сравнение.
 */
function ageSpan(label: string): [number, number] | null {
  const nums = (label.match(/\d+/g) ?? []).map(Number)
  if (!nums.length) return null
  return [Math.min(...nums), Math.max(...nums)]
}

const filteredTeams = computed<ReadonlyArray<Team>>(() => {
  const sel = selectedAge.value
  if (!sel || sel === 'all') return teams.value
  const want = ageSpan(sel.replace('-', '–'))
  return teams.value.filter((t) => {
    const has = ageSpan(t.ageLabel)
    if (!has || !want) return (t.ageGroup as string) === sel
    return has[0] <= want[1] && want[0] <= has[1]
  })
})

</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="О клубе"
        title="Группы и расписание"
        description="17 групп на трёх площадках Ставрополя — Юг, Центр и 204 квартал. Три занятия в неделю. Выберите возраст, чтобы увидеть подходящие группы."
      >
        <template #action>
          <FilterChips v-model:selected="selectedAge" :items="ageGroups" />
        </template>
      </PageHeader>

      <p v-if="!loading && teams.length" class="teams-summary">
        <strong>{{ filteredTeams.length }}</strong> {{ plural(filteredTeams.length, ['группа', 'группы', 'групп']) }}
      </p>
    </section>

    <!-- Сетка команд -->
    <section class="container">
      <div v-if="loading" class="teams-grid">
        <LoadingSkeleton v-for="i in 6" :key="i" variant="block" height="320px" />
      </div>

      <div v-else-if="error" class="teams-error">
        <EmptyState
          title="Не удалось загрузить группы"
          :description="LOAD_ERROR_HINT"
          :icon="IconBall"
          variant="card"
        />
      </div>

      <div v-else-if="filteredTeams.length === 0" class="teams-empty">
        <EmptyState
          :title="selectedAge === 'all' ? 'Расписание групп ещё не опубликовано' : 'В этом возрасте свободной группы сейчас нет'"
          description="Позвоните или напишите: подберём группу по возрасту, времени и ближайшей к вам площадке."
          :icon="IconBall"
          variant="card"
        >
          <template #action>
            <BaseButton :to="SIGNUP_ROUTE" size="md" variant="solid">Записаться на пробную</BaseButton>
          </template>
        </EmptyState>
      </div>

      <div v-else class="teams-grid">
        <TeamCard
          v-for="team in filteredTeams"
          :key="team.id"
          :team="team"
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
