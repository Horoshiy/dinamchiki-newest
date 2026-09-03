<script setup lang="ts">
/**
 * Карточка тренера для сетки /coaches.
 *
 * По мокапам: большой аватар-плейсхолдер с градиентом и инициалами,
 * ФИО, роль, опыт, бейджи специализации, список команд, кнопка «Подробнее».
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Coach } from '@/entities/coach/coach.types'
import { COACH_SPEC_LABELS } from '@/entities/coach/coach.types'
import IconAward from '@/shared/ui/icons/IconAward.vue'
import IconUsers from '@/shared/ui/icons/IconUsers.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'

const props = defineProps<{ coach: Coach }>()

/** Инициалы из ФИО для аватара-плейсхолдера. */
const initials = computed<string>(() => {
  const parts = props.coach.fullName.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts[1]?.[0] ?? ''
  return (first + last).toUpperCase()
})

const specLabels = computed(() =>
  props.coach.specialization.map((s) => COACH_SPEC_LABELS[s]),
)

const teamsSummary = computed(() =>
  props.coach.teams.map((t) => t.name).join(', '),
)
</script>

<template>
  <article class="coach-card" :style="{ '--avatar-gradient': coach.avatarGradient }">
    <div class="coach-card__avatar" aria-hidden="true">
      <span class="coach-card__initials">{{ initials }}</span>
    </div>

    <h3 class="coach-card__name">{{ coach.fullName }}</h3>
    <p class="coach-card__role">{{ coach.role }}</p>

    <div class="coach-card__spec">
      <span
        v-for="spec in specLabels"
        :key="spec"
        class="coach-card__spec-badge"
      >
        {{ spec }}
      </span>
    </div>

    <p class="coach-card__experience">
      <IconAward :size="14" />
      {{ coach.experienceYears }} лет опыта
    </p>

    <p v-if="coach.teams.length" class="coach-card__teams">
      <IconUsers :size="14" />
      <span>
        <strong>Команды:</strong> {{ teamsSummary }}
      </span>
    </p>

    <RouterLink :to="`/coach/${coach.id}`" class="coach-card__link">
      Подробнее о тренере
      <IconArrowRight :size="14" />
    </RouterLink>
  </article>
</template>

<style scoped lang="scss">
.coach-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-3;
  padding: $space-6;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  transition: box-shadow $transition-base, transform $transition-base, border-color $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $color-border-strong;
  }
}

.coach-card__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--avatar-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  box-shadow: $shadow-md;
  margin-bottom: $space-2;
}

.coach-card__initials {
  font-family: $font-family-display;
  font-size: 2rem;
  font-weight: $font-weight-extrabold;
  letter-spacing: 0.04em;
}

.coach-card__name {
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.01em;
}

.coach-card__role {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  margin: 0;
  font-weight: $font-weight-medium;
}

.coach-card__spec {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-2;
  margin-top: $space-1;
}

.coach-card__spec-badge {
  display: inline-block;
  padding: $space-1 $space-3;
  background: rgba(30, 80, 216, 0.08);
  color: $color-brand-500;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.coach-card__experience,
.coach-card__teams {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-xs;
  color: $color-fg-muted;
  margin: 0;

  strong {
    color: $color-fg-strong;
    font-weight: $font-weight-bold;
  }
}

.coach-card__teams {
  text-align: left;
  display: flex;
  align-items: flex-start;

  span {
    display: inline;
  }
}

.coach-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  // auto, а не фиксированный отступ: у тренеров разной длины должности
  // кнопки иначе висят на разной высоте и ряд карточек выглядит рваным.
  margin-top: auto;
  padding: $space-3 $space-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
  border: 1.5px solid $color-brand-500;
  border-radius: $radius-md;
  text-decoration: none;
  transition: background $transition-base, color $transition-base;
  align-self: stretch;

  &:hover {
    background: $color-brand-500;
    color: $color-white;
  }
}
</style>
