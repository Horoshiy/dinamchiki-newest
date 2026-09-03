<script setup lang="ts">
/**
 * Превью тренеров на главной — первые несколько карточек со ссылкой на /coaches.
 *
 * Данные из useCoachesQuery — тот же источник, что и на странице /coaches,
 * чтобы главная не показывала свой отдельный, расходящийся список.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconUsers from '@/shared/ui/icons/IconUsers.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import { useCoachesQuery } from '@/shared/api/composables'
import { COACH_AGE_LABELS } from '@/entities/coach/coach.types'
import type { Coach } from '@/entities/coach/coach.types'

/** Сколько тренеров показываем в превью. */
const PREVIEW_LIMIT = 3

const { data, loading } = useCoachesQuery()

const coaches = computed(() => {
  const d = data.value as { coaches?: ReadonlyArray<Coach> } | null
  return (d?.coaches ?? []).slice(0, PREVIEW_LIMIT).map((c) => ({
    id: c.id,
    name: c.fullName,
    role: c.role,
    experience: `Опыт: ${c.experienceYears} лет`,
    ages: `Группы: ${c.ageGroups.map((a) => COACH_AGE_LABELS[a]).join(', ')}`,
    badge: c.fullName.charAt(0),
  }))
})
</script>

<template>
  <section class="coaches-preview">
    <div class="container">
      <SectionTitle
        eyebrow="Команда"
        title="Тренеры клуба"
      >
        <template #action>
          <BaseButton variant="outline" size="md" :icon-right="IconArrowRight" :to="'/coaches'">
            Все тренеры
          </BaseButton>
        </template>
      </SectionTitle>

      <div v-if="loading" class="coaches-preview__grid">
        <LoadingSkeleton v-for="i in 3" :key="i" variant="block" height="320px" />
      </div>
      <ul v-else class="coaches-preview__grid">
        <li v-for="c in coaches" :key="c.id" class="coach">
          <div class="coach__photo" aria-hidden="true">
            <IconUsers :size="48" />
            <span class="coach__shield">{{ c.badge }}</span>
          </div>
          <div class="coach__body">
            <h3 class="coach__name">{{ c.name }}</h3>
            <p class="coach__role">{{ c.role }}</p>
            <div class="coach__meta">
              <span><IconTrophy :size="16" /> {{ c.experience }}</span>
              <span><IconUsers :size="16" /> {{ c.ages }}</span>
            </div>
            <RouterLink :to="`/coach/${c.id}`" class="coach__link">
              Подробнее
              <IconArrowRight :size="16" />
            </RouterLink>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.coaches-preview {
  padding: $space-16 0;
  background: $color-white;
}

.coaches-preview__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-5;

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: $bp-sm) {
    grid-template-columns: 1fr;
  }
}

.coach {
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: box-shadow $transition-base, transform $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.coach__photo {
  position: relative;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, $color-brand-100 0%, $color-brand-50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-brand-500;
}

.coach__shield {
  position: absolute;
  top: $space-4;
  right: $space-4;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-brand-500;
  color: $color-white;
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: $font-size-md;
  border-radius: $radius-md;
  border: 2px solid $color-white;
}

.coach__body {
  padding: $space-6;
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.coach__name {
  font-family: $font-family-display;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
}

.coach__role {
  font-size: $font-size-sm;
  color: $color-brand-500;
  font-weight: $font-weight-semibold;
  margin: 0 0 $space-2;
}

.coach__meta {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin-bottom: $space-3;

  span {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-sm;
    color: $color-fg-muted;
  }
}

.coach__link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  margin-top: auto;
  padding: $space-2 $space-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
  border: 1.5px solid $color-brand-500;
  border-radius: $radius-md;
  text-decoration: none;
  align-self: flex-start;
  transition: background $transition-base, color $transition-base;

  &:hover {
    background: $color-brand-500;
    color: $color-white;
  }
}
</style>
