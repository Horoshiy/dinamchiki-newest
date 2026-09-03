<script setup lang="ts">
/**
 * Секция «Турниры и результаты» на главной.
 *
 * По мокапу (скрин 6): 3-колоночный блок:
 *   1) Текущий турнир (большой с бейджем «ИДЁТ СЕЙЧАС»)
 *   2) Турнирная таблица (топ-5, колонки И/В/Н/П/О)
 *   3) Последние матчи (результаты)
 *
 * Данные приходят из слоя api (useCurrentTournamentQuery), а не из литералов
 * в этом файле — иначе главная жила бы своей жизнью и расходилась
 * со страницей /tournaments.
 */
import { computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconShieldCheck from '@/shared/ui/icons/IconShieldCheck.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import { useCurrentTournamentQuery } from '@/shared/api/composables'
import { formatRange, formatDay } from '@/shared/lib/date'
import type { Tournament } from '@/entities/tournament/tournament.types'

/** Сколько строк таблицы и матчей показываем в превью. */
const TABLE_LIMIT = 5
const MATCHES_LIMIT = 4

const { data, loading, error } = useCurrentTournamentQuery()

watch(error, (e) => { if (e) console.warn('[HomeTournamentsPreview]', e.message) })

const tournament = computed<Tournament | null>(() => {
  const d = data.value as { currentTournament?: Tournament | null } | null
  return d?.currentTournament ?? null
})

const dateRange = computed(() =>
  tournament.value ? formatRange(tournament.value.startDate, tournament.value.endDate) : '',
)

/** Имя команды по id — таблица и матчи хранят только teamId. */
const teamNameById = computed(() => {
  const m = new Map<string, string>()
  for (const t of tournament.value?.teams ?? []) m.set(t.id, t.name)
  return m
})

const tableRows = computed(() =>
  [...(tournament.value?.standings ?? [])]
    .sort((a, b) => a.position - b.position)
    .slice(0, TABLE_LIMIT)
    .map((row) => ({
      pos: row.position,
      team: teamNameById.value.get(row.teamId) ?? row.teamId,
      played: row.played,
      won: row.wins,
      drawn: row.draws,
      lost: row.losses,
      points: row.points,
    })),
)

const recentMatches = computed(() =>
  [...(tournament.value?.matches ?? [])]
    .filter((m) => m.score !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MATCHES_LIMIT)
    .map((m) => ({
      id: m.id,
      date: formatDay(m.date),
      home: teamNameById.value.get(m.homeTeamId) ?? m.homeTeamId,
      away: teamNameById.value.get(m.awayTeamId) ?? m.awayTeamId,
      score: `${m.score!.home} : ${m.score!.away}`,
    })),
)
</script>

<template>
  <section class="tournaments-preview">
    <div class="container">
      <SectionTitle
        eyebrow="Соревнования"
        title="Турниры и результаты"
      >
        <template #action>
          <BaseButton variant="outline" size="md" :icon-right="IconArrowRight" :to="'/tournaments'">
            Все турниры
          </BaseButton>
        </template>
      </SectionTitle>

      <!-- Загрузка -->
      <div v-if="loading" class="tournaments-preview__grid">
        <LoadingSkeleton v-for="i in 3" :key="i" variant="block" height="320px" />
      </div>

      <!-- Идущего турнира нет — секция не выдумывает данные -->
      <p v-else-if="!tournament" class="tournaments-preview__empty">
        Сейчас активных турниров нет.
        <RouterLink to="/tournaments">Посмотреть календарь и архив</RouterLink>
      </p>

      <div v-else class="tournaments-preview__grid">
        <!-- 1) Текущий турнир -->
        <article class="tournament">
          <p class="tournament__badge">
            <span class="tournament__badge-dot" /> Идёт сейчас
          </p>
          <h3 class="tournament__title">
            <IconTrophy :size="22" />
            {{ tournament.name }}
          </h3>
          <ul class="tournament__meta">
            <li><IconCalendar :size="16" /> {{ dateRange }}</li>
            <li><IconShieldCheck :size="16" /> {{ tournament.venue }}</li>
          </ul>
          <p class="tournament__desc">{{ tournament.description }}</p>
          <BaseButton :to="`/tournament/${tournament.id}`" size="md" variant="solid" :icon-right="IconArrowRight">
            Подробнее о турнире
          </BaseButton>
        </article>

        <!-- 2) Турнирная таблица -->
        <article class="table-card">
          <h3 class="table-card__title">
            <IconShieldCheck :size="20" />
            Турнирная таблица
          </h3>
          <div class="table-card__scroll">
            <table v-if="tableRows.length" class="standings">
              <thead>
                <tr>
                  <th class="standings__pos">#</th>
                  <th class="standings__team">Команда</th>
                  <th>И</th>
                  <th>В</th>
                  <th>Н</th>
                  <th>П</th>
                  <th class="standings__pts">О</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableRows" :key="row.pos">
                  <td class="standings__pos">{{ row.pos }}</td>
                  <td class="standings__team">{{ row.team }}</td>
                  <td>{{ row.played }}</td>
                  <td>{{ row.won }}</td>
                  <td>{{ row.drawn }}</td>
                  <td>{{ row.lost }}</td>
                  <td class="standings__pts"><strong>{{ row.points }}</strong></td>
                </tr>
              </tbody>
            </table>
            <p v-else class="table-card__empty">Таблица появится после первых матчей.</p>
          </div>
          <RouterLink :to="`/tournament/${tournament.id}`" class="table-card__link">
            Полная таблица
            <IconArrowRight :size="14" />
          </RouterLink>
        </article>

        <!-- 3) Последние матчи -->
        <article class="matches-card">
          <h3 class="matches-card__title">
            <IconBall :size="20" />
            Последние матчи
          </h3>
          <ul v-if="recentMatches.length" class="matches">
            <li v-for="m in recentMatches" :key="m.id" class="match">
              <span class="match__date">{{ m.date }}</span>
              <div class="match__teams">
                <span class="match__team">{{ m.home }}</span>
                <span class="match__score">{{ m.score }}</span>
                <span class="match__team">{{ m.away }}</span>
              </div>
            </li>
          </ul>
          <p v-else class="table-card__empty">Сыгранных матчей пока нет.</p>
          <RouterLink :to="`/tournament/${tournament.id}`" class="table-card__link">
            Все результаты
            <IconArrowRight :size="14" />
          </RouterLink>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.tournaments-preview {
  padding: $space-16 0;
  background: $color-bg-soft;
}

