<script setup lang="ts">
// Воскресный квиз «Динамчиков»: запись → недели → вопросы → итоги → рейтинг.
// Зачёт общий с ботом: одна попытка на неделю, одни баллы.
import { computed, onMounted } from 'vue'
import { useBaseAuth } from '../stores/baseAuth'
import { useQuiz } from '../composables/useQuiz'
import type { QuizAnswer, QuizQuestion, QuizReviewItem } from '../api/base.types'
import { fmtQuizPoints } from '../utils/quizPoints'
import QuizJoinCard from '../components/QuizJoinCard.vue'
import QuizWeekList from '../components/QuizWeekList.vue'
import QuizQuestionCard from '../components/QuizQuestionCard.vue'
import QuizResultCard from '../components/QuizResultCard.vue'
import QuizLeaderboard from '../components/QuizLeaderboard.vue'
import QuizLevelOffer from '../components/QuizLevelOffer.vue'

const auth = useBaseAuth()
const q = useQuiz()

const participant = computed(() => q.state.value?.participant ?? null)
const season = computed(() => q.state.value?.season ?? null)

// Разбор недели рендерится теми же карточками, что и игра: отвеченные —
// с подсветкой и объяснением, неотвеченные — заблокированы.
function reviewQuestion(item: QuizReviewItem): QuizQuestion {
  return {
    pos: item.pos, question_id: item.question_id, text: item.text,
    options: item.options, has_image: item.has_image, total: q.review.value?.total ?? item.pos + 1,
  }
}
function reviewFeedback(item: QuizReviewItem): QuizAnswer | null {
  if (!item.answered || item.chosen_idx === null || item.correct_idx === null || item.is_correct === null) return null
  return {
    is_correct: item.is_correct, correct_idx: item.correct_idx, chosen_idx: item.chosen_idx,
    explanation: item.explanation ?? '', option_note: item.option_note ?? '',
    finished: true, points: 0, place: 0, place_total: 0, answer_media: item.answer_media,
  }
}

onMounted(() => {
  void q.load()
})
</script>

