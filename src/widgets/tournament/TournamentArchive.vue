<script setup lang="ts">
/**
 * Сетка карточек архивных (завершённых) турниров.
 *
 * Компактнее TournamentCard — для списка внизу страницы.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Tournament } from '@/entities/tournament/tournament.types'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'

defineProps<{ tournaments: ReadonlyArray<Tournament> }>()

function fmt(d: string): string {
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="archive">
    <RouterLink
      v-for="t in tournaments"
      :key="t.id"
      :to="`/tournament/${t.id}`"
      class="archive__card"
    >
      <div class="archive__head">
        <span class="archive__year">{{ new Date(t.startDate).getFullYear() }}</span>
        <span class="archive__status">Завершён</span>
      </div>
      <h3 class="archive__name">{{ t.name }}</h3>
      <p class="archive__date">
        <IconCalendar :size="14" />
        {{ fmt(t.startDate) }} — {{ fmt(t.endDate) }}
      </p>
      <p v-if="t.ageGroup" class="archive__age">{{ t.ageGroup }} · {{ t.teamsCount }} команд</p>
      <span class="archive__link">
        Результаты
        <IconArrowRight :size="14" />
      </span>
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
.archive {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: $space-4;
}

.archive__card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
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

.archive__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;
}

.archive__year {
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-extrabold;
  color: $color-brand-500;
  letter-spacing: -0.02em;
}

.archive__status {
  display: inline-block;
  padding: 2px $space-3;
  background: rgba(90, 100, 120, 0.1);
  color: $color-fg-muted;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.archive__name {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.01em;
}

.archive__date {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-xs;
  color: $color-fg-muted;
  margin: 0;
}

.archive__age {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  margin: 0;
}

.archive__link {
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
