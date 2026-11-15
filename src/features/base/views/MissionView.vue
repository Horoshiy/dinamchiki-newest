<script setup lang="ts">
// Ежедневная миссия: один вопрос на экран → награда. Боль >= 3 → экран заботы.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBaseAuth } from '../stores/baseAuth'
import { useBaseSound } from '../stores/baseSound'
import { useMission } from '../composables/useMission'
import type { SubmitResult } from '../api/base.types'
import MissionCard from '../components/MissionCard.vue'
import QuestionRenderer from '../components/QuestionRenderer.vue'
import RewardReveal from '../components/RewardReveal.vue'
import AttentionScreen from '../components/AttentionScreen.vue'

const auth = useBaseAuth()
const sound = useBaseSound()
const router = useRouter()
const { mission, loading, error, answers, submitting, result, load, isAnswered, requiredDone, setAnswer, submit } = useMission()

const step = ref(0)
const stage = ref<'questions' | 'attention' | 'reward'>('questions')

const questions = computed(() => mission.value?.questions ?? [])
const current = computed(() => questions.value[step.value])
const isLast = computed(() => step.value === questions.value.length - 1)
const canAdvance = computed(() => !!current.value && (!current.value.is_required || isAnswered(current.value)))

const displayResult = computed<SubmitResult | null>(() => {
  if (result.value) return result.value
  const m = mission.value
  if (m?.completed && m.reward) {
    return {
      already: true, xp_granted: m.reward.xp_granted, total_xp: auth.me?.xp ?? 0,
      streak: auth.me?.streak_current ?? 0, streak_best: auth.me?.streak_best ?? 0,
      rank: auth.me?.rank ?? 'Новичок', new_badges: [], needs_attention: m.reward.needs_attention,
      motivation: m.reward.motivation, joke: m.reward.joke, attention_message: m.reward.attention_message,
    }
  }
  return null
})

function next() {
  if (!canAdvance.value) return
  sound.play('click')
  if (isLast.value) void doSubmit()
  else step.value++
}
function back() {
  sound.play('click')
  if (step.value > 0) step.value--
}
function jump(i: number) {
  sound.play('click')
  step.value = i
}
async function doSubmit() {
  const res = await submit()
  if (!res) return
  stage.value = res.needs_attention ? 'attention' : 'reward'
}
function toProgress() {
  void router.push({ name: 'base-progress' })
}

onMounted(async () => {
  if (auth.childToken && !auth.me) await auth.loadMe().catch(() => {})
  await load()
  if (mission.value?.completed) stage.value = 'reward'
})
</script>

<template>
  <div class="mission">
    <!-- Загрузка -->
    <div v-if="loading" class="mission__loading ab-card">
      <span class="mission__spinner" aria-hidden="true" />
      <p class="ab-dim">Получаем миссию дня…</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error && !mission" class="mission__error ab-card">
      <p class="ab-alert ab-alert--error">{{ error }}</p>
      <button class="ab-btn ab-btn--ghost" type="button" @click="load">Попробовать снова</button>
    </div>

    <template v-else-if="mission">
      <!-- Награда / экран заботы -->
      <template v-if="stage === 'attention'">
        <AttentionScreen :message="displayResult?.attention_message" @ok="stage = 'reward'" />
      </template>
      <template v-else-if="stage === 'reward' && displayResult">
        <RewardReveal :result="displayResult" @done="toProgress" />
      </template>

      <!-- Вопросы -->
      <template v-else>
        <MissionCard :theme="mission.theme" :day-key="mission.day_key" :weekday="mission.weekday" :slogan="mission.slogan" />

        <div class="mission__dots" role="tablist" aria-label="Вопросы миссии">
          <button
            v-for="(q, i) in questions" :key="q.id" type="button"
            class="mission__dot" :class="{ 'is-current': i === step, 'is-done': isAnswered(q) }"
            :aria-label="`Вопрос ${i + 1}`" :aria-selected="i === step" role="tab"
            @click="jump(i)"
          />
        </div>

        <section v-if="current" :key="current.id" class="mission__question ab-card ab-rise">
          <span class="ab-eyebrow">Вопрос {{ step + 1 }} из {{ questions.length }}</span>
          <h2 class="mission__q-text">{{ current.text }}</h2>
          <QuestionRenderer
            :question="current"
            :model-value="answers[current.id]"
            @update:model-value="setAnswer"
          />
        </section>

        <p v-if="error" class="ab-alert ab-alert--error">{{ error }}</p>

        <div class="mission__actions">
          <button class="ab-btn ab-btn--ghost" type="button" :disabled="step === 0" @click="back">← Назад</button>
          <button
            class="ab-btn mission__next" :class="{ 'ab-btn--lime': isLast }" type="button"
            :disabled="!canAdvance || submitting || (isLast && !requiredDone)"
            @click="next"
          >
            {{ submitting ? 'Отправляем…' : isLast ? 'Завершить миссию 🚀' : 'Дальше →' }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.mission { display: flex; flex-direction: column; gap: 18px; }
.mission__loading, .mission__error { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px 24px; text-align: center; }
.mission__spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--ab-line); border-top-color: var(--ab-cyan); animation: ab-sweep 0.9s linear infinite; }
.mission__dots { display: flex; justify-content: center; gap: 10px; }
.mission__dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid var(--ab-line-strong); background: rgba(120, 150, 255, 0.1); cursor: pointer; transition: all 150ms ease; padding: 0; }
.mission__dot.is-done { background: var(--ab-lime); border-color: var(--ab-lime); }
.mission__dot.is-current { transform: scale(1.4); box-shadow: 0 0 0 3px rgba(53, 224, 255, 0.25); border-color: var(--ab-cyan); }
.mission__question { padding: 26px 24px; }
.mission__q-text { font-size: clamp(1.3rem, 4vw, 1.7rem); margin: 10px 0 22px; }
.mission__actions { display: flex; gap: 12px; }
.mission__next { flex: 1; }
@media (max-width: 560px) {
  .mission__actions { position: sticky; bottom: 0; padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
    background: linear-gradient(180deg, transparent, rgba(6, 9, 18, 0.9) 30%); }
}
@media (prefers-reduced-motion: reduce) { .mission__spinner { animation-duration: 2s; } }
</style>