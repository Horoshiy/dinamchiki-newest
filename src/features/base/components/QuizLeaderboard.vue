<script setup lang="ts">
// Сезонный рейтинг категории: топ-10 + своё место. Общий с ботом.
import type { QuizLeaderboard } from '../api/base.types'
import { fmtQuizPoints } from '../utils/quizPoints'

defineProps<{ board: QuizLeaderboard | null; loading: boolean; category: string }>()
const emit = defineEmits<{ select: [string] }>()

const CATS = [
  { code: 'k1', short: '3–6' },
  { code: 'k2', short: '7–8' },
  { code: 'k3', short: '9–11' },
  { code: 'k4', short: '12–15' },
  { code: 'ad', short: 'Взрослые' },
]
</script>

<template>
  <section class="quiz-board ab-card">
    <div class="quiz-board__head">
      <span class="ab-eyebrow">🏆 Рейтинг</span>
      <div class="quiz-board__cats" role="tablist" aria-label="Категории">
        <button
          v-for="c in CATS" :key="c.code" type="button"
          class="ab-chip" :class="{ 'is-active': category === c.code }"
          role="tab" :aria-selected="category === c.code"
          @click="emit('select', c.code)"
        >
          {{ c.short }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="ab-dim">Загружаем рейтинг…</div>
    <template v-else-if="board">
      <p class="quiz-board__sub">
        {{ board.title }} ·
        <template v-if="board.season_over">итоги сезона</template>
        <template v-else-if="board.current_week > 0">неделя {{ board.current_week }} из {{ board.weeks }}</template>
        <template v-else>сезон скоро начнётся</template>
      </p>
      <p v-if="board.total === 0" class="ab-dim">Пока в этой категории никого нет.</p>
      <ol v-else class="quiz-board__list">
        <li v-for="row in board.items" :key="row.place" class="quiz-board__row" :class="{ 'is-me': row.is_me }">
          <span class="quiz-board__place">{{ row.place }}</span>
          <span class="quiz-board__name">{{ row.name }}<template v-if="row.is_me"> ◀</template></span>
          <span class="quiz-board__points">{{ fmtQuizPoints(row.points) }}</span>
        </li>
        <template v-if="board.me">
          <li class="quiz-board__gap" aria-hidden="true">…</li>
          <li class="quiz-board__row is-me">
            <span class="quiz-board__place">{{ board.me.place }}</span>
            <span class="quiz-board__name">{{ board.me.name }} ◀</span>
            <span class="quiz-board__points">{{ fmtQuizPoints(board.me.points) }}</span>
          </li>
        </template>
      </ol>
      <p v-if="board.total > 0" class="quiz-board__total">Всего участников: {{ board.total }}</p>
    </template>
  </section>
</template>

<style scoped lang="scss">
.quiz-board { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.quiz-board__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.quiz-board__cats { display: flex; flex-wrap: wrap; gap: 6px; }
.quiz-board__sub { margin: 0; color: var(--ab-text-dim); font-size: 0.92rem; }
.quiz-board__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.quiz-board__row {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  border-radius: var(--ab-radius-sm); background: rgba(120, 150, 255, 0.05); border: 1px solid transparent;
}
.quiz-board__row.is-me { border-color: var(--ab-blue-bright); background: rgba(59, 109, 255, 0.16); }
.quiz-board__place { flex: none; width: 28px; font-family: var(--ab-font-display); font-weight: 800; color: var(--ab-text-dim); }
.quiz-board__row.is-me .quiz-board__place { color: var(--ab-cyan); }
.quiz-board__name { flex: 1; font-weight: 600; }
.quiz-board__points { font-weight: 800; color: var(--ab-lime); }
.quiz-board__gap { color: var(--ab-text-dim); padding: 0 14px; }
.quiz-board__total { margin: 0; color: var(--ab-text-dim); font-size: 0.9rem; }
</style>