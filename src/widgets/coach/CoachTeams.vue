<script setup lang="ts">
/** Группы тренера с расписанием и ссылкой на страницу группы. */
import { RouterLink } from 'vue-router'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import TeamSchedule from '@/widgets/team/TeamSchedule.vue'
import type { Coach } from '@/entities/coach/coach.types'

defineProps<{ teams: Coach['teams'] }>()
</script>

<template>
  <section class="container">
    <SectionTitle
      eyebrow="Команды"
      :title="`Текущие команды (${teams.length})`"
    />
    <div class="coach-detail__teams">
      <div v-for="t in teams" :key="t.id" class="coach-detail__team">
        <div class="coach-detail__team-head">
          <div>
            <p class="coach-detail__team-age">{{ t.ageLabel }}</p>
            <h3 class="coach-detail__team-name">{{ t.name }}</h3>
          </div>
          <RouterLink :to="`/team/${t.id}`" class="coach-detail__team-link">
            Подробнее о команде
            <IconArrowRight :size="14" />
          </RouterLink>
        </div>
        <TeamSchedule :schedule="t.schedule" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.coach-detail__teams {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
  gap: $space-5;
}

.coach-detail__team {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.coach-detail__team-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-3;
}

.coach-detail__team-age {
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-fg-muted;
  font-weight: $font-weight-semibold;
  margin: 0;
}

.coach-detail__team-name {
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: $space-1 0 0;
  letter-spacing: -0.01em;
}

.coach-detail__team-link {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
  text-decoration: none;
  white-space: nowrap;

  &:hover { text-decoration: underline; }
}

@media (max-width: $bp-md) {
  .coach-detail__team-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
