<script setup lang="ts">
/**
 * Список достижений игрока.
 *
 * Каждая карточка: цветная иконка (trophy/badge/star/award/heart) + заголовок + описание + год.
 */
import type { Component } from 'vue'
import type { PlayerAchievement } from '@/entities/player/player.types'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import IconBadge from '@/shared/ui/icons/IconBadge.vue'
import IconStar from '@/shared/ui/icons/IconStar.vue'
import IconAward from '@/shared/ui/icons/IconAward.vue'
import IconHeart from '@/shared/ui/icons/IconHeart.vue'

defineProps<{ achievements: ReadonlyArray<PlayerAchievement> }>()

const icons: Readonly<Record<PlayerAchievement['iconKey'], Component>> = {
  trophy: IconTrophy,
  badge:  IconBadge,
  star:   IconStar,
  award:  IconAward,
  heart:  IconHeart,
}
</script>

<template>
  <div class="achv">
    <div
      v-for="a in achievements"
      :key="a.id"
      class="achv__item"
    >
      <div class="achv__icon">
        <component :is="icons[a.iconKey]" :size="22" />
      </div>
      <div class="achv__body">
        <div class="achv__head">
          <h3 class="achv__title">{{ a.title }}</h3>
          <span class="achv__year">{{ a.year }}</span>
        </div>
        <p class="achv__desc">{{ a.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.achv {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: $space-4;
}

.achv__item {
  display: flex;
  align-items: flex-start;
  gap: $space-4;
  padding: $space-5;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  transition: box-shadow $transition-base, transform $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-1px);
  }
}

.achv__icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 80, 216, 0.08);
  color: $color-brand-500;
  border-radius: $radius-md;
}

.achv__body {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  flex: 1;
}

.achv__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $space-2;
  flex-wrap: wrap;
}

.achv__title {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
}

.achv__year {
  font-family: $font-family-display;
  font-size: $font-size-sm;
  font-weight: $font-weight-extrabold;
  color: $color-brand-500;
  letter-spacing: 0.04em;
}

.achv__desc {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
}
</style>