<template>
  <div class="quiz">
    <!-- Загрузка -->
    <div v-if="q.loading.value && !q.state.value" class="quiz__loading ab-card">
      <span class="quiz__spinner" aria-hidden="true" />
      <p class="ab-dim">Загружаем квиз…</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="q.error.value && !q.state.value && !q.noSeason.value" class="quiz__error ab-card">
      <p class="ab-alert ab-alert--error">{{ q.error.value }}</p>
      <button class="ab-btn ab-btn--ghost" type="button" @click="q.load">Попробовать снова</button>
    </div>

    <!-- Сезон не активен -->
    <section v-else-if="q.noSeason.value" class="quiz__empty ab-card ab-rise">
      <span class="ab-eyebrow">Воскресный квиз</span>
      <h2>Новый сезон скоро начнётся 🙌</h2>
      <p class="ab-dim">Мы пришлём сообщение, когда откроются первые вопросы.</p>
    </section>

    <template v-else-if="q.state.value">
      <!-- Запись -->
      <template v-if="!participant">
        <QuizJoinCard v-if="q.state.value.join" :join="q.state.value.join" :busy="q.loading.value" @join="(code, confirm) => q.join(code, confirm)" />
        <p v-if="q.error.value" class="ab-alert ab-alert--error">{{ q.error.value }}</p>
      </template>

      <template v-else>
        <!-- Шапка участника -->
        <section class="quiz__head ab-card">
          <div class="quiz__head-main">
            <span class="ab-eyebrow">⚽ Воскресный квиз</span>
            <h2 class="quiz__title">{{ participant.category_title }}</h2>
            <p class="quiz__stats">
              {{ fmtQuizPoints(participant.points) }} баллов
              <template v-if="participant.place > 0"> · {{ participant.place }}-е место из {{ participant.place_total }}</template>
            </p>
            <p v-if="participant.pending_category" class="quiz__pending">
              ⏭ С недели {{ participant.pending_from_week }} — новая категория
            </p>
          </div>
          <p v-if="season" class="quiz__season ab-dim">
            <template v-if="season.over">Сезон завершён — итоговые места ниже.</template>
            <template v-else-if="season.current_week > 0">
              Неделя {{ season.current_week }} из {{ season.weeks }} · новые вопросы по воскресеньям в 10:00
              <template v-if="season.frozen"><br />🔒 Финишная прямая: отвечаем только на текущую неделю</template>
            </template>
            <template v-else>Сезон скоро стартует — записаться можно уже сейчас.</template>
          </p>
        </section>

        <p v-if="q.error.value" class="ab-alert ab-alert--error">{{ q.error.value }}</p>

        <!-- Игра -->
        <template v-if="q.screen.value === 'play'">
          <template v-if="q.result.value">
            <QuizResultCard :result="q.result.value" @done="q.goHome" />
            <QuizLevelOffer v-if="q.result.value.offer" :offer="q.result.value.offer" :busy="q.loading.value" @decide="q.decideLevel" />
          </template>
          <template v-else-if="q.question.value">
            <QuizQuestionCard :question="q.question.value" :feedback="q.feedback.value" :busy="q.answering.value" @answer="q.answer" />
            <div v-if="q.feedback.value && !q.feedback.value.finished" class="quiz__actions">
              <button class="ab-btn quiz__next" type="button" @click="q.nextQuestion">Следующий вопрос →</button>
            </div>
            <div class="quiz__actions">
              <button class="ab-btn ab-btn--ghost" type="button" @click="q.goHome">← К неделям</button>
            </div>
          </template>
        </template>

        <!-- Разбор недели -->
        <template v-else-if="q.screen.value === 'review' && q.review.value">
          <section class="quiz__review-head ab-card">
            <span class="ab-eyebrow">Разбор</span>
            <h2 class="quiz__title">Неделя {{ q.review.value.week }} · {{ q.review.value.correct }}/{{ q.review.value.total }}</h2>
            <button class="ab-btn ab-btn--ghost" type="button" @click="q.goHome">← К неделям</button>
          </section>
          <QuizQuestionCard
            v-for="item in q.review.value.items" :key="item.question_id"
            :question="reviewQuestion(item)" :feedback="reviewFeedback(item)" :busy="true"
          />
        </template>

        <!-- Главный экран: недели + рейтинг -->
        <template v-else>
          <QuizLevelOffer v-if="q.state.value.offer" :offer="q.state.value.offer" :busy="q.loading.value" @decide="q.decideLevel" />
          <QuizWeekList :weeks="q.state.value.weeks" :busy="q.loading.value" @start="q.startWeek" @review="q.loadReview" />
          <QuizLeaderboard :board="q.board.value" :loading="q.boardLoading.value" :category="q.boardCat.value" @select="q.loadBoard" />
        </template>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.quiz { display: flex; flex-direction: column; gap: 18px; }
.quiz__loading, .quiz__error, .quiz__empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px 24px; text-align: center; }
.quiz__spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--ab-line); border-top-color: var(--ab-cyan); animation: ab-sweep 0.9s linear infinite; }
.quiz__head { padding: 22px 24px; display: flex; flex-direction: column; gap: 8px; }
.quiz__title { margin: 4px 0 0; font-size: clamp(1.3rem, 4vw, 1.7rem); }
.quiz__stats { margin: 4px 0 0; font-weight: 700; color: var(--ab-lime); }
.quiz__pending { margin: 4px 0 0; color: var(--ab-cyan); font-weight: 600; }
.quiz__season { margin: 6px 0 0; font-size: 0.92rem; line-height: 1.5; }
.quiz__actions { display: flex; gap: 12px; }
.quiz__next { flex: 1; }
.quiz__review-head { padding: 20px 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
@media (prefers-reduced-motion: reduce) { .quiz__spinner { animation-duration: 2s; } }
</style>