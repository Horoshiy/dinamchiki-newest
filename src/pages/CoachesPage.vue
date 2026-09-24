<script setup lang="ts">
/**
 * Страница «Тренеры» (`/coaches`).
 *
 * Данные из GraphQL через useCoachesQuery (с mock-fallback).
 */
import { computed, ref, watch } from 'vue'
import { plural } from '@/shared/lib/plural'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import FilterChips from '@/shared/ui/base/FilterChips.vue'
import UiCard from '@/shared/ui/base/UiCard.vue'
import CoachesGrid from '@/widgets/coach/CoachesGrid.vue'
import { useCoachesQuery } from '@/shared/api/composables'
import type { Coach, CoachAgeGroup, CoachSpec } from '@/entities/coach/coach.types'
import { COACH_SPEC_LABELS } from '@/entities/coach/coach.types'

const specOptions = computed(() => [
  { value: 'all', label: 'Все' },
  ...(Object.entries(COACH_SPEC_LABELS) as ReadonlyArray<[CoachSpec, string]>).map(
    ([value, label]) => ({ value, label }),
  ),
])

// Возрасты — по образовательным программам клуба (см. /sveden/education).
const ageOptions = [
  { value: 'all',   label: 'Все возрасты' },
  { value: '3-5',   label: '3–5 лет' },
  { value: '6-7',   label: '6–7 лет' },
  { value: '8-10',  label: '8–10 лет' },
  { value: '11-14', label: '11–14 лет' },
]

const selectedSpec = ref<string | null>('all')
const selectedAge  = ref<string | null>('all')

const { data, loading, error } = useCoachesQuery()

const coaches = computed<ReadonlyArray<Coach>>(() => {
  const d = data.value as { coaches?: ReadonlyArray<Coach> } | null
  return d?.coaches ?? []
})

/**
 * Фильтр по специализации имеет смысл, только если она у кого-то указана.
 * В реальном составе клуба амплуа не заданы, и без этой проверки посетитель
 * получал четыре чипа, каждый из которых даёт пустой список.
 */
const hasSpecializations = computed(() =>
  coaches.value.some((c) => c.specialization.length > 0),
)

const filteredCoaches = computed<ReadonlyArray<Coach>>(() => {
  return coaches.value.filter((c) => {
    const specOk =
      !selectedSpec.value ||
      selectedSpec.value === 'all' ||
      c.specialization.includes(selectedSpec.value as CoachSpec)
    const ageOk =
      !selectedAge.value ||
      selectedAge.value === 'all' ||
      c.ageGroups.includes(selectedAge.value as CoachAgeGroup)
    return specOk && ageOk
  })
})

watch(error, (e) => { if (e) console.warn('[CoachesPage]', e.message) })

// «Безопасная среда» обещала наблюдение медицинского работника — раздел
// «Сведения» на этом же сайте говорит другое: допуск по справке, аптечка,
// обученные первой помощи тренеры. Оставлена вторая, правдивая формулировка.
// «Индивидуальный подход» и «Профессиональный рост» дословно дублировали
// блок «Почему выбирают наш клуб» на главной — тот блок переписан на факты,
// здесь остаётся взгляд со стороны тренерской работы.
const principles = [
  { title: 'Индивидуальный подход', description: 'Не гонимся за «одинаковостью»: каждый ребёнок развивается в своём темпе. Тренер подбирает нагрузку под характер и физиологию.', iconKey: 'users' },
  { title: 'Образование и стаж', description: 'Тренеры-преподаватели с профильным образованием, подтверждённым документами. Стаж по специальности — от 9 до 22 лет.', iconKey: 'award' },
  { title: 'Что с безопасностью', description: 'Допуск к занятиям по медицинской справке 086-у, аптечка первой помощи на каждой площадке, все тренеры прошли обучение по оказанию первой помощи.', iconKey: 'shield' },
  { title: 'Честная конкуренция', description: 'Не делим детей на «сильных» и «слабых» по турнирной таблице. Каждый получает игровую практику и поддержку.', iconKey: 'trophy' },
] as const
</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="Команда"
        title="Наши тренеры"
        description="Тренеры-преподаватели ведут занятия по образовательным программам клуба. Стаж работы по специальности — от 9 до 22 лет."
      />
    </section>

    <section class="container">
      <div class="coaches-filters">
        <div v-if="hasSpecializations" class="coaches-filters__row">
          <span class="coaches-filters__label">Специализация</span>
          <FilterChips v-model:selected="selectedSpec" :items="specOptions" />
        </div>
        <div class="coaches-filters__row">
          <span class="coaches-filters__label">Возраст</span>
          <FilterChips v-model:selected="selectedAge" :items="ageOptions" />
        </div>
      </div>

      <p v-if="!loading && coaches.length" class="coaches-summary">
        <strong>{{ filteredCoaches.length }}</strong>
        из <strong>{{ coaches.length }}</strong> {{ plural(coaches.length, ['тренера', 'тренеров', 'тренеров']) }} в клубе
      </p>
    </section>

    <section class="container">
      <CoachesGrid :coaches="filteredCoaches" :loading="loading" :error="error" />
    </section>

    <section class="container">
      <SectionTitle eyebrow="Подход" title="Принципы нашей работы" />
      <div class="coaches-principles">
        <UiCard
          v-for="p in principles"
          :key="p.title"
          :title="p.title"
          :description="p.description"
          :icon-key="p.iconKey"
        />
      </div>
    </section>
  </PageContainer>
</template>

<style scoped lang="scss">
.coaches-filters {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  margin-bottom: $space-5;
}

.coaches-filters__row {
  display: flex;
  align-items: center;
  gap: $space-4;
  flex-wrap: wrap;
}

.coaches-filters__label {
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-fg-muted;
  font-weight: $font-weight-bold;
  min-width: 110px;
}

.coaches-summary {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  margin: 0 0 $space-5;

  strong { color: $color-brand-500; font-weight: $font-weight-bold; }
}

.coaches-principles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: $space-5;
}

@media (max-width: $bp-md) {
  .coaches-filters__row {
    align-items: flex-start;
    flex-direction: column;
    gap: $space-2;
  }
  .coaches-filters__label { min-width: auto; }
}
</style>
