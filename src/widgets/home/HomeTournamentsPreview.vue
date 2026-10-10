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
import { computed} from 'vue'
import { RouterLink } from 'vue-router'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconShieldCheck from '@/shared/ui/icons/IconShieldCheck.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import StandingsTable from '@/widgets/tournament/StandingsTable.vue'
import { useCurrentTournamentQuery } from '@/shared/api/composables'
import { formatRange, formatDay, formatTime } from '@/shared/lib/date'
import type { Tournament } from '@/entities/tournament/tournament.types'

/** Сколько строк таблицы и матчей показываем в превью. */
const TABLE_LIMIT = 5
const MATCHES_LIMIT = 4

const { data, loading, error } = useCurrentTournamentQuery()

const tournament = computed<Tournament | null>(() => {
  const d = data.value as { currentTournament?: Tournament | null } | null
  return d?.currentTournament ?? null
})

const dateRange = computed(() =>
  tournament.value ? formatRange(tournament.value.startDate, tournament.value.endDate) : '',
)

/**
 * Короткое имя для карточки матчей: полные названия вроде
 * «СШ №12 «Арсенал» (Ростов-на-Дону)» ломают строку на три части
 * и растягивают карточку на весь экран.
 */
const teamShortById = computed(() => {
  const m = new Map<string, string>()
  for (const t of tournament.value?.teams ?? []) m.set(t.id, t.shortName || t.name)
  return m
})

const upcomingMatches = computed(() =>
  [...(tournament.value?.matches ?? [])]
    .filter((m) => m.score === null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, MATCHES_LIMIT)
    .map((m) => ({
      id: m.id,
      date: formatDay(m.date),
      home: teamShortById.value.get(m.homeTeamId) ?? m.homeTeamId,
      away: teamShortById.value.get(m.awayTeamId) ?? m.awayTeamId,
      score: formatTime(m.date),
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
      home: teamShortById.value.get(m.homeTeamId) ?? m.homeTeamId,
      away: teamShortById.value.get(m.awayTeamId) ?? m.awayTeamId,
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
          <StandingsTable
            compact
            :limit="TABLE_LIMIT"
            :standings="tournament.standings"
            :teams="tournament.teams"
          />
          <RouterLink :to="`/tournament/${tournament.id}`" class="table-card__link">
            Полная таблица
            <IconArrowRight :size="14" />
          </RouterLink>
        </article>

        <!-- 3) Сыгранные матчи, а пока их нет — ближайшие -->
        <article class="matches-card">
          <h3 class="matches-card__title">
            <IconBall :size="20" />
            {{ recentMatches.length ? 'Последние матчи' : 'Ближайшие матчи' }}
          </h3>
          <ul v-if="recentMatches.length || upcomingMatches.length" class="matches">
            <li v-for="m in (recentMatches.length ? recentMatches : upcomingMatches)" :key="m.id" class="match">
              <span class="match__date">{{ m.date }}</span>
              <div class="match__teams">
                <span class="match__team" :title="m.home">{{ m.home }}</span>
                <span class="match__score">{{ m.score }}</span>
                <span class="match__team" :title="m.away">{{ m.away }}</span>
              </div>
            </li>
          </ul>
          <p v-else class="table-card__empty">Матчей пока нет.</p>
          <RouterLink :to="`/tournament/${tournament.id}`" class="table-card__link">
            {{ recentMatches.length ? 'Все результаты' : 'Всё расписание' }}
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

// Дата — над строкой, команды — сеткой «хозяева | счёт | гости».
// Раньше всё стояло в одну flex-строку с переносом, и гости уезжали
// на вторую строку даже на десктопе.
.match {
  display: flex;
  flex-direction: column;
  gap: $space-1;
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: $space-2;
}

.match__team {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:first-child { text-align: right; }
}

.match__score {
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: $font-size-md;
  color: $color-brand-500;
  padding: 0 $space-3;
  background: $color-white;
  border-radius: $radius-md;
  white-space: nowrap;
}

// В карточке на телефоне ~250px: отдаём место названиям команд.
@media (max-width: $bp-sm) {
  .match__teams { gap: $space-1; }
  .match__score { padding: 0 $space-2; }
}
</style>
