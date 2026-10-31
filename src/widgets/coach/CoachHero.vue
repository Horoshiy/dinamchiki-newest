<script setup lang="ts">
/** Шапка страницы тренера: фото-плейсхолдер, имя, специализация, опыт. */
import { computed } from 'vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import type { Coach } from '@/entities/coach/coach.types'
import { COACH_SPEC_LABELS } from '@/entities/coach/coach.types'
import { SIGNUP_ROUTE } from '@/shared/config/club'
import { withPlural } from '@/shared/lib/plural'
import { initials as initialsOf } from '@/shared/lib/person'
import { coachPhoto } from '@/entities/coach/coach.photos'

const props = defineProps<{ coach: Coach }>()

const initials = computed(() => initialsOf(props.coach.fullName))
const photo = computed(() => coachPhoto(props.coach.id))
const primarySpecLabel = computed(() => {
  const first = props.coach.specialization[0]
  return first ? COACH_SPEC_LABELS[first] : ''
})
</script>

<template>
  <section
    class="container coach-detail__hero"
    :style="{ '--avatar-gradient': coach.avatarGradient }"
  >
    <div class="coach-detail__hero-photo" :class="{ 'coach-detail__hero-photo--img': photo }">
      <picture v-if="photo">
        <source type="image/webp" :srcset="photo.srcsetWebp" sizes="(max-width: 1024px) 90vw, 480px" />
        <img class="coach-detail__img" :src="photo.src" :srcset="photo.srcsetJpg" sizes="(max-width: 1024px) 90vw, 480px" width="600" height="600" :alt="coach.fullName" fetchpriority="high" decoding="async" />
      </picture>
      <span v-else class="coach-detail__initials" aria-hidden="true">{{ initials }}</span>
    </div>

    <div class="coach-detail__hero-body">
      <p v-if="primarySpecLabel" class="coach-detail__spec">{{ primarySpecLabel }}</p>
      <h1 class="coach-detail__name">{{ coach.fullName }}</h1>
      <p class="coach-detail__role">{{ coach.role }}</p>
      <p class="coach-detail__quote">«{{ coach.description }}»</p>

      <div class="coach-detail__meta">
        <div v-if="coach.experienceYears > 0" class="meta-item">
          <span class="meta-item__label">Опыт</span>
          <span class="meta-item__value">{{ withPlural(coach.experienceYears, ['год', 'года', 'лет']) }}</span>
          <span class="meta-item__sub">тренерской работы</span>
        </div>
        <!-- В CRM специализации у тренеров не заполнены — тогда показываем
             только возраст детей, а не пустую карточку «Специализация». -->
        <div v-if="coach.specialization.length" class="meta-item">
          <span class="meta-item__label">Специализация</span>
          <span class="meta-item__value">
            {{ coach.specialization.map(s => COACH_SPEC_LABELS[s]).join(' · ') }}
          </span>
          <span class="meta-item__sub">{{ coach.ageGroups.join(' · ') }}</span>
        </div>
        <div v-else-if="coach.ageGroups.length" class="meta-item">
          <span class="meta-item__label">Возраст детей</span>
          <span class="meta-item__value">{{ coach.ageGroups.join(' · ') }} лет</span>
        </div>
        <div v-if="coach.teams.length" class="meta-item">
          <span class="meta-item__label">Групп</span>
          <span class="meta-item__value">{{ coach.teams.length }}</span>
          <span class="meta-item__sub">Ведёт занятия</span>
        </div>
      </div>

      <div class="coach-detail__actions">
        <BaseButton :to="SIGNUP_ROUTE" size="lg" variant="solid" :icon-left="IconCalendar">
          Записаться на пробную
        </BaseButton>
        <BaseButton size="lg" variant="outline" :to="'/coaches'">
          Все тренеры
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.coach-detail__hero {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: $space-10;
  align-items: center;

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr;
    gap: $space-6;
  }
}

.coach-detail__hero-photo {
  aspect-ratio: 1 / 1;
  background: var(--avatar-gradient);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  box-shadow: $shadow-lg;
}

.coach-detail__hero-photo--img {
  overflow: hidden;

  picture {
    display: contents;
  }
}

.coach-detail__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coach-detail__initials {
  font-family: $font-family-display;
  font-size: clamp(4rem, 8vw, 6rem);
  font-weight: $font-weight-extrabold;
  letter-spacing: 0.04em;
}

.coach-detail__hero-body {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.coach-detail__spec {
  display: inline-block;
  align-self: flex-start;
  padding: $space-1 $space-4;
  background: rgba(30, 80, 216, 0.08);
  color: $color-brand-500;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
}

.coach-detail__name {
  font-family: $font-family-display;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: $font-weight-extrabold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.02em;
}

.coach-detail__role {
  font-size: $font-size-md;
  color: $color-fg-muted;
  margin: 0;
  font-weight: $font-weight-semibold;
}

.coach-detail__quote {
  font-size: $font-size-md;
  color: $color-fg;
  line-height: $line-height-base;
  margin: $space-3 0;
  max-width: 60ch;
  font-style: italic;
}

.coach-detail__meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-4;
  margin: $space-3 0;

  @media (max-width: $bp-md) {
    grid-template-columns: 1fr;
  }
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: $space-4;
  background: $color-bg-soft;
  border-radius: $radius-md;
  border-left: 3px solid $color-brand-500;
}

.meta-item__label {
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-fg-muted;
  font-weight: $font-weight-semibold;
}

.meta-item__value {
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
}

.meta-item__sub {
  font-size: $font-size-xs;
  color: $color-fg-muted;
}

.coach-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-3;
}
</style>
