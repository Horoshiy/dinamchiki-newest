<script setup lang="ts">
/**
 * Страница «Турниры» (`/tournaments`).
 *
 * Данные из GraphQL через useCurrent/Upcoming/FinishedTournamentQuery.
 */
import { computed, watch } from 'vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import { SIGNUP_ROUTE } from '@/shared/config/club'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import TournamentCard from '@/widgets/tournament/TournamentCard.vue'
import StandingsTable from '@/widgets/tournament/StandingsTable.vue'
import MatchesList from '@/widgets/tournament/MatchesList.vue'
import TournamentArchive from '@/widgets/tournament/TournamentArchive.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import {
  useCurrentTournamentQuery,
  useUpcomingTournamentsQuery,
  useFinishedTournamentsQuery,
} from '@/shared/api/composables'
import type { Tournament } from '@/entities/tournament/tournament.types'

const { data: curData,   loading: curLoading,   error: curError   } = useCurrentTournamentQuery()
const { data: upData,    loading: upLoading,    error: upError    } = useUpcomingTournamentsQuery()
const { data: finData,   loading: finLoading,   error: finError   } = useFinishedTournamentsQuery()

const loading = computed(() => curLoading.value || upLoading.value || finLoading.value)
const error   = computed<Error | null>(() => curError.value ?? upError.value ?? finError.value)

const currentTournament = computed<Tournament | null>(() => {
  const d = curData.value as { currentTournament?: Tournament | null } | null
  return d?.currentTournament ?? null
})

const upcomingTournaments = computed<ReadonlyArray<Tournament>>(() => {
  const d = upData.value as { upcomingTournaments?: ReadonlyArray<Tournament> } | null
  return d?.upcomingTournaments ?? []
})

const finishedTournaments = computed<ReadonlyArray<Tournament>>(() => {
  const d = finData.value as { finishedTournaments?: ReadonlyArray<Tournament> } | null
  return d?.finishedTournaments ?? []
})

const totalTeamsCount = computed(() => currentTournament.value?.teamsCount ?? 0)

/** Ни текущего, ни предстоящих, ни завершённых — страница пуста целиком. */
const upcomingMatches = computed(() => currentTournament.value?.matches.filter((m) => !m.score) ?? [])
const playedMatches = computed(() => currentTournament.value?.matches.filter((m) => m.score) ?? [])

const isEmpty = computed(() =>
  !currentTournament.value &&
  upcomingTournaments.value.length === 0 &&
  finishedTournaments.value.length === 0,
)

// «Титулы» и «медали» были захардкожены (1 и 2) и не следовали ни из каких
// данных — плитки убраны из вёрстки, считаем только то, что реально знаем.
const clubStats = computed(() => {
  const finished = finishedTournaments.value
  return {
    totalTournaments: finished.length,
  }
})

