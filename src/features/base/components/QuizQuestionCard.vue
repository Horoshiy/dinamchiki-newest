<script setup lang="ts">
// Вопрос квиза: текст, коллаж (если есть), варианты. После ответа — подсветка
// верного/выбранного, объяснение и медиа ответа. Верный ответ приходит только
// после ответа сервера.
import { onBeforeUnmount, ref, watch } from 'vue'
import * as api from '../api/base.api'
import type { QuizAnswer, QuizQuestion } from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'

const props = defineProps<{ question: QuizQuestion; feedback: QuizAnswer | null; busy: boolean }>()
const emit = defineEmits<{ answer: [number] }>()
const auth = useBaseAuth()

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const qImage = ref('')
const ansMedia = ref('')
const ansMediaType = ref<'photo' | 'video'>('photo')

function revoke(url: string) {
  if (url) URL.revokeObjectURL(url)
}

watch(() => [props.question.question_id, props.question.has_image] as const, async ([id, hasImage]) => {
  revoke(qImage.value)
  qImage.value = ''
  if (!hasImage || !auth.childToken) return
  try { qImage.value = await api.fetchQuizMedia(auth.childToken, id, 'question') } catch { /* без картинки */ }
}, { immediate: true })

watch(() => props.feedback?.answer_media, async (media) => {
  revoke(ansMedia.value)
  ansMedia.value = ''
  if (!media || !auth.childToken) return
  ansMediaType.value = media.type
  try { ansMedia.value = await api.fetchQuizMedia(auth.childToken, media.question_id, 'answer') } catch { /* без медиа */ }
}, { immediate: true })

onBeforeUnmount(() => {
  revoke(qImage.value)
  revoke(ansMedia.value)
})

function optClass(i: number): string {
  const fb = props.feedback
  if (!fb) return ''
  if (i === fb.correct_idx) return 'is-correct'
  if (i === fb.chosen_idx) return 'is-wrong'
  return 'is-dim'
}
</script>

<template>
  <section class="quiz-q ab-card ab-rise">
    <span class="ab-eyebrow">Вопрос {{ question.pos + 1 }} из {{ question.total }}</span>
    <img v-if="qImage" :src="qImage" class="quiz-q__image" alt="Картинка к вопросу" />
    <h2 class="quiz-q__text">{{ question.text }}</h2>

    <div class="quiz-q__opts" role="group" aria-label="Варианты ответа">
      <button
        v-for="(opt, i) in question.options" :key="i" type="button"
        class="quiz-q__opt" :class="optClass(i)"
        :disabled="!!feedback || busy"
        @click="emit('answer', i)"
      >
        <span v-if="question.has_image" class="quiz-q__letter">{{ LETTERS[i] }}</span>
        <span class="quiz-q__opt-text">{{ opt }}</span>
        <span v-if="feedback && i === feedback.correct_idx" class="quiz-q__mark" aria-hidden="true">✅</span>
        <span v-else-if="feedback && i === feedback.chosen_idx" class="quiz-q__mark" aria-hidden="true">❌</span>
      </button>
    </div>

    <div v-if="feedback" class="quiz-q__feedback" :class="feedback.is_correct ? 'is-good' : 'is-bad'">
      <p class="quiz-q__verdict">{{ feedback.is_correct ? '✅ Верно! +1 балл' : '❌ Не совсем.' }}</p>
      <p v-if="feedback.explanation" class="quiz-q__explain">{{ feedback.explanation }}</p>
      <p v-if="feedback.option_note" class="quiz-q__explain">Твой ответ: {{ feedback.option_note }}</p>
      <img v-if="ansMedia && ansMediaType === 'photo'" :src="ansMedia" class="quiz-q__image" alt="Картинка к ответу" />
      <video v-else-if="ansMedia && ansMediaType === 'video'" :src="ansMedia" class="quiz-q__video" controls playsinline />
    </div>
  </section>
</template>

<style scoped lang="scss">
.quiz-q { padding: 26px 24px; display: flex; flex-direction: column; gap: 16px; }
.quiz-q__text { font-size: clamp(1.25rem, 4vw, 1.6rem); margin: 0; }
.quiz-q__image { width: 100%; max-height: 420px; object-fit: contain; border-radius: var(--ab-radius-sm); border: 1px solid var(--ab-line); background: rgba(6, 9, 18, 0.5); }
.quiz-q__video { width: 100%; max-height: 420px; border-radius: var(--ab-radius-sm); border: 1px solid var(--ab-line); }
.quiz-q__opts { display: grid; gap: 10px; }
.quiz-q__opt {
  display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 12px 16px;
  border-radius: var(--ab-radius-sm); background: rgba(120, 150, 255, 0.06);
  border: 1px solid var(--ab-line); color: var(--ab-text); cursor: pointer;
  font-size: 1rem; font-weight: 600; text-align: left; transition: all 150ms ease;
  -webkit-tap-highlight-color: transparent;
}
.quiz-q__opt:not(:disabled):hover { border-color: var(--ab-blue-bright); transform: translateY(-1px); }
.quiz-q__opt:disabled { cursor: default; }
.quiz-q__letter {
  flex: none; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px; background: rgba(120, 150, 255, 0.14); font-family: var(--ab-font-display); font-weight: 800;
}
.quiz-q__opt-text { flex: 1; }
.quiz-q__opt.is-correct { border-color: var(--ab-lime); background: rgba(143, 191, 38, 0.16); }
.quiz-q__opt.is-wrong { border-color: #ff3d71; background: rgba(255, 61, 113, 0.14); }
.quiz-q__opt.is-dim { opacity: 0.55; }
.quiz-q__feedback { border-top: 1px solid var(--ab-line); padding-top: 14px; display: flex; flex-direction: column; gap: 10px; }
.quiz-q__verdict { margin: 0; font-weight: 800; font-size: 1.05rem; }
.quiz-q__feedback.is-good .quiz-q__verdict { color: var(--ab-lime); }
.quiz-q__feedback.is-bad .quiz-q__verdict { color: #ffd7e2; }
.quiz-q__explain { margin: 0; color: var(--ab-text-dim); line-height: 1.55; }
</style>