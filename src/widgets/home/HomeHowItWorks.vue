<script setup lang="ts">
/**
 * Секция «Как проходят тренировки» — шаги слева, визуал справа.
 *
 * Данные из pageContent (useHomeContentQuery).
 */
import { computed } from 'vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import { iconByKey } from '@/shared/ui/icons/registry'
import { useHomeContentQuery } from '@/shared/api/composables'
import type { PageContent } from '@/entities/content/content.types'

const { data, loading } = useHomeContentQuery()

const steps = computed(() => {
  const d = data.value as { pageContent?: PageContent } | null
  return (d?.pageContent?.trainingSteps ?? []).map((s) => ({ ...s, icon: iconByKey(s.iconKey) }))
})
</script>

<template>
  <section class="how-it-works">
    <div class="container">
      <SectionTitle
        eyebrow="Наш подход"
        title="Как проходят тренировки"
      />

      <div class="how-it-works__inner">
        <!-- Слева — список шагов -->
        <div v-if="loading" class="how-it-works__list">
          <LoadingSkeleton v-for="i in 5" :key="i" variant="block" height="80px" />
        </div>
        <ol v-else class="how-it-works__list">
          <li v-for="(s, i) in steps" :key="s.id" class="step">
            <span class="step__num">{{ i + 1 }}</span>
            <span class="step__icon"><component :is="s.icon" :size="24" /></span>
            <div class="step__body">
              <h3 class="step__title">{{ s.title }}</h3>
              <p class="step__desc">{{ s.description }}</p>
            </div>
          </li>
        </ol>

        <!-- Справа — фото-плейсхолдер + бейдж-цитата -->
        <div class="how-it-works__visual" aria-hidden="true">
          <div class="how-it-works__photo">
            <IconBall :size="56" />
            <span>Фото с тренировки</span>
          </div>
          <div class="how-it-works__quote">
            <p class="how-it-works__quote-text">
              «Каждая тренировка — это&nbsp;маленькая&nbsp;игра, в&nbsp;которой ребёнок учится побеждать и&nbsp;проигрывать с&nbsp;достоинством.»
            </p>
            <p class="how-it-works__quote-author">Главный тренер клуба</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.how-it-works {
  padding: $space-16 0;
  background: $color-bg-soft;
}

.how-it-works__inner {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: $space-12;
  align-items: start;

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr;
    gap: $space-10;
  }
}

// ---- Список шагов -------------------------------------------------------
.how-it-works__list {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.step {
  display: grid;
  grid-template-columns: 56px 56px 1fr;
  align-items: flex-start;
  gap: $space-4;
  padding: $space-4 0;
}

.step__num {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $color-brand-500;
  color: $color-brand-500;
  border-radius: 50%;
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: $font-size-xl;
  background: $color-white;
}

.step__icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-brand-50;
  color: $color-brand-500;
  border-radius: 50%;
}

.step__body {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding-top: $space-2;
}

.step__title {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
}

.step__desc {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
}

// ---- Визуал --------------------------------------------------------------
.how-it-works__visual {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}

.how-it-works__photo {
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, $color-brand-100 0%, $color-brand-50 100%);
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-3;
  color: $color-brand-500;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  box-shadow: $shadow-md;
}

.how-it-works__quote {
  padding: $space-6;
  background: $color-white;
  border-radius: $radius-lg;
  border-left: 4px solid $color-brand-500;
  box-shadow: $shadow-sm;
}

.how-it-works__quote-text {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
  line-height: 1.5;
  margin: 0 0 $space-3;
  font-style: italic;
}

.how-it-works__quote-author {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  margin: 0;
}
</style>
