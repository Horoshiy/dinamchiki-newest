<script setup lang="ts">
/**
 * Детальная страница тренера (`/coach/:id`).
 *
 * Данные из GraphQL через useCoachQuery (с mock-fallback).
 */
import { withPlural } from '@/shared/lib/plural'
import { computed, ref, toRef} from 'vue'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/shared/ui/base/Breadcrumbs.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import TeamSchedule from '@/widgets/team/TeamSchedule.vue'
import PhotoGrid from '@/widgets/gallery/PhotoGrid.vue'
import LightboxModal from '@/widgets/gallery/LightboxModal.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconAward from '@/shared/ui/icons/IconAward.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import IconBadge from '@/shared/ui/icons/IconBadge.vue'
import IconStar from '@/shared/ui/icons/IconStar.vue'
import IconHeart from '@/shared/ui/icons/IconHeart.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import type { Component } from 'vue'
import type { Coach, CoachAchievement, CoachSpec } from '@/entities/coach/coach.types'
import { COACH_SPEC_LABELS } from '@/entities/coach/coach.types'
import { useCoachQuery } from '@/shared/api/composables'
import { SIGNUP_ROUTE, LOAD_ERROR_HINT } from '@/shared/config/club'
import { NOT_FOUND_META, usePageMeta } from '@/shared/lib/page-meta'

const props = defineProps<{ id: string }>()

const idRef = toRef(props, 'id')
const { data, loading, error } = useCoachQuery(idRef)

const coach = computed<Coach | null>(() => {
  const d = data.value as { coach?: Coach | null } | null
  return d?.coach ?? null
})

usePageMeta(() => {
  if (loading.value) return null
  const c = coach.value
  if (!c) return NOT_FOUND_META
  const about = c.description.trim()
  return {
    title: `${c.fullName} — тренер по футболу`,
    description: about
      ? `${c.fullName}, ${c.role.toLowerCase()} ДФК «Динамчики» (Ставрополь). ${about}`.slice(0, 300)
      : `${c.fullName}, ${c.role.toLowerCase()} детского футбольного клуба «Динамчики» в Ставрополе.`,
  }
})


const crumbs = computed(() => [
  { label: 'Главная',   to: '/' },
  { label: 'Тренеры',   to: '/coaches' },
  { label: coach.value?.fullName ?? '…' },
])

// Краткая галерея тренера (этап 6 ТЗ) — с тем же lightbox, что и /gallery.
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

const initials = computed<string>(() => {
  if (!coach.value) return ''
  const parts = coach.value.fullName.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts[1]?.[0] ?? ''
  return (first + last).toUpperCase()
})

const primarySpecLabel = computed<string>(() => {
  if (!coach.value || coach.value.specialization.length === 0) return ''
  const first = coach.value.specialization[0] as CoachSpec
  return COACH_SPEC_LABELS[first]
})

const achievementIcons: Readonly<Record<CoachAchievement['iconKey'], Component>> = {
  trophy: IconTrophy,
  badge:  IconBadge,
  star:   IconStar,
  heart:  IconHeart,
}
</script>

