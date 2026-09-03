<script setup lang="ts">
/**
 * Компактная карточка игрока для сетки /team/:id (для будущего).
 *
 * Сейчас не используется — на детальной странице игрока уже есть всё.
 * Оставлен как переиспользуемый компонент для возможного списка на /team/:id.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Player } from '@/entities/player/player.types'
import { POSITION_LABELS } from '@/entities/player/player.types'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'

const props = defineProps<{ player: Player }>()

const initials = computed<string>(() => {
  const parts = props.player.fullName.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts[1]?.[0] ?? ''
  return (first + last).toUpperCase()
})
</script>

<template>
  <RouterLink :to="`/player/${player.id}`" class="p-card">
    <div class="p-card__avatar" :style="{ background: player.avatarGradient }">
      <span class="p-card__num">{{ player.jerseyNumber }}</span>
      <span class="p-card__initials">{{ initials }}</span>
    </div>

    <h3 class="p-card__name">{{ player.fullName }}</h3>
    <p class="p-card__pos">{{ POSITION_LABELS[player.position] }} · {{ player.age }} лет</p>
    <p class="p-card__team">{{ player.team.name }}</p>

    <span class="p-card__link">
      Подробнее
      <IconArrowRight :size="14" />
    </span>
  </RouterLink>
</template>

<style scoped lang="scss">
.p-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-2;
  padding: $space-5;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  text-decoration: none;
  color: inherit;
  transition: box-shadow $transition-base, transform $transition-base, border-color $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $color-border-strong;
  }
}

.p-card__avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  box-shadow: $shadow-md;
  margin-bottom: $space-1;
}

.p-card__num {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 26px;
  height: 26px;
  background: $color-white;
  color: $color-brand-500;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-family-display;
  font-size: $font-size-sm;
  font-weight: $font-weight-extrabold;
  box-shadow: $shadow-sm;
}

.p-card__initials {
  font-family: $font-family-display;
  font-size: 1.5rem;
  font-weight: $font-weight-extrabold;
  letter-spacing: 0.04em;
}

.p-card__name {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
}

.p-card__pos {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: $font-weight-semibold;
}

.p-card__team {
  font-size: $font-size-sm;
  color: $color-brand-500;
  margin: 0;
  font-weight: $font-weight-semibold;
}

.p-card__link {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  margin-top: $space-2;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
}
</style>
