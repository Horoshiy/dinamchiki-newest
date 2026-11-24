<script setup lang="ts">
// Итоги недели: верные ответы, баллы, место в категории.
import type { QuizWeekResult } from '../api/base.types'
import { fmtQuizPoints } from '../utils/quizPoints'

defineProps<{ result: QuizWeekResult }>()
const emit = defineEmits<{ done: [] }>()
</script>

<template>
  <section class="quiz-result ab-card ab-rise">
    <span class="ab-eyebrow">Итоги недели</span>
    <h2 class="quiz-result__title">🏁 Неделя {{ result.week }} пройдена!</h2>
    <p class="quiz-result__score">
      {{ result.correct }} из {{ result.total }}
      <span v-if="result.total > 0 && result.correct * 10 >= 9 * result.total"> ⭐</span>
    </p>
    <p class="quiz-result__meta">
      Всего {{ fmtQuizPoints(result.points) }} баллов
      <template v-if="result.place > 0"> · {{ result.place }}-е место из {{ result.place_total }} в категории</template>
    </p>
    <p v-if="result.xp_granted > 0" class="quiz-result__xp">+{{ result.xp_granted }} XP в Подтрибунке</p>
    <button class="ab-btn ab-btn--lime" type="button" @click="emit('done')">К неделям и рейтингу</button>
  </section>
</template>

<style scoped lang="scss">
.quiz-result { padding: 32px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.quiz-result__title { margin: 0; font-size: clamp(1.3rem, 4vw, 1.7rem); }
.quiz-result__score { margin: 0; font-size: 2rem; font-weight: 800; font-family: var(--ab-font-display); color: var(--ab-lime); }
.quiz-result__meta { margin: 0 0 8px; color: var(--ab-text-dim); }
.quiz-result__xp { margin: 0 0 8px; font-weight: 700; color: var(--ab-cyan); }
</style>