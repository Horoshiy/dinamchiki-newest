<script setup lang="ts">
// Недели сезона: новые первыми. Открытые — играть, сыгранные — разбор.
import type { QuizWeek } from '../api/base.types'

defineProps<{ weeks: QuizWeek[]; busy: boolean }>()
const emit = defineEmits<{ start: [number]; review: [number] }>()

const sorted = (weeks: QuizWeek[]) => [...weeks].sort((a, b) => b.week - a.week)

function label(w: QuizWeek): string {
  switch (w.status) {
    case 'finished': return `✅ ${w.correct}/${w.total}`
    case 'in_progress': return `⏸ отвечено ${w.pos} из ${w.total}`
    case 'closed': return '🔒 закрыта'
    default: return '▶️ играть'
  }
}
</script>

<template>
  <section class="quiz-weeks ab-card">
    <span class="ab-eyebrow">Недели</span>
    <div v-if="weeks.length === 0" class="ab-dim">Недели ещё не открылись — первые вопросы в воскресенье в 10:00.</div>
    <div class="quiz-weeks__list">
      <button
        v-for="w in sorted(weeks)" :key="w.week" type="button"
        class="quiz-weeks__row" :class="`is-${w.status}`"
        :disabled="busy || w.status === 'closed'"
        @click="w.status === 'finished' ? emit('review', w.week) : emit('start', w.week)"
      >
        <span class="quiz-weeks__num">Неделя {{ w.week }}</span>
        <span class="quiz-weeks__status">{{ label(w) }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.quiz-weeks { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.quiz-weeks__list { display: grid; gap: 8px; }
.quiz-weeks__row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  min-height: 52px; padding: 10px 16px; border-radius: var(--ab-radius-sm);
  background: rgba(120, 150, 255, 0.06); border: 1px solid var(--ab-line);
  color: var(--ab-text); cursor: pointer; font-size: 0.98rem; transition: all 150ms ease;
}
.quiz-weeks__row:not(:disabled):hover { border-color: var(--ab-blue-bright); transform: translateY(-1px); }
.quiz-weeks__row:disabled { cursor: default; opacity: 0.55; }
.quiz-weeks__num { font-family: var(--ab-font-display); font-weight: 700; }
.quiz-weeks__status { color: var(--ab-text-dim); font-weight: 600; }
.quiz-weeks__row.is-open .quiz-weeks__status, .quiz-weeks__row.is-in_progress .quiz-weeks__status { color: var(--ab-cyan); }
.quiz-weeks__row.is-finished .quiz-weeks__status { color: var(--ab-lime); }
</style>