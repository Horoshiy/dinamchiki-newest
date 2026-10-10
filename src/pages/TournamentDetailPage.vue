<script setup lang="ts">
/**
 * Детальная страница турнира (`/tournament/:id`).
 */
import { computed, ref, toRef } from 'vue'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/shared/ui/base/Breadcrumbs.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import StandingsTable from '@/widgets/tournament/StandingsTable.vue'
import MatchesList from '@/widgets/tournament/MatchesList.vue'
import PlayerCard from '@/widgets/player/PlayerCard.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconLocation from '@/shared/ui/icons/IconLocation.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import {
  TOURNAMENT_STATUS_LABELS,
  TOURNAMENT_STATUS_COLORS,
} from '@/entities/tournament/tournament.types'
import type { Tournament } from '@/entities/tournament/tournament.types'
import { useTournamentQuery, usePlayersQuery } from '@/shared/api/composables'
import type { Player } from '@/entities/player/player.types'
import { LOAD_ERROR_HINT } from '@/shared/config/club'
import { NOT_FOUND_META, usePageMeta } from '@/shared/lib/page-meta'
import { formatRangeFull } from '@/shared/lib/date'
import { withPlural } from '@/shared/lib/plural'

const props = defineProps<{ id: string }>()

const idRef = toRef(props, 'id')
const { data, loading, error } = useTournamentQuery(idRef)

const tournament = computed<Tournament | null>(() => {
  const d = data.value as { tournament?: Tournament | null } | null
  return d?.tournament ?? null
})

/**
 * Составы команд (этап 7 ТЗ).
 *
 * Состав есть только у команд клуба — по соперникам из других клубов
 * данных нет и выдумывать их незачем. Выбранная команда переключается
 * чипами; по умолчанию — первая наша команда в турнире.
 */
const ourTeams = computed(() => (tournament.value?.teams ?? []).filter((t) => t.isOurTeam))

const selectedRosterTeamId = ref<string | null>(null)

const activeRosterTeamId = computed<string>(
  () => selectedRosterTeamId.value ?? ourTeams.value[0]?.id ?? '',
)

const { data: rosterData, loading: rosterLoading } = usePlayersQuery(activeRosterTeamId)

const roster = computed<ReadonlyArray<Player>>(() => {
  if (!activeRosterTeamId.value) return []
  const d = rosterData.value as { players?: ReadonlyArray<Player> } | null
  return d?.players ?? []
})

/**
 * Архивный турнир может храниться одной сводкой, без разбора по командам,
 * матчам и таблице. Тогда страница состояла из одного hero и выглядела
 * сломанной — показываем явное объяснение.
 */
const hasDetails = computed(() => {
  const t = tournament.value
  if (!t) return false
  return t.teams.length > 0 || t.matches.length > 0 || t.standings.length > 0
})

const crumbs = computed(() => [
  { label: 'Главная',   to: '/' },
  { label: 'Турниры',   to: '/tournaments' },
  { label: tournament.value?.name ?? '…' },
])

const statusLabel = computed(() => tournament.value ? TOURNAMENT_STATUS_LABELS[tournament.value.status] : '')
const statusColor = computed(() => tournament.value ? TOURNAMENT_STATUS_COLORS[tournament.value.status] : '#5180f4')

const dateRange = computed(() =>
  tournament.value ? formatRangeFull(tournament.value.startDate, tournament.value.endDate) : '',
)

// Без своей меты у всех турниров был одинаковый заголовок «Турнир».
usePageMeta(() => {
  if (loading.value) return null
  const t = tournament.value
  if (!t) return NOT_FOUND_META
  return {
    title: `${t.name} — турнир с участием «Динамчиков»`,
    description: `${t.name}: ${dateRange.value}${t.venue ? `, ${t.venue}` : ''}. Команды, матчи и таблица турнира.`,
  }
})

const playedMatches = computed(() =>
  (tournament.value?.matches ?? []).filter((m) => m.score !== null),
)
const upcomingMatches = computed(() =>
  (tournament.value?.matches ?? []).filter((m) => m.score === null),
)
</script>

