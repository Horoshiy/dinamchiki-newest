<script setup lang="ts">
/**
 * Детальная страница команды (`/team/:id`).
 *
 * Данные из GraphQL через useTeamQuery (с mock-fallback).
 */
import { computed, toRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/shared/ui/base/Breadcrumbs.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import TeamSchedule from '@/widgets/team/TeamSchedule.vue'
import PlayerCard from '@/widgets/player/PlayerCard.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import { useTeamQuery, usePlayersQuery } from '@/shared/api/composables'
import type { Team } from '@/entities/team/team.types'
import type { Player } from '@/entities/player/player.types'
import { SIGNUP_ROUTE } from '@/shared/config/club'

const props = defineProps<{ id: string }>()

const idRef = toRef(props, 'id')
const { data, loading, error } = useTeamQuery(idRef)

const team = computed<Team | null>(() => {
  const d = data.value as { team?: Team | null } | null
  return d?.team ?? null
})

// Состав команды. Без него страница игрока была недостижима из интерфейса:
// у команды хранится только playersCount, а ссылок на игроков не было нигде.
const { data: rosterData, loading: rosterLoading } = usePlayersQuery(idRef)

const roster = computed<ReadonlyArray<Player>>(() => {
  const d = rosterData.value as { players?: ReadonlyArray<Player> } | null
  return d?.players ?? []
})

watch(error, (e) => { if (e) console.warn('[TeamDetailPage]', e.message) })

const crumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Команды', to: '/teams' },
  { label: team.value?.name ?? '…' },
])
</script>

<template>
  <div class="team-detail">
    <section class="container">
      <Breadcrumbs :items="crumbs" />
    </section>

    <section v-if="loading" class="container">
      <LoadingSkeleton variant="block" height="320px" />
    </section>

    <section v-else-if="error" class="container">
      <EmptyState
        title="Не удалось загрузить команду"
        :description="error.message"
        :icon="IconBall"
        variant="card"
      />
    </section>

    <section v-else-if="!team" class="container">
      <EmptyState
        title="Команда не найдена"
        :description="`Команды с id «${props.id}» нет в клубе. Возможно, она в архиве.`"
        :icon="IconBall"
        variant="card"
      >
        <template #action>
          <RouterLink to="/teams" custom v-slot="{ navigate }">
            <BaseButton variant="outline" :icon-left="IconArrowRight" @click="navigate">
              Все команды
            </BaseButton>
          </RouterLink>
        </template>
      </EmptyState>
    </section>

    <template v-else>
      <!-- Hero -->
      <section class="container team-detail__hero" :style="{ '--team-color': team.color }">
        <div class="team-detail__hero-photo" aria-hidden="true">
          <IconBall :size="64" />
        </div>
        <div class="team-detail__hero-body">
          <p class="team-detail__age">{{ team.ageLabel }}</p>
          <h1 class="team-detail__name">{{ team.name }}</h1>
          <p class="team-detail__desc">{{ team.description }}</p>

          <div class="team-detail__meta">
            <div class="meta-item">
              <span class="meta-item__label">Тренер</span>
              <span class="meta-item__value">{{ team.coach.name }}</span>
              <span class="meta-item__sub">{{ team.coach.role }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-item__label">Состав</span>
              <span class="meta-item__value">{{ team.playersCount }} игроков</span>
              <span class="meta-item__sub">Набор открыт</span>
            </div>
            <div class="meta-item">
              <span class="meta-item__label">Тренировок</span>
              <span class="meta-item__value">{{ team.schedule.length }} в неделю</span>
              <span class="meta-item__sub">Регулярные занятия</span>
            </div>
          </div>

          <div class="team-detail__actions">
            <BaseButton :to="SIGNUP_ROUTE" size="lg" variant="solid" :icon-left="IconCalendar">
              Записаться в команду
            </BaseButton>
            <BaseButton size="lg" variant="outline" :to="'/coaches'">
              Все тренеры
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- Расписание -->
      <section class="container">
        <TeamSchedule :schedule="team.schedule" />
      </section>

      <!-- Состав -->
      <section class="container">
        <SectionTitle
          eyebrow="Состав"
          :title="roster.length ? `Игроки команды (${roster.length})` : 'Игроки команды'"
        />

        <div v-if="rosterLoading" class="team-detail__roster">
          <LoadingSkeleton v-for="i in 4" :key="i" variant="block" height="220px" />
        </div>

        <ul v-else-if="roster.length" class="team-detail__roster">
          <li v-for="player in roster" :key="player.id">
            <PlayerCard :player="player" />
          </li>
        </ul>

        <EmptyState
          v-else
          title="Состав пока не опубликован"
          description="Карточки игроков этой команды появятся здесь после начала сезона."
        />
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.team-detail__roster {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-5;
  list-style: none;
  padding: 0;
  margin: 0;

  @media (max-width: $bp-lg) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: $bp-md) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: $bp-sm) {
    grid-template-columns: 1fr;
  }
}

.team-detail {
  display: flex;
  flex-direction: column;
  gap: $space-12;
  padding: $space-6 0 $space-16;
}

.team-detail__hero {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: $space-10;
  align-items: center;

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr;
    gap: $space-6;
  }
}

.team-detail__hero-photo {
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, rgba(30, 80, 216, 0.12) 0%, rgba(81, 128, 244, 0.08) 100%);
  border: 4px solid var(--team-color);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--team-color);
  box-shadow: $shadow-md;
}

.team-detail__hero-body {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.team-detail__age {
  display: inline-block;
  align-self: flex-start;
  padding: $space-1 $space-4;
  background: rgba(30, 80, 216, 0.08);
  color: var(--team-color);
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
}

.team-detail__name {
  font-family: $font-family-display;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: $font-weight-extrabold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.02em;
}

.team-detail__desc {
  font-size: $font-size-md;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
  max-width: 60ch;
}

.team-detail__meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-4;
  margin: $space-3 0;

  @media (max-width: $bp-md) {
    grid-template-columns: 1fr;
  }
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: $space-4;
  background: $color-bg-soft;
  border-radius: $radius-md;
  border-left: 3px solid var(--team-color);
}

.meta-item__label {
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-fg-muted;
  font-weight: $font-weight-semibold;
}

.meta-item__value {
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
}

.meta-item__sub {
  font-size: $font-size-xs;
  color: $color-fg-muted;
}

.team-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-3;
}
</style>
