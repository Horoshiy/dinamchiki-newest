<script setup lang="ts">
/** Резюме тренера: образование, стаж, награды — карточками с иконкой. */
import type { Component } from 'vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import IconBadge from '@/shared/ui/icons/IconBadge.vue'
import IconHeart from '@/shared/ui/icons/IconHeart.vue'
import IconStar from '@/shared/ui/icons/IconStar.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import type { CoachAchievement } from '@/entities/coach/coach.types'

defineProps<{ achievements: ReadonlyArray<CoachAchievement> }>()

const achievementIcons: Readonly<Record<CoachAchievement['iconKey'], Component>> = {
  trophy: IconTrophy,
  badge:  IconBadge,
  star:   IconStar,
  heart:  IconHeart,
}
</script>

<template>
  <section class="container">
    <SectionTitle eyebrow="Резюме" title="Опыт и квалификация" />
    <div class="coach-detail__achievements">
      <div
        v-for="(a, i) in achievements"
        :key="i"
        class="coach-detail__achievement"
      >
        <div class="coach-detail__achievement-icon">
          <component :is="achievementIcons[a.iconKey]" :size="22" />
        </div>
        <div class="coach-detail__achievement-body">
          <h3 class="coach-detail__achievement-title">{{ a.title }}</h3>
          <p class="coach-detail__achievement-desc">{{ a.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.coach-detail__achievements {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: $space-4;
}

.coach-detail__achievement {
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

.coach-detail__achievement-icon {
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

.coach-detail__achievement-body {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.coach-detail__achievement-title {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
}

.coach-detail__achievement-desc {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
}
</style>