<template>
  <div class="tournament-detail">
    <section class="container">
      <Breadcrumbs :items="crumbs" />
    </section>

    <section v-if="loading" class="container">
      <LoadingSkeleton variant="block" height="320px" />
    </section>

    <section v-else-if="error" class="container">
      <EmptyState
        title="Не удалось загрузить турнир"
        :description="LOAD_ERROR_HINT"
        :icon="IconBall"
        variant="card"
      />
    </section>

    <section v-else-if="!tournament" class="container">
      <EmptyState
        title="Турнир не найден"
        :description="`Турнира с id «${props.id}» нет в базе.`"
        :icon="IconBall"
        variant="card"
      >
        <template #action>
          <RouterLink to="/tournaments" custom v-slot="{ navigate }">
            <BaseButton variant="outline" :icon-left="IconArrowRight" @click="navigate">
              Все турниры
            </BaseButton>
          </RouterLink>
        </template>
      </EmptyState>
    </section>

    <template v-else>
      <!-- Hero -->
      <section
        class="container tournament-detail__hero"
        :style="{ '--status-color': statusColor }"
      >
        <div class="tournament-detail__hero-head">
          <span class="tournament-detail__status">{{ statusLabel }}</span>
          <span v-if="tournament.ageGroup" class="tournament-detail__age">{{ tournament.ageGroup }}</span>
        </div>
        <h1 class="tournament-detail__name">
          <IconTrophy :size="40" />
          {{ tournament.name }}
        </h1>
        <p class="tournament-detail__desc">{{ tournament.description }}</p>

        <dl class="tournament-detail__meta">
          <div class="meta-item">
            <dt><IconCalendar :size="16" /> Даты</dt>
            <dd>{{ dateRange }}</dd>
          </div>
          <div class="meta-item">
            <dt><IconLocation :size="16" /> Место</dt>
            <dd>{{ tournament.venue }}</dd>
          </div>
          <div class="meta-item">
            <dt><IconTrophy :size="16" /> Призовой фонд</dt>
            <dd>{{ tournament.prizeFund }}</dd>
          </div>
          <div class="meta-item">
            <dt><IconTrophy :size="16" /> Команд</dt>
            <dd>{{ tournament.teamsCount }}</dd>
          </div>
        </dl>
      </section>

      <!-- Турнирная таблица -->
      <section v-if="tournament.standings.length" class="container">
        <SectionTitle eyebrow="Таблица" title="Положение команд" />
        <StandingsTable
          :standings="tournament.standings"
          :teams="tournament.teams"
          :matches="tournament.matches"
        />
      </section>

      <!-- Сыгранные матчи -->
      <section v-if="playedMatches.length" class="container">
        <SectionTitle eyebrow="Результаты" :title="`Сыгранные матчи (${playedMatches.length})`" />
        <MatchesList :matches="playedMatches" :teams="tournament.teams" />
      </section>

      <!-- Предстоящие матчи -->
      <section v-if="upcomingMatches.length" class="container">
        <SectionTitle eyebrow="Календарь" :title="`Предстоящие матчи (${upcomingMatches.length})`" />
        <MatchesList :matches="upcomingMatches" :teams="tournament.teams" />
      </section>

      <!-- Архивная запись без детализации -->
      <section v-if="!hasDetails" class="container">
        <EmptyState
          title="Подробности турнира не сохранились"
          :description="`По турниру «${tournament.name}» в архиве осталась только общая информация: ${withPlural(tournament.teamsCount, ['команда', 'команды', 'команд'])}, ${tournament.venue}.`"
        />
      </section>

      <!-- Составы команд клуба -->
      <section v-if="ourTeams.length" class="container">
        <SectionTitle eyebrow="Составы" title="Наши игроки в турнире" />

        <div v-if="ourTeams.length > 1" class="tournament-detail__roster-tabs">
          <button
            v-for="t in ourTeams"
            :key="t.id"
            type="button"
            class="tournament-detail__roster-tab"
            :class="{ 'is-active': t.id === activeRosterTeamId }"
            @click="selectedRosterTeamId = t.id"
          >
            {{ t.name }}
          </button>
        </div>

        <div v-if="rosterLoading" class="tournament-detail__roster">
          <LoadingSkeleton v-for="i in 4" :key="i" variant="block" height="220px" />
        </div>

        <ul v-else-if="roster.length" class="tournament-detail__roster">
          <li v-for="player in roster" :key="player.id">
            <PlayerCard :player="player" />
          </li>
        </ul>

        <EmptyState
          v-else
          title="Состав не опубликован"
          description="Заявка команды на этот турнир появится ближе к первому матчу."
        />
      </section>

      <!-- Участники -->
      <section v-if="tournament.teams.length" class="container">
        <SectionTitle eyebrow="Участники" :title="`Команды-участницы (${tournament.teamsCount})`" />
        <div class="tournament-detail__teams">
          <div
            v-for="t in tournament.teams"
            :key="t.id"
            class="tournament-detail__team-card"
            :class="{ 'tournament-detail__team-card--ours': t.isOurTeam }"
            :style="{ '--team-color': t.color }"
          >
            <span class="tournament-detail__team-color" />
            <div class="tournament-detail__team-body">
              <strong class="tournament-detail__team-name">{{ t.name }}</strong>
              <span v-if="t.isOurTeam" class="tournament-detail__team-badge">Наша команда</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.tournament-detail__roster {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-5;
  list-style: none;
  padding: 0;
  margin: 0;

  @media (max-width: $bp-lg) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: $bp-md) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: $bp-sm) { grid-template-columns: 1fr; }
}

