<script setup lang="ts">
/**
 * Полное расписание команды по дням недели.
 *
 * Используется и на /teams (общий блок), и на детальной /team/:id.
 */
import type { ScheduleSlot } from '@/entities/team/team.types'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'

defineProps<{ schedule: ReadonlyArray<ScheduleSlot> }>()
</script>

<template>
  <div class="schedule">
    <h3 class="schedule__title">
      <IconCalendar :size="22" />
      Расписание тренировок
    </h3>
    <ul class="schedule__list">
      <li v-for="s in schedule" :key="s.day + s.time" class="schedule__row">
        <span class="schedule__day">{{ s.day }}</span>
        <span class="schedule__time">{{ s.time }}</span>
        <span class="schedule__venue">{{ s.venue }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.schedule {
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-6;
  box-shadow: $shadow-sm;
}

.schedule__title {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0 0 $space-4;
}

.schedule__list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.schedule__row {
  display: grid;
  grid-template-columns: 60px 80px 1fr;
  align-items: center;
  gap: $space-4;
  padding: $space-3 0;
  border-bottom: 1px solid $color-border;
  font-size: $font-size-sm;

  &:last-child { border-bottom: none; }

  @media (max-width: $bp-sm) {
    grid-template-columns: 48px 1fr;
    gap: $space-2;

    .schedule__venue {
      grid-column: 1 / -1;
      padding-left: 64px;
      color: $color-fg-muted;
    }
  }
}

.schedule__day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 36px;
  background: $color-brand-50;
  color: $color-brand-500;
  border-radius: $radius-md;
  font-weight: $font-weight-bold;
}

.schedule__time {
  font-family: $font-family-display;
  font-weight: $font-weight-bold;
  font-size: $font-size-md;
  color: $color-fg-strong;
}

.schedule__venue {
  color: $color-fg-muted;
}
</style>
