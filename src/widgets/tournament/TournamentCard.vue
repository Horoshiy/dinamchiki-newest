<script setup lang="ts">
/**
 * Hero-карточка турнира для главной секции /tournaments.
 *
 * По дизайну: большой фон с акцентным цветом, бейдж статуса,
 * название, даты, место, призовой фонд, кнопка «Подробнее».
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Tournament } from '@/entities/tournament/tournament.types'
import {
  TOURNAMENT_STATUS_LABELS,
  TOURNAMENT_STATUS_COLORS,
} from '@/entities/tournament/tournament.types'
import IconLocation from '@/shared/ui/icons/IconLocation.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'

const props = defineProps<{ tournament: Tournament }>()

const statusLabel = computed(() => TOURNAMENT_STATUS_LABELS[props.tournament.status])
const statusColor = computed(() => TOURNAMENT_STATUS_COLORS[props.tournament.status])

const dateRange = computed(() => {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })
  return `${fmt(props.tournament.startDate)} — ${fmt(props.tournament.endDate)}`
})
</script>

<template>
  <RouterLink
    :to="`/tournament/${tournament.id}`"
    class="t-card"
    :style="{ '--status-color': statusColor }"
  >
    <div class="t-card__badge">
      <span class="t-card__status">{{ statusLabel }}</span>
      <span v-if="tournament.ageGroup" class="t-card__age">{{ tournament.ageGroup }}</span>
    </div>

    <div class="t-card__body">
      <h3 class="t-card__name">
        <IconTrophy :size="32" />
        {{ tournament.name }}
      </h3>
      <p class="t-card__desc">{{ tournament.description }}</p>

      <dl class="t-card__meta">
        <div class="t-card__meta-item">
          <dt><IconCalendar :size="16" /> Даты</dt>
          <dd>{{ dateRange }}</dd>
        </div>
        <div class="t-card__meta-item">
          <dt><IconLocation :size="16" /> Место</dt>
          <dd>{{ tournament.venue }}</dd>
        </div>
        <div class="t-card__meta-item">
          <dt><IconTrophy :size="16" /> Призовой фонд</dt>
          <dd>{{ tournament.prizeFund }}</dd>
        </div>
      </dl>
    </div>

    <div class="t-card__cta">
      <span class="t-card__cta-link">
        Подробнее о турнире
        <IconArrowRight :size="16" />
      </span>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
.t-card {
  display: flex;
  flex-direction: column;
  gap: $space-5;
  padding: $space-8;
  background: linear-gradient(135deg, $color-brand-600 0%, $color-brand-700 100%);
  border-radius: $radius-xl;
  color: $color-white;
  text-decoration: none;
  box-shadow: $shadow-md;
  position: relative;
  overflow: hidden;
  transition: box-shadow $transition-base, transform $transition-base;

  // Лёгкая декоративная "полоска" цвета статуса поверх градиента
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--status-color);
  }

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-2px);

    .t-card__cta-link {
      gap: $space-3;
    }
  }
}

.t-card__badge {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  align-items: center;
}

.t-card__status {
  display: inline-block;
  padding: $space-1 $space-4;
  background: var(--status-color);
  color: $color-white;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.t-card__age {
  display: inline-block;
  padding: $space-1 $space-4;
  background: rgba(255, 255, 255, 0.15);
  color: $color-white;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
}

.t-card__body {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.t-card__name {
  display: flex;
  align-items: center;
  gap: $space-3;
  font-family: $font-family-display;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: $font-weight-extrabold;
  color: $color-white;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.t-card__desc {
  font-size: $font-size-md;
  color: rgba(255, 255, 255, 0.85);
  line-height: $line-height-base;
  margin: 0;
  max-width: 70ch;
}

.t-card__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: $space-4;
  margin: 0;
  padding-top: $space-4;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.t-card__meta-item {
  display: flex;
  flex-direction: column;
  gap: $space-1;

  dt {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: $font-weight-semibold;
  }

  dd {
    margin: 0;
    font-size: $font-size-sm;
    color: $color-white;
    font-weight: $font-weight-semibold;
  }
}

.t-card__cta {
  display: flex;
  align-items: center;
}

.t-card__cta-link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-white;
  transition: gap $transition-base;
}
</style>
