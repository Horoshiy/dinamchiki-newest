<script setup lang="ts">
/**
 * Детальная страница тренера (`/coach/:id`).
 *
 * Данные из GraphQL через useCoachQuery (с mock-fallback). Секции —
 * виджеты widgets/coach: CoachHero, CoachAchievements, CoachTeams.
 */
import { computed, ref, toRef } from 'vue'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/shared/ui/base/Breadcrumbs.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import CoachHero from '@/widgets/coach/CoachHero.vue'
import CoachAchievements from '@/widgets/coach/CoachAchievements.vue'
import CoachTeams from '@/widgets/coach/CoachTeams.vue'
import PhotoGrid from '@/widgets/gallery/PhotoGrid.vue'
import LightboxModal from '@/widgets/gallery/LightboxModal.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconAward from '@/shared/ui/icons/IconAward.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import type { Coach } from '@/entities/coach/coach.types'
import { useCoachQuery } from '@/shared/api/composables'
import { SIGNUP_ROUTE, LOAD_ERROR_HINT } from '@/shared/config/club'
import { NOT_FOUND_META, usePageMeta } from '@/shared/lib/page-meta'
import { givenName } from '@/shared/lib/person'

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

/** «Дмитрий Михайлович» — для подписей «… в работе» и CTA. */
const name = computed(() => (coach.value ? givenName(coach.value.fullName) : ''))
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
      <CoachHero :coach="coach" />

      <CoachAchievements v-if="coach.achievements.length" :achievements="coach.achievements" />

      <CoachTeams v-if="coach.teams.length" :teams="coach.teams" />

      <!-- Галерея тренера -->
      <section v-if="coach.gallery.length" class="container">
        <SectionTitle
          eyebrow="Фото"
          :title="`${name} в работе`"
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
            Хотите в группу, где тренирует {{ name }}?
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
  // Глобальный стиль h2 красит заголовки в тёмно-синий — на синей карточке
  // заголовок было не прочитать.
  color: $color-white;
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

</style>
