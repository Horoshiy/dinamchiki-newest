<script setup lang="ts">
/**
 * Секция «Как проходят тренировки» — шаги слева, визуал справа.
 *
 * Данные из pageContent (useHomeContentQuery).
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import { useHomeContentQuery } from '@/shared/api/composables'
import type { PageContent } from '@/entities/content/content.types'

const { data, loading } = useHomeContentQuery()

const steps = computed(() => {
  const d = data.value as { pageContent?: PageContent } | null
  return d?.pageContent?.trainingSteps ?? []
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
            <div class="step__body">
              <h3 class="step__title">{{ s.title }}</h3>
              <p class="step__desc">{{ s.description }}</p>
            </div>
          </li>
        </ol>

        <!--
          Справа раньше стоял плейсхолдер «Фото с тренировки» и цитата без
          автора («Главный тренер клуба» — такой должности в клубе нет).
          Заменено на то, что родители спрашивают перед первым визитом.
          Все пункты — из раздела «Сведения», не выдуманные.
        -->
        <aside class="first-visit">
          <p class="first-visit__eyebrow">Перед первой тренировкой</p>
          <h3 class="first-visit__title">Что нужно знать родителю</h3>
          <ul class="first-visit__list">
            <li>Первая тренировка бесплатная — приходите посмотреть, как всё устроено.</li>
            <li>Спортивная форма, кроссовки и вода с собой.</li>
            <li>Поесть — не позднее чем за 1,5–2 часа до занятия.</li>
            <li>Занятие длится 45 минут у детей 3–5 лет и 60 минут начиная с шести.</li>
            <li>Договор заключаем в электронной форме, оплата принимается онлайн — приходить
                с бумагами и наличными не нужно. Из документов понадобится только медицинская
                справка формы 086-у.</li>
          </ul>
          <RouterLink to="/sveden/vacant" class="first-visit__link">
            Порядок зачисления
            <IconArrowRight :size="16" />
          </RouterLink>
        </aside>
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
  grid-template-columns: 56px 1fr;
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

// ---- Блок «Перед первой тренировкой» -------------------------------------
.first-visit {
  padding: $space-8;
  background: $color-white;
  border-radius: $radius-lg;
  border-left: 4px solid $color-brand-500;
  box-shadow: $shadow-sm;
}

.first-visit__eyebrow {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $color-brand-500;
  margin: 0 0 $space-2;
}

.first-visit__title {
  font-family: $font-family-display;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  line-height: 1.25;
  margin: 0 0 $space-5;
}

.first-visit__list {
  list-style: none;
  padding: 0;
  margin: 0 0 $space-6;
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.first-visit__list li {
  position: relative;
  padding-left: $space-6;
  color: $color-fg;
  line-height: $line-height-base;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $color-brand-500;
  }
}

.first-visit__link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
  text-decoration: none;

  &:hover { color: $color-brand-600; text-decoration: underline; }
}

</style>
