<template>
  <div class="standings-wrap" :class="{ 'standings-wrap--empty': !rows.length }">
    <table v-if="rows.length" class="standings">
      <thead>
        <tr>
          <th class="standings__col-pos">#</th>
          <th class="standings__col-team">Команда</th>
          <th class="standings__col-num">И</th>
          <th class="standings__col-num">В</th>
          <th class="standings__col-num">Н</th>
          <th class="standings__col-num">П</th>
          <th class="standings__col-num">ЗБ</th>
          <th class="standings__col-num">ПР</th>
          <th v-if="showForm" class="standings__col-form">Форма</th>
          <th class="standings__col-num standings__col-points">О</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.teamId"
          class="standings__row"
          :class="{ 'standings__row--ours': row.isOurTeam }"
        >
          <td class="standings__col-pos">{{ row.position }}</td>
          <td class="standings__col-team">
            <span class="standings__team-color" :style="{ background: row.color }" aria-hidden="true" />
            <span class="standings__team-name" :title="row.teamName">{{ row.teamName }}</span>
          </td>
          <td class="standings__col-num">{{ row.played }}</td>
          <td class="standings__col-num">{{ row.wins }}</td>
          <td class="standings__col-num">{{ row.draws }}</td>
          <td class="standings__col-num">{{ row.losses }}</td>
          <td class="standings__col-num">{{ row.goalsFor }}–{{ row.goalsAgainst }}</td>
          <td class="standings__col-num">
            <span :class="['standings__gd', row.goalDiff > 0 ? 'is-pos' : row.goalDiff < 0 ? 'is-neg' : 'is-zero']">
              {{ row.goalDiff > 0 ? '+' : '' }}{{ row.goalDiff }}
            </span>
          </td>
          <td v-if="showForm" class="standings__col-form">
            <span v-for="(res, i) in row.lastFive" :key="i" :class="['standings__dot', `standings__dot--${res}`]">
              {{ res === 'win' ? 'В' : res === 'draw' ? 'Н' : 'П' }}
            </span>
          </td>
          <td class="standings__col-num standings__col-points">
            <strong>{{ row.points }}</strong>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="standings-wrap__empty">
      <p>Матчи ещё не сыграны — турнирная таблица появится после первых встреч.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Турнирная таблица.
 *
 * Раньше компонент принимал только `standings` и рендерил `row.teamName`,
 * `row.goalDiff` и `row.lastFive` — полей, которых у сущности Standing нет.
 * Колонка «Команда» на сайте была пустой, а «ПР» и «Форма» не заполнялись.
 * Страницы при этом передавали `:teams`, но проп не был объявлен и молча
 * терялся в fallthrough-атрибутах.
 */
import { computed } from 'vue'
import type {
  Standing,
  TournamentTeam,
  TournamentMatch,
} from '@/entities/tournament/tournament.types'

const props = withDefaults(
  defineProps<{
    standings: ReadonlyArray<Standing>
    teams: ReadonlyArray<TournamentTeam>
    /** Матчи нужны, чтобы посчитать колонку «Форма». Без них колонка скрыта. */
    matches?: ReadonlyArray<TournamentMatch>
  }>(),
  { matches: () => [] },
)

type MatchResult = 'win' | 'draw' | 'loss'

const teamById = computed(() => {
  const m = new Map<string, TournamentTeam>()
  for (const t of props.teams) m.set(t.id, t)
  return m
})

/** Последние пять сыгранных матчей команды, свежие — первыми. */
function lastFiveOf(teamId: string): MatchResult[] {
  return [...props.matches]
    .filter((m) => m.score !== null && (m.homeTeamId === teamId || m.awayTeamId === teamId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((m) => {
      const isHome = m.homeTeamId === teamId
      const own = isHome ? m.score!.home : m.score!.away
      const other = isHome ? m.score!.away : m.score!.home
      if (own > other) return 'win'
      if (own < other) return 'loss'
      return 'draw'
    })
}

const showForm = computed(() => props.matches.length > 0)

const rows = computed(() =>
  [...props.standings]
    .sort((a, b) => a.position - b.position)
    .map((row) => {
      const team = teamById.value.get(row.teamId)
      return {
        ...row,
        // Если команда почему-то не найдена, показываем идентификатор,
        // а не пустую ячейку: пустота выглядит как поломка вёрстки.
        teamName: team?.name ?? row.teamId,
        shortName: team?.shortName ?? '',
        isOurTeam: team?.isOurTeam ?? false,
        color: team?.color ?? 'transparent',
        goalDiff: row.goalDifference,
        lastFive: showForm.value ? lastFiveOf(row.teamId) : [],
      }
    }),
)
</script>

<style scoped lang="scss">
// Без nowrap длинные названия («Академия Кисловодск U-10») переносились
// на две строки и строки таблицы становились вдвое выше. Таблица и так
// прокручивается по горизонтали — для турнирной таблицы это привычно.
//
// nowrap нужен на самой ячейке: иначе цветная метка команды отрывалась
// от названия и уезжала на отдельную строку.
.standings__col-team {
  white-space: nowrap;
}

.standings__team-name {
  white-space: nowrap;
}

.standings__team-color {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  margin-right: $space-2;
  vertical-align: 1px;
  flex-shrink: 0;
}

.standings__row--ours {
  background: $color-brand-50;

  .standings__team-name {
    font-weight: $font-weight-bold;
    color: $color-brand-600;
  }
}

.standings-wrap {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  -webkit-overflow-scrolling: touch;

  @media (max-width: $bp-md) {
    border-radius: $radius-md;
  }

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: $color-bg-soft;
  }
  &::-webkit-scrollbar-thumb {
    background: $color-border;
    border-radius: $radius-pill;
  }
}

.standings-wrap__empty {
  padding: $space-8;
  text-align: center;
  color: $color-fg-muted;
  font-size: $font-size-sm;
}

.standings {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;

  th, td {
    padding: $space-3 $space-4;
    text-align: left;
    font-size: $font-size-sm;
  }

  thead th {
    background: $color-bg-soft;
    color: $color-fg-muted;
    font-weight: $font-weight-bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: $font-size-xs;
    border-bottom: 1px solid $color-border;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid $color-border;
    transition: background $transition-base;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: $color-bg-soft;
    }
  }
}

.standings__col-pos {
  width: 40px;
  text-align: center;
}

.standings__col-num {
  width: 48px;
  text-align: center;
}

.standings__col-form {
  width: 110px;
}

.standings__col-points {
  width: 64px;
  text-align: center;

  strong {
    font-weight: $font-weight-bold;
    color: $color-brand-500;
    font-size: $font-size-base;
  }
}

.standings__team-name {
  font-weight: $font-weight-semibold;
  color: $color-fg;
}

.standings__gd {
  display: inline-block;
  padding: 2px 6px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;

  &.is-pos {
    color: $color-success-fg;
    background: $color-success-bg;
  }
  &.is-neg {
    color: $color-error-fg;
    background: $color-error-bg;
  }
  &.is-zero {
    color: $color-fg-muted;
    background: $color-bg-soft;
  }
}

.standings__dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 2px;
  border-radius: $radius-sm;
  font-size: 11px;
  font-weight: $font-weight-bold;

  &--win {
    color: $color-success-fg;
    background: $color-success-bg;
  }
  &--draw {
    color: $color-warning-fg;
    background: $color-warning-bg;
  }
  &--loss {
    color: $color-error-fg;
    background: $color-error-bg;
  }
}
</style>
