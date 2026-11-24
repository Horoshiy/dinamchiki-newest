<script setup lang="ts">
// Предложение сменить категорию по итогам недели: вверх (≥90%) или вниз (≤50%).
import type { QuizOffer } from '../api/base.types'
import { fmtQuizPoints } from '../utils/quizPoints'

defineProps<{ offer: QuizOffer; busy: boolean }>()
const emit = defineEmits<{ decide: ['accept' | 'decline'] }>()
</script>

<template>
  <section class="quiz-offer ab-card" :class="offer.direction === 'up' ? 'is-up' : 'is-down'">
    <p class="quiz-offer__title">
      {{ offer.direction === 'up' ? '🚀 Отличный результат!' : 'На этой неделе было непросто.' }}
      Можно перейти в категорию «{{ offer.target_title }}» — с недели {{ offer.from_week }}.
    </p>
    <p class="quiz-offer__text">
      <template v-if="offer.direction === 'up'">
        Ответы из прежней категории пойдут с коэффициентом 75%:
      </template>
      <template v-else>
        Ответы из прежней категории засчитаются ×1,25:
      </template>
      сейчас это {{ fmtQuizPoints(offer.points_now) }} → {{ fmtQuizPoints(offer.points_after) }} баллов.
      Уже открытые недели доигрываются в прежней категории.
    </p>
    <div class="quiz-offer__actions">
      <button class="ab-btn ab-btn--lime" type="button" :disabled="busy" @click="emit('decide', 'accept')">
        Перейти в «{{ offer.target_title }}»
      </button>
      <button class="ab-btn ab-btn--ghost" type="button" :disabled="busy" @click="emit('decide', 'decline')">
        Остаться
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.quiz-offer { padding: 20px; display: flex; flex-direction: column; gap: 10px; border-color: rgba(255, 176, 32, 0.45); }
.quiz-offer__title { margin: 0; font-weight: 700; }
.quiz-offer__text { margin: 0; color: var(--ab-text-dim); line-height: 1.55; font-size: 0.95rem; }
.quiz-offer__actions { display: flex; flex-wrap: wrap; gap: 10px; }
</style>