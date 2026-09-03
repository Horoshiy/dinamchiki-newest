<script setup lang="ts">
/**
 * Сетка статистики игрока.
 *
 * 6 метрик в формате «большое число + подпись»: Матчи / Голы / Передачи /
 * Минуты / Жёлтые карточки / Красные карточки.
 */
import type { PlayerStats } from '@/entities/player/player.types'

defineProps<{ stats: PlayerStats }>()
</script>

<template>
  <div class="stats-grid">
    <div class="stats-grid__item">
      <strong class="stats-grid__num">{{ stats.matchesPlayed }}</strong>
      <span class="stats-grid__label">матчей</span>
    </div>
    <div class="stats-grid__item stats-grid__item--accent">
      <strong class="stats-grid__num">{{ stats.goals }}</strong>
      <span class="stats-grid__label">голов</span>
    </div>
    <div class="stats-grid__item stats-grid__item--accent">
      <strong class="stats-grid__num">{{ stats.assists }}</strong>
      <span class="stats-grid__label">передач</span>
    </div>
    <div class="stats-grid__item">
      <strong class="stats-grid__num">{{ stats.minutesPlayed }}</strong>
      <span class="stats-grid__label">минут на поле</span>
    </div>
    <div class="stats-grid__item">
      <strong class="stats-grid__num">{{ stats.yellowCards }}</strong>
      <span class="stats-grid__label">жёлтых</span>
    </div>
    <div class="stats-grid__item">
      <strong class="stats-grid__num">{{ stats.redCards }}</strong>
      <span class="stats-grid__label">красных</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $space-3;

  @media (max-width: $bp-lg) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: $bp-sm) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stats-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-1;
  padding: $space-5 $space-3;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  text-align: center;
  transition: box-shadow $transition-base;

  &:hover {
    box-shadow: $shadow-sm;
  }

  &--accent {
    background: rgba(30, 80, 216, 0.04);
    border-color: rgba(30, 80, 216, 0.15);
  }
}

.stats-grid__num {
  font-family: $font-family-display;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: $font-weight-extrabold;
  color: $color-fg-strong;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stats-grid__item--accent .stats-grid__num {
  color: $color-brand-500;
}

.stats-grid__label {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: $font-weight-semibold;
}
</style>
