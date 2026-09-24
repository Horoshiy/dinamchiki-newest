<script setup lang="ts">
/**
 * Детальная страница игрока (`/player/:id`).
 */
import { computed, toRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/shared/ui/base/Breadcrumbs.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import PlayerStatsGrid from '@/widgets/player/PlayerStatsGrid.vue'
import PlayerAchievements from '@/widgets/player/PlayerAchievements.vue'
import PlayerGallery from '@/widgets/player/PlayerGallery.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconUsers from '@/shared/ui/icons/IconUsers.vue'
import IconShieldCheck from '@/shared/ui/icons/IconShieldCheck.vue'
import type { Player } from '@/entities/player/player.types'
import { POSITION_LABELS } from '@/entities/player/player.types'
import { usePlayerQuery } from '@/shared/api/composables'
import { SIGNUP_ROUTE } from '@/shared/config/club'

const props = defineProps<{ id: string }>()

const idRef = toRef(props, 'id')
const { data, loading, error } = usePlayerQuery(idRef)

const player = computed<Player | null>(() => {
  const d = data.value as { player?: Player | null } | null
  return d?.player ?? null
})

watch(error, (e) => { if (e) console.warn('[PlayerPage]', e.message) })

const initials = computed<string>(() => {
  if (!player.value) return ''
  const parts = player.value.fullName.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts[1]?.[0] ?? ''
  return (first + last).toUpperCase()
})

const crumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Команды', to: '/teams' },
  { label: player.value?.team.name ?? '…', to: player.value ? `/team/${player.value.team.id}` : undefined },
  { label: player.value?.fullName ?? '…' },
])
</script>

<template>
  <div class="player-detail">
    <section class="container">
      <Breadcrumbs :items="crumbs" />
    </section>

    <section v-if="loading" class="container">
      <LoadingSkeleton variant="block" height="320px" />
    </section>

    <section v-else-if="error" class="container">
      <EmptyState
        title="Не удалось загрузить игрока"
        :description="error.message"
        :icon="IconBall"
        variant="card"
      />
    </section>

    <section v-else-if="!player" class="container">
      <EmptyState
        title="Игрок не найден"
        :description="`Игрока с id «${props.id}» нет в базе.`"
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
      <section class="container player-detail__hero">
        <div
          class="player-detail__photo"
          :style="{ background: player.avatarGradient }"
        >
          <span class="player-detail__num">{{ player.jerseyNumber }}</span>
          <span class="player-detail__initials">{{ initials }}</span>
        </div>

        <div class="player-detail__hero-body">
          <div class="player-detail__tags">
            <span class="player-detail__position">{{ POSITION_LABELS[player.position] }}</span>
            <span class="player-detail__age">{{ player.age }} лет</span>
            <span class="player-detail__number">№ {{ player.jerseyNumber }}</span>
          </div>

          <h1 class="player-detail__name">{{ player.fullName }}</h1>
          <p class="player-detail__bio">{{ player.bio }}</p>

          <div class="player-detail__actions">
            <BaseButton :to="SIGNUP_ROUTE" size="lg" variant="solid" :icon-left="IconCalendar">
              Записаться на пробную
            </BaseButton>
            <RouterLink :to="`/team/${player.team.id}`" custom v-slot="{ navigate }">
              <BaseButton size="lg" variant="outline" :icon-left="IconArrowRight" @click="navigate">
                Команда игрока
              </BaseButton>
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="container">
        <SectionTitle eyebrow="Сезон 2026" title="Статистика" />
        <PlayerStatsGrid :stats="player.stats" />
      </section>

      <section v-if="player.achievements.length" class="container">
        <SectionTitle eyebrow="Награды" title="Достижения" />
        <PlayerAchievements :achievements="player.achievements" />
      </section>

      <section v-if="player.gallery.length" class="container">
        <SectionTitle eyebrow="Кадры" title="Фотогалерея" />
        <PlayerGallery :gallery="player.gallery" :player="player" />
      </section>

      <section class="container">
        <div class="player-detail__refs">
          <RouterLink :to="`/team/${player.team.id}`" class="player-detail__ref" :style="{ '--ref-color': player.team.color }">
            <div class="player-detail__ref-head">
              <IconUsers :size="20" />
              <span>Команда</span>
            </div>
            <div class="player-detail__ref-body">
              <strong>{{ player.team.name }}</strong>
              <span>{{ player.team.ageLabel }}</span>
            </div>
            <span class="player-detail__ref-link">
              Перейти к команде
              <IconArrowRight :size="14" />
            </span>
          </RouterLink>

          <RouterLink :to="`/coach/${player.coach.id}`" class="player-detail__ref">
            <div class="player-detail__ref-head">
              <IconShieldCheck :size="20" />
              <span>Тренер</span>
            </div>
            <div class="player-detail__ref-body">
              <strong>{{ player.coach.fullName }}</strong>
              <span>{{ player.coach.role }}</span>
            </div>
            <span class="player-detail__ref-link">
              Перейти к тренеру
              <IconArrowRight :size="14" />
            </span>
          </RouterLink>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.player-detail {
  display: flex;
  flex-direction: column;
  gap: $space-12;
  padding: $space-6 0 $space-16;
}

.player-detail__hero {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: $space-10;
  align-items: center;

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr;
    gap: $space-6;
    justify-items: center;
    text-align: center;
  }
}

.player-detail__photo {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  box-shadow: $shadow-lg;

  @media (max-width: $bp-lg) {
    width: 220px; height: 220px;
  }
}

.player-detail__num {
  position: absolute;
  top: $space-4; right: $space-4;
  width: 56px; height: 56px;
  background: $color-white;
  color: $color-brand-500;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-family-display;
  font-size: $font-size-2xl;
  font-weight: $font-weight-extrabold;
  box-shadow: $shadow-md;
}

.player-detail__initials {
  font-family: $font-family-display;
  font-size: clamp(3.5rem, 7vw, 5rem);
  font-weight: $font-weight-extrabold;
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.player-detail__hero-body {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  @media (max-width: $bp-lg) {
    align-items: center;
  }
}

.player-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.player-detail__position,
.player-detail__age,
.player-detail__number {
  display: inline-block;
  padding: $space-1 $space-4;
  background: rgba(30, 80, 216, 0.08);
  color: $color-brand-500;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.player-detail__number {
  background: $color-brand-500;
  color: $color-white;
}

.player-detail__name {
  font-family: $font-family-display;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: $font-weight-extrabold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.02em;
}

.player-detail__bio {
  font-size: $font-size-md;
  color: $color-fg;
  line-height: $line-height-base;
  margin: 0;
  max-width: 60ch;
}

.player-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-3;
}

.player-detail__refs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: $space-4;
}

.player-detail__ref {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-5;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  border-left: 4px solid var(--ref-color, $color-brand-500);
  text-decoration: none;
  color: inherit;
  transition: box-shadow $transition-base, transform $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.player-detail__ref-head {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-fg-muted;
  font-weight: $font-weight-bold;
}

.player-detail__ref-body {
  display: flex;
  flex-direction: column;
  gap: $space-1;

  strong {
    font-family: $font-family-display;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-fg-strong;
  }

  span {
    font-size: $font-size-sm;
    color: $color-fg-muted;
  }
}

.player-detail__ref-link {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  margin-top: auto;
  padding-top: $space-3;
  border-top: 1px solid $color-border;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
}
</style>