watch(error, (e) => { if (e) console.warn('[TournamentsPage]', e.message) })
</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="Соревнования"
        title="Турниры и матчи"
        description="Турниры, в которых играют команды клуба: расписание матчей, положение в группе и результаты."
      />
    </section>

    <!-- Loading state -->
    <section v-if="loading" class="container">
      <LoadingSkeleton variant="block" height="320px" />
    </section>

    <!-- Error -->
    <section v-else-if="error" class="container">
      <EmptyState
        title="Не удалось загрузить турниры"
        :description="error.message"
        :icon="IconTrophy"
        variant="card"
      />
    </section>

    <!-- Турниров нет вовсе: показываем одно честное состояние вместо
         пустых секций и «Итогов» с нулями. -->
    <section v-else-if="isEmpty" class="container">
      <EmptyState
        title="Турнирная таблица ещё не опубликована"
        description="Клуб играет товарищеские матчи и внутренние турниры; результаты появятся здесь, как только мы их сведём. Победителей региональных соревнований награждаем медалями и кубками."
        :icon="IconTrophy"
        variant="card"
      >
        <template #action>
          <BaseButton :to="SIGNUP_ROUTE" size="md" variant="solid">Записаться на пробную</BaseButton>
        </template>
      </EmptyState>
    </section>

    <template v-else>
      <!-- Текущий турнир -->
      <section v-if="currentTournament" class="container">
        <SectionTitle eyebrow="Сейчас идёт" title="Текущий турнир" />
        <TournamentCard :tournament="currentTournament" />
      </section>

      <!-- Таблица + последние матчи -->
      <section v-if="currentTournament && currentTournament.standings.length" class="container">
        <div class="tournaments-grid">
          <div>
            <SectionTitle eyebrow="Таблица" title="Положение команд" />
            <StandingsTable
              :standings="currentTournament.standings"
              :teams="currentTournament.teams"
              :matches="currentTournament.matches"
            />
          </div>
          <div>
            <template v-if="upcomingMatches.length">
              <SectionTitle eyebrow="Календарь" title="Расписание матчей" />
              <MatchesList
                :matches="currentTournament.matches"
                :teams="currentTournament.teams"
                :limit="8"
                filter="upcoming"
              />
            </template>

            <template v-if="playedMatches.length">
              <SectionTitle
                eyebrow="Результаты"
                title="Сыгранные матчи"
                :class="{ 'tournaments-second-title': upcomingMatches.length }"
              />
              <MatchesList
                :matches="currentTournament.matches"
                :teams="currentTournament.teams"
                :limit="6"
                filter="played"
              />
            </template>
          </div>
        </div>
      </section>

      <!-- Предстоящие турниры -->
      <section v-if="upcomingTournaments.length" class="container">
        <SectionTitle eyebrow="Календарь" title="Предстоящие турниры" />
        <div class="tournaments-upcoming">
          <div
            v-for="t in upcomingTournaments"
            :key="t.id"
            class="tournaments-upcoming__card"
          >
            <div class="tournaments-upcoming__head">
              <IconCalendar :size="20" />
              <span>{{ new Date(t.startDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }) }}</span>
            </div>
            <h3 class="tournaments-upcoming__name">{{ t.name }}</h3>
            <p class="tournaments-upcoming__age">{{ t.ageGroup }} · {{ t.teamsCount }} команд</p>
            <p class="tournaments-upcoming__desc">{{ t.description }}</p>
          </div>
        </div>
      </section>

      <!-- Статистика клуба -->
      <section class="container">
        <SectionTitle eyebrow="Итоги" title="Статистика клуба в турнирах" />
        <div class="tournaments-stats">
          <div class="tournaments-stats__item">
            <strong class="tournaments-stats__num">{{ clubStats.totalTournaments }}</strong>
            <span class="tournaments-stats__label">турниров в архиве</span>
          </div>
          <div class="tournaments-stats__item">
            <strong class="tournaments-stats__num">{{ totalTeamsCount }}</strong>
            <span class="tournaments-stats__label">команд в текущем турнире</span>
          </div>
        </div>
      </section>

      <!-- Архив -->
      <section v-if="finishedTournaments.length" class="container">
        <SectionTitle eyebrow="История" title="Архив турниров" />
        <TournamentArchive :tournaments="finishedTournaments" />
      </section>
    </template>
  </PageContainer>
</template>

<style scoped lang="scss">
.tournaments-second-title {
  margin-top: $space-10;
}

.tournaments-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: $space-8;
  align-items: flex-start;

  > * {
    min-width: 0;
  }

  @media (max-width: $bp-lg) {
    grid-template-columns: minmax(0, 1fr);
    gap: $space-10;
  }
}

.tournaments-upcoming {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: $space-5;
}

.tournaments-upcoming__card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-6;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  border-left: 4px solid $color-brand-500;
}

.tournaments-upcoming__head {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
}

.tournaments-upcoming__name {
  font-family: $font-family-display;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.01em;
}

.tournaments-upcoming__age {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: $font-weight-semibold;
}

.tournaments-upcoming__desc {
  font-size: $font-size-sm;
  color: $color-fg;
  line-height: $line-height-base;
  margin: $space-2 0 0;
}

.tournaments-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: $space-5;
  padding: $space-8;
  background: linear-gradient(135deg, rgba(30, 80, 216, 0.04) 0%, rgba(81, 128, 244, 0.02) 100%);
  border-radius: $radius-xl;
  border: 1px solid $color-border;
}

.tournaments-stats__item {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  align-items: flex-start;
}

.tournaments-stats__num {
  font-family: $font-family-display;
  font-size: clamp(2.5rem, 5vw, 3.25rem);
  font-weight: $font-weight-extrabold;
  color: $color-brand-500;
  line-height: 1;
  letter-spacing: -0.02em;
}

.tournaments-stats__label {
  font-size: $font-size-sm;
  color: $color-fg-muted;
}
</style>
