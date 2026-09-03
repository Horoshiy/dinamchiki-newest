<script setup lang="ts">
/**
 * Список матчей турнира.
 *
 * Разделён на «Сыгранные» (с финальным счётом) и «Предстоящие» (со временем).
 * Команды клуба подсвечиваются брендовым цветом.
 */
import { computed } from 'vue'
import type { TournamentMatch, TournamentTeam, MatchKind } from '@/entities/tournament/tournament.types'
import { MATCH_KIND_LABELS } from '@/entities/tournament/tournament.types'
import IconClock from '@/shared/ui/icons/IconClock.vue'
import IconLocation from '@/shared/ui/icons/IconLocation.vue'

const props = defineProps<{
  matches: ReadonlyArray<TournamentMatch>
  teams: ReadonlyArray<TournamentTeam>
  /** Сколько матчей показывать (по умолчанию 6) */
  limit?: number
  /** Фильтр: 'all' | 'played' | 'upcoming' */
  filter?: 'all' | 'played' | 'upcoming'
}>()

const teamsById = computed(() => {
  const m = new Map<string, TournamentTeam>()
  for (const t of props.teams) m.set(t.id, t)
  return m
})

function teamOf(id: string): TournamentTeam | undefined {
  return teamsById.value.get(id)
}

const visibleMatches = computed<ReadonlyArray<TournamentMatch>>(() => {
  let list = [...props.matches]
  if (props.filter === 'played') {
    list = list.filter((m) => m.score !== null)
  } else if (props.filter === 'upcoming') {
    list = list.filter((m) => m.score === null)
  }
  // Сортировка: сыгранные — свежие сверху; предстоящие — ближайшие сверху
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (props.limit) list = list.slice(0, props.limit)
  return list
})

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}
function fmtTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

/** Цвет бейджа типа матча. */
function kindColor(k: MatchKind): string {
  switch (k) {
    case 'group':   return '#5180f4'
    case 'quarter': return '#7c3aed'
    case 'semi':    return '#ca8a04'
    case 'final':   return '#dc2626'
  }
}
</script>

<template>
  <ul class="matches">
    <li
      v-for="m in visibleMatches"
      :key="m.id"
      class="matches__row"
      :class="{ 'matches__row--upcoming': m.score === null }"
    >
      <div class="matches__meta">
        <span
          class="matches__kind"
          :style="{ background: kindColor(m.kind) + '20', color: kindColor(m.kind) }"
        >
          {{ MATCH_KIND_LABELS[m.kind] }}
        </span>
        <div class="matches__when">
          <IconClock :size="14" />
          <span>{{ fmtDate(m.date) }}, {{ fmtTime(m.date) }}</span>
        </div>
        <div class="matches__venue">
          <IconLocation :size="14" />
          <span>{{ m.venue }}</span>
        </div>
      </div>

      <div class="matches__teams">
        <div class="matches__team matches__team--home">
          <span
            class="matches__team-color"
            :style="{ background: teamOf(m.homeTeamId)?.color ?? '#d8dde6' }"
          />
          <span
            class="matches__team-name"
            :class="{ 'matches__team-name--ours': teamOf(m.homeTeamId)?.isOurTeam }"
          >
            {{ teamOf(m.homeTeamId)?.shortName ?? m.homeTeamId }}
          </span>
        </div>

        <div class="matches__score">
          <template v-if="m.score">
            <strong>{{ m.score.home }}</strong>
            <span>:</span>
            <strong>{{ m.score.away }}</strong>
          </template>
          <template v-else>
            <span class="matches__vs">VS</span>
          </template>
        </div>

        <div class="matches__team matches__team--away">
          <span
            class="matches__team-name"
            :class="{ 'matches__team-name--ours': teamOf(m.awayTeamId)?.isOurTeam }"
          >
            {{ teamOf(m.awayTeamId)?.shortName ?? m.awayTeamId }}
          </span>
          <span
            class="matches__team-color"
            :style="{ background: teamOf(m.awayTeamId)?.color ?? '#d8dde6' }"
          />
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.matches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.matches__row {
  display: grid;
  grid-template-columns: minmax(200px, 280px) 1fr;
  gap: $space-5;
  padding: $space-4 $space-5;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  align-items: center;
  transition: box-shadow $transition-base, border-color $transition-base;

  &:hover {
    box-shadow: $shadow-sm;
    border-color: $color-border-strong;
  }

  @media (max-width: $bp-md) {
    grid-template-columns: 1fr;
    gap: $space-3;
  }
}

// Колонка заставляла бейдж, дату и площадку занимать три строки подряд.
// Ряд с переносом ставит их в одну строку, а на узком экране переносит
// только то, что действительно не влезло.
.matches__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-2 $space-3;
}

.matches__kind {
  align-self: flex-start;
  display: inline-block;
  padding: 2px $space-3;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.matches__when,
.matches__venue {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-xs;
  color: $color-fg-muted;
  min-width: 0;

  span {
    overflow-wrap: anywhere;
  }
}

.matches__teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: $space-3;
  align-items: center;
}

.matches__team {
  display: flex;
  align-items: center;
  gap: $space-2;

  &--home { justify-content: flex-end; }
  &--away { justify-content: flex-start; }
}

.matches__team-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.matches__team-name {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg;
  letter-spacing: 0.02em;

  &--ours {
    color: $color-brand-500;
  }
}

.matches__score {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  background: $color-bg-soft;
  border-radius: $radius-md;
  font-family: $font-family-display;

  strong {
    font-size: $font-size-lg;
    font-weight: $font-weight-extrabold;
    color: $color-fg-strong;
    min-width: 24px;
    text-align: center;
  }

  span {
    color: $color-fg-muted;
    font-size: $font-size-md;
  }
}

.matches__vs {
  font-family: $font-family-display;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-fg-muted;
  letter-spacing: 0.06em;
}

.matches__row--upcoming {
  border-left: 3px solid $color-brand-500;
}
</style>