.tournament-detail__roster-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin-bottom: $space-5;
}

.tournament-detail__roster-tab {
  padding: $space-2 $space-4;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-pill;
  color: $color-fg;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: background $transition-base, border-color $transition-base, color $transition-base;

  &:hover { border-color: $color-brand-400; }

  &:focus-visible {
    outline: 2px solid $color-brand-500;
    outline-offset: 2px;
  }

  &.is-active {
    background: $color-brand-500;
    border-color: $color-brand-500;
    color: $color-white;
  }
}

.tournament-detail {
  display: flex;
  flex-direction: column;
  gap: $space-12;
  padding: $space-6 0 $space-16;
}

.tournament-detail__hero {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-10;
  background: linear-gradient(135deg, $color-brand-600 0%, $color-brand-700 100%);
  border-radius: $radius-xl;
  color: $color-white;
  position: relative;
  overflow: hidden;
  box-shadow: $shadow-md;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 4px;
    background: var(--status-color);
  }
}

.tournament-detail__hero-head {
  display: flex; flex-wrap: wrap; gap: $space-2;
}

.tournament-detail__status {
  display: inline-block;
  padding: $space-1 $space-4;
  background: var(--status-color);
  color: $color-white;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tournament-detail__age {
  display: inline-block;
  padding: $space-1 $space-4;
  background: rgba(255, 255, 255, 0.15);
  color: $color-white;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
}

.tournament-detail__name {
  display: flex;
  align-items: center;
  gap: $space-3;
  font-family: $font-family-display;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: $font-weight-extrabold;
  color: $color-white;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.tournament-detail__desc {
  font-size: $font-size-md;
  color: rgba(255, 255, 255, 0.85);
  line-height: $line-height-base;
  margin: 0;
  max-width: 70ch;
}

.tournament-detail__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: $space-4;
  margin: 0;
  padding-top: $space-4;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: $space-1;

  dt {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: $font-weight-semibold;
  }

  dd {
    margin: 0;
    font-size: $font-size-sm;
    color: $color-white;
    font-weight: $font-weight-semibold;
  }
}

.tournament-detail__teams {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: $space-4;
}

.tournament-detail__team-card {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-5;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  color: inherit;
}

/** Свою команду выделяем рамкой — раньше её отличал только бейдж. */
.tournament-detail__team-card--ours {
  border-color: $color-brand-500;
  box-shadow: $shadow-sm;
}

.tournament-detail__team-color {
  width: 8px;
  align-self: stretch;
  background: var(--team-color);
  border-radius: 4px;
  flex-shrink: 0;
}

.tournament-detail__team-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $space-2;
  // minmax(0) по вертикали не нужен, а вот min-width: 0 обязателен:
  // без него длинное название распирает флекс-контейнер карточки.
  min-width: 0;
  flex: 1;
}

.tournament-detail__team-name {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.tournament-detail__team-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 2px $space-2;
  background: rgba(30, 80, 216, 0.1);
  color: $color-brand-500;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

</style>
