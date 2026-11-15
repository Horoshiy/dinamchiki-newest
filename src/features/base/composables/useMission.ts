// Состояние ежедневной разминки: загрузка, черновик, ответы, отправка.
// Один вопрос на экран; черновик автосохраняется, чтобы не потерять ответы.
import { computed, ref } from 'vue'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { AnswerInput, BaseMission, BaseQuestion, SubmitResult } from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'

function errText(e: unknown): string {
  return e instanceof BaseApiError ? e.message : 'Не удалось связаться с Подтрибункой. Попробуй ещё раз.'
}

export function useMission() {
  const auth = useBaseAuth()
  const mission = ref<BaseMission | null>(null)
  const loading = ref(false)
  const error = ref('')
  const answers = ref<Record<number, AnswerInput>>({})
  const submitting = ref(false)
  const result = ref<SubmitResult | null>(null)

  let draftTimer: ReturnType<typeof setTimeout> | undefined

  async function load() {
    if (!auth.childToken) return
    loading.value = true
    error.value = ''
    try {
      const m = await api.getTodayMission(auth.childToken)
      mission.value = m
      answers.value = {}
      if (m.draft) for (const a of m.draft) answers.value[a.question_id] = a
    } catch (e) {
      error.value = errText(e)
    } finally {
      loading.value = false
    }
  }

  function isAnswered(q: BaseQuestion): boolean {
    const a = answers.value[q.id]
    if (!a) return false
    if (q.kind === 'scale' || q.kind === 'body') return !!a.value_int
    if (q.kind === 'multi') return (a.values?.length ?? 0) > 0
    return !!(a.value_text && a.value_text.trim())
  }

  const requiredDone = computed(() =>
    mission.value?.questions.filter((q) => q.is_required).every(isAnswered) ?? false,
  )

  function setAnswer(a: AnswerInput) {
    answers.value[a.question_id] = a
    clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
      if (auth.childToken && mission.value && !mission.value.completed) {
        void api.saveDraft(auth.childToken, Object.values(answers.value)).catch(() => {})
      }
    }, 800)
  }

  async function submit(): Promise<SubmitResult | null> {
    if (!auth.childToken || !mission.value) return null
    submitting.value = true
    error.value = ''
    try {
      const res = await api.submitAnswers(auth.childToken, Object.values(answers.value))
      result.value = res
      clearTimeout(draftTimer)
      await auth.loadMe().catch(() => {})
      return res
    } catch (e) {
      error.value = errText(e)
      return null
    } finally {
      submitting.value = false
    }
  }

  return { mission, loading, error, answers, submitting, result, load, isAnswered, requiredDone, setAnswer, submit }
}