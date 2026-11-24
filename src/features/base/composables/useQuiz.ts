// Состояние воскресного квиза: запись, недели, вопросы, разбор, рейтинг.
// Зачёт общий с ботом: при 409 (уже отвечено / неделя закрыта) перечитываем
// состояние — попытку мог продолжить родитель в Telegram.
import { ref } from 'vue'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type {
  QuizAnswer, QuizLeaderboard, QuizQuestion, QuizReview, QuizStart, QuizState, QuizWeekResult,
} from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'

function errText(e: unknown): string {
  return e instanceof BaseApiError ? e.message : 'Не удалось связаться с Подтрибункой. Попробуй ещё раз.'
}

// Конфликт с ботом или закрытая неделя — состояние устарело, перечитываем.
const REFETCH_CODES = ['already_answered', 'week_closed', 'offer_stale', 'category_locked', 'season_closed']

export function useQuiz() {
  const auth = useBaseAuth()
  const state = ref<QuizState | null>(null)
  const loading = ref(false)
  const error = ref('')
  const noSeason = ref(false)
  const screen = ref<'home' | 'play' | 'review'>('home')

  const attempt = ref<QuizStart | null>(null)
  const question = ref<QuizQuestion | null>(null)
  const feedback = ref<QuizAnswer | null>(null)
  const result = ref<QuizWeekResult | null>(null)
  const answering = ref(false)

  const review = ref<QuizReview | null>(null)
  const board = ref<QuizLeaderboard | null>(null)
  const boardCat = ref('k1')
  const boardLoading = ref(false)

  async function load() {
    if (!auth.childToken) return
    loading.value = true
    error.value = ''
    try {
      state.value = await api.getQuizState(auth.childToken)
      noSeason.value = false
      const cat = state.value.participant?.category ?? 'k1'
      await loadBoard(cat)
    } catch (e) {
      if (e instanceof BaseApiError && e.code === 'no_season') {
        noSeason.value = true
        state.value = null
      } else {
        error.value = errText(e)
      }
    } finally {
      loading.value = false
    }
  }

  async function join(category: string, confirm = false): Promise<boolean> {
    if (!auth.childToken) return false
    error.value = ''
    try {
      await api.joinQuiz(auth.childToken, category, confirm)
      await load()
      return true
    } catch (e) {
      error.value = errText(e)
      return false
    }
  }

  async function startWeek(week: number) {
    if (!auth.childToken) return
    error.value = ''
    loading.value = true
    try {
      const start = await api.startQuizWeek(auth.childToken, week)
      attempt.value = start
      feedback.value = null
      result.value = null
      if (start.finished) {
        await loadReview(week)
        return
      }
      question.value = start.question ?? null
      screen.value = 'play'
    } catch (e) {
      await handleError(e)
    } finally {
      loading.value = false
    }
  }

  async function answer(optionIdx: number) {
    if (!auth.childToken || !attempt.value || !question.value || answering.value || feedback.value) return
    answering.value = true
    error.value = ''
    try {
      const res = await api.answerQuiz(auth.childToken, attempt.value.attempt_id, question.value.pos, optionIdx)
      feedback.value = res
      if (res.finished) result.value = res.result ?? null
    } catch (e) {
      await handleError(e)
    } finally {
      answering.value = false
    }
  }

  function nextQuestion() {
    if (!feedback.value) return
    if (feedback.value.finished) return
    question.value = feedback.value.next_question ?? null
    feedback.value = null
  }

  async function loadReview(week: number) {
    if (!auth.childToken) return
    error.value = ''
    loading.value = true
    try {
      review.value = await api.getQuizWeek(auth.childToken, week)
      screen.value = 'review'
    } catch (e) {
      await handleError(e)
    } finally {
      loading.value = false
    }
  }

  async function loadBoard(category: string) {
    if (!auth.childToken) return
    boardCat.value = category
    boardLoading.value = true
    try {
      board.value = await api.getQuizLeaderboard(auth.childToken, category)
    } catch {
      board.value = null
    } finally {
      boardLoading.value = false
    }
  }

  async function decideLevel(action: 'accept' | 'decline') {
    if (!auth.childToken) return
    error.value = ''
    try {
      await api.decideQuizLevel(auth.childToken, action)
      // Решение могло прийти с экрана итогов — возвращаемся к неделям,
      // иначе останется старая карточка результата со сгоревшим предложением.
      await goHome()
    } catch (e) {
      await handleError(e)
    }
  }

  async function goHome() {
    screen.value = 'home'
    attempt.value = null
    question.value = null
    feedback.value = null
    result.value = null
    review.value = null
    await load()
  }

  async function handleError(e: unknown) {
    if (e instanceof BaseApiError && e.code && REFETCH_CODES.includes(e.code)) {
      await goHome()
      return
    }
    error.value = errText(e)
  }

  return {
    state, loading, error, noSeason, screen,
    attempt, question, feedback, result, answering,
    review, board, boardCat, boardLoading,
    load, join, startWeek, answer, nextQuestion, loadReview, loadBoard, decideLevel, goHome,
  }
}