<template>
  <div class="coach-detail">
    <section class="container">
      <Breadcrumbs :items="crumbs" />
    </section>

    <section v-if="loading" class="container">
      <LoadingSkeleton variant="block" height="320px" />
    </section>

    <section v-else-if="error" class="container">
      <EmptyState
        title="Не удалось загрузить тренера"
        :description="LOAD_ERROR_HINT"
        :icon="IconBall"
        variant="card"
      />
    </section>

    <section v-else-if="!coach" class="container">
      <EmptyState
        title="Тренер не найден"
        :description="`Тренера с id «${props.id}» нет в клубе. Возможно, он в архиве.`"
        :icon="IconBall"
        variant="card"
      >
        <template #action>
          <RouterLink to="/coaches" custom v-slot="{ navigate }">
            <BaseButton variant="outline" :icon-left="IconArrowRight" @click="navigate">
              Все тренеры
            </BaseButton>
          </RouterLink>
        </template>
      </EmptyState>
    </section>

    <template v-else>
      <!-- Hero -->
      <section
        class="container coach-detail__hero"
        :style="{ '--avatar-gradient': coach.avatarGradient }"
      >
        <div class="coach-detail__hero-photo" aria-hidden="true">
          <span class="coach-detail__initials">{{ initials }}</span>
        </div>

        <div class="coach-detail__hero-body">
          <p class="coach-detail__spec">{{ primarySpecLabel }}</p>
          <h1 class="coach-detail__name">{{ coach.fullName }}</h1>
          <p class="coach-detail__role">{{ coach.role }}</p>
          <p class="coach-detail__quote">«{{ coach.description }}»</p>

          <div class="coach-detail__meta">
            <div v-if="coach.experienceYears > 0" class="meta-item">
              <span class="meta-item__label">Опыт</span>
              <span class="meta-item__value">{{ withPlural(coach.experienceYears, ['год', 'года', 'лет']) }}</span>
              <span class="meta-item__sub">тренерской работы</span>
            </div>
            <div class="meta-item">
              <span class="meta-item__label">Специализация</span>
              <span class="meta-item__value">
                {{ coach.specialization.map(s => COACH_SPEC_LABELS[s]).join(' · ') }}
              </span>
              <span class="meta-item__sub">{{ coach.ageGroups.join(' · ') }}</span>
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

      <!-- Достижения -->
      <section v-if="coach.achievements.length" class="container">
        <SectionTitle eyebrow="Резюме" title="Опыт и квалификация" />
        <div class="coach-detail__achievements">
          <div
            v-for="(a, i) in coach.achievements"
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

      <!-- Команды тренера -->
      <section v-if="coach.teams.length" class="container">
        <SectionTitle
          eyebrow="Команды"
          :title="`Текущие команды (${coach.teams.length})`"
        />
        <div class="coach-detail__teams">
          <div v-for="t in coach.teams" :key="t.id" class="coach-detail__team">
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

      <!-- Галерея тренера -->
      <section v-if="coach.gallery.length" class="container">
        <SectionTitle
          eyebrow="Фото"
          :title="`${coach.fullName.split(' ')[0]} в работе`"
        />
        <PhotoGrid :photos="coach.gallery" @open="openLightbox" />
        <LightboxModal
          v-model:open="lightboxOpen"
          v-model:current-index="lightboxIndex"
          :photos="coach.gallery"
        />
      </section>

      <!-- CTA-блок -->
      <section class="container coach-detail__cta">
        <div class="coach-detail__cta-card">
          <IconAward :size="40" />
          <h2 class="coach-detail__cta-title">
            Хотите тренироваться у {{ coach.fullName.split(' ')[0] }}?
          </h2>
          <p class="coach-detail__cta-desc">
            Оставьте заявку — тренер свяжется с вами и предложит удобное время
            для пробной тренировки.
          </p>
          <div class="coach-detail__cta-actions">
            <BaseButton :to="SIGNUP_ROUTE" size="lg" variant="solid" :icon-left="IconCalendar">
              Записаться на пробную
            </BaseButton>
            <BaseButton size="lg" variant="outline" :to="'/contacts'">
              Все контакты
            </BaseButton>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.coach-detail {
  display: flex;
  flex-direction: column;
  gap: $space-12;
  padding: $space-6 0 $space-16;
}

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

.coach-detail__cta-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-4;
  padding: $space-12 $space-8;
  background: linear-gradient(135deg, $color-brand-600 0%, $color-brand-700 100%);
  border-radius: $radius-xl;
  color: $color-white;
  box-shadow: $shadow-lg;

  svg { color: $color-white; }
}

.coach-detail__cta-title {
  font-family: $font-family-display;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: $font-weight-extrabold;
  margin: 0;
  letter-spacing: -0.01em;
}

.coach-detail__cta-desc {
  font-size: $font-size-md;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  max-width: 50ch;
}

.coach-detail__cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  justify-content: center;
  margin-top: $space-2;

  :deep(.btn--outline) {
    color: $color-white;
    border-color: rgba(255, 255, 255, 0.6);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: $color-white;
      color: $color-white;
    }
  }
}

@media (max-width: $bp-md) {
  .coach-detail__team-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