.tournaments-preview__empty {
  padding: $space-10;
  text-align: center;
  color: $color-fg-muted;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;

  a {
    color: $color-link;
    font-weight: $font-weight-semibold;
  }
}

.table-card__empty {
  padding: $space-6 0;
  text-align: center;
  color: $color-fg-muted;
  font-size: $font-size-sm;
}

.tournaments-preview__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr) minmax(0, 1fr);
  gap: $space-5;

  @media (max-width: $bp-lg) {
    // minmax(0, …) обязателен: иначе таблица с длинными названиями команд
    // задаёт колонке min-content и распирает страницу за пределы вьюпорта.
    grid-template-columns: minmax(0, 1fr);
  }
}

// ---- Карточка «Текущий турнир» -----------------------------------------
.tournament {
  min-width: 0;
  padding: $space-6;
  background: $color-white;
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  gap: $space-4;
  box-shadow: $shadow-sm;
}

.tournament__badge {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  align-self: flex-start;
  padding: $space-1 $space-3;
  background: $color-brand-50;
  color: $color-brand-700;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.tournament__badge-dot {
  width: 8px;
  height: 8px;
  background: $color-brand-500;
  border-radius: 50%;
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.tournament__title {
  display: inline-flex;
  align-items: center;
  gap: $space-3;
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  color: $color-brand-500;
}

.tournament__meta {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-sm;
    color: $color-fg-muted;
  }
}

.tournament__desc {
  font-size: $font-size-sm;
  color: $color-fg;
  line-height: $line-height-base;
  margin: 0;
  flex: 1;
}

// ---- Турнирная таблица --------------------------------------------------
.table-card,
.matches-card {
  padding: $space-6;
  background: $color-white;
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  gap: $space-4;
  box-shadow: $shadow-sm;
}

.table-card__title,
.matches-card__title {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
}

.table-card__scroll {
  overflow-x: auto;
  min-width: 0;
  margin: 0 (-$space-4);
  padding: 0 $space-4;
  -webkit-overflow-scrolling: touch;
}

.standings__team {
  // Длинные названия соперников не должны растягивать таблицу.
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standings {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;

  th, td {
    padding: $space-2 $space-2;
    text-align: center;
    border-bottom: 1px solid $color-border;
  }

  th {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-fg-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tbody tr:last-child td { border-bottom: none; }
}

.standings__pos {
  width: 32px;
  color: $color-brand-500;
  font-weight: $font-weight-bold;
}

.standings__team {
  text-align: left;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
  white-space: nowrap;
}

.standings__pts {
  color: $color-brand-500;

  strong { font-weight: $font-weight-extrabold; font-size: $font-size-base; }
}

.table-card__link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  margin-top: auto;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
  text-decoration: none;
  align-self: flex-start;

  &:hover { color: $color-brand-600; }
}

// ---- Последние матчи ----------------------------------------------------
.matches {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin: 0;
  padding: 0;
  list-style: none;
}

.match {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  padding: $space-3;
  background: $color-bg-soft;
  border-radius: $radius-md;
}

.match__date {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: $font-weight-semibold;
}

.match__teams {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex: 1;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.match__team {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
}

.match__score {
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: $font-size-md;
  color: $color-brand-500;
  padding: 0 $space-3;
  background: $color-white;
  border-radius: $radius-md;
}
</style>
