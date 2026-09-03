<script setup lang="ts">
/**
 * Карточка команды для сетки /teams.
 *
 * По мокапам: цветная боковая полоса/бейдж с возрастом, название команды,
 * краткое описание, тренер, превью расписания (3 слота) + кнопка «Подробнее».
 */
import { RouterLink } from 'vue-router'
import type { Team } from '@/entities/team/team.types'
import IconUsers from '@/shared/ui/icons/IconUsers.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'

defineProps<{ team: Team }>()
</script>

<template>
  <article class="team-card" :style="{ '--team-color': team.color }">
    <header class="team-card__head">
      <span class="team-card__age">{{ team.ageLabel }}</span>
      <span class="team-card__count">
        <IconUsers :size="14" />
        {{ team.playersCount }} игроков
      </span>
    </header>

    <h3 class="team-card__name">{{ team.name }}</h3>

    <p class="team-card__desc">{{ team.description }}</p>

    <div class="team-card__coach">
      <span class="team-card__coach-label">Тренер</span>
      <span class="team-card__coach-name">{{ team.coach.name }}</span>
      <span class="team-card__coach-role">{{ team.coach.role }}</span>
    </div>

    <div class="team-card__schedule">
      <p class="team-card__schedule-title">
        <IconCalendar :size="14" />
        Ближайшие тренировки
      </p>
      <ul class="team-card__schedule-list">
        <li v-for="s in team.schedule.slice(0, 3)" :key="s.day + s.time">
          <span class="team-card__schedule-day">{{ s.day }}</span>
          <span class="team-card__schedule-time">{{ s.time }}</span>
        </li>
      </ul>
    </div>

    <RouterLink :to="`/team/${team.id}`" class="team-card__link">
      Подробнее о команде
      <IconArrowRight :size="14" />
    </RouterLink>
  </article>
</template>

<style scoped lang="scss">
.team-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-6;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  overflow: hidden;
  transition: box-shadow $transition-base, transform $transition-base, border-color $transition-base;

  // Цветная левая полоска — фирменный акцент команды
  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: var(--team-color);
  }

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $color-border-strong;
  }
}

.team-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;
  padding-left: $space-2; // под полоску
}

.team-card__age {
  display: inline-block;
  padding: $space-1 $space-3;
  background: rgba(30, 80, 216, 0.08);
  color: var(--team-color);
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.team-card__count {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-xs;
  color: $color-fg-muted;
  font-weight: $font-weight-medium;
}

.team-card__name {
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  padding-left: $space-2;
  letter-spacing: -0.01em;
}

.team-card__desc {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
  padding-left: $space-2;
  flex: 1;
}

.team-card__coach {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: $space-3 $space-2;
  background: $color-bg-soft;
  border-radius: $radius-md;
  margin-top: $space-2;
}

.team-card__coach-label {
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-fg-muted;
  font-weight: $font-weight-semibold;
}

.team-card__coach-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
}

.team-card__coach-role {
  font-size: $font-size-xs;
  color: $color-fg-muted;
}

.team-card__schedule {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding: 0 $space-2;
}

.team-card__schedule-title {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-xs;
  color: $color-fg-muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: $font-weight-semibold;
  margin: 0;
}

.team-card__schedule-list {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin: 0;
  padding: 0;
  list-style: none;
}

.team-card__schedule-list li {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-1 $space-3;
  background: $color-bg-soft;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
}

.team-card__schedule-day {
  color: var(--team-color);
  font-weight: $font-weight-bold;
}

.team-card__schedule-time {
  color: $color-fg-strong;
}

.team-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  margin-top: $space-3;
  padding: $space-3 $space-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: var(--team-color);
  border: 1.5px solid var(--team-color);
  border-radius: $radius-md;
  text-decoration: none;
  transition: background $transition-base, color $transition-base;

  &:hover {
    background: var(--team-color);
    color: $color-white;
  }
}
</style>
