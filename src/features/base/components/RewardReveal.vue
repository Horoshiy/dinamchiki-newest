<script setup lang="ts">
// Награда после миссии: мотивация + шутка + XP/серия/звание/значки.
// Считает XP вверх, сыплет конфетти (уважает prefers-reduced-motion).
import { computed, onMounted, ref } from 'vue'
import type { SubmitResult } from '../api/base.types'
import { useBaseSound } from '../stores/baseSound'
import RankBadge from './RankBadge.vue'

const props = defineProps<{ result: SubmitResult }>()
const emit = defineEmits<{ done: [] }>()
const sound = useBaseSound()

const shownXP = ref(props.result.already ? props.result.xp_granted : 0)
const confetti = ref<Array<Record<string, string>>>([])

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const COLORS = ['#1e50d8', '#35e0ff', '#c6f24e', '#ffb020', '#ff3d71', '#3b6dff']

const headline = computed(() => (props.result.already ? 'Миссия уже выполнена' : 'Миссия выполнена!'))

onMounted(() => {
  if (props.result.already) return
  sound.play('fanfare')
  if (reduced) {
    shownXP.value = props.result.xp_granted
  } else {
    const target = props.result.xp_granted
    const start = performance.now()
    const dur = 900
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur)
      shownXP.value = Math.round(target * (1 - Math.pow(1 - k, 3)))
      if (k < 1) requestAnimationFrame(tick)
      else if (props.result.new_badges.length) sound.play('badge')
    }
    requestAnimationFrame(tick)
    confetti.value = Array.from({ length: 44 }, () => ({
      left: `${Math.random() * 100}%`,
      background: COLORS[Math.floor(Math.random() * COLORS.length)],
      animationDelay: `${Math.random() * 0.5}s`,
      animationDuration: `${2.4 + Math.random() * 1.8}s`,
      width: `${6 + Math.random() * 8}px`,
      height: `${8 + Math.random() * 10}px`,
    }))
  }
})
</script>

<template>
  <div class="reward">
    <div v-if="confetti.length" class="reward__confetti" aria-hidden="true">
      <span v-for="(c, i) in confetti" :key="i" :style="c" />
    </div>

    <div class="reward__hero ab-card ab-pop">
      <span class="ab-eyebrow">{{ result.already ? 'Отчёт агента' : 'Секретный отчёт' }}</span>
      <h2 class="reward__title">{{ headline }}</h2>
      <div class="reward__xp">
        <span class="reward__xp-num">+{{ shownXP }}</span>
        <span class="reward__xp-cap">XP · всего {{ result.total_xp }}</span>
      </div>
      <div class="reward__stats">
        <div class="reward__stat">
          <span class="reward__stat-icon">🔥</span>
          <span class="reward__stat-num">{{ result.streak }}</span>
          <span class="reward__stat-cap">серия</span>
        </div>
        <RankBadge :rank="result.rank" size="sm" />
        <div class="reward__stat">
          <span class="reward__stat-icon">🏅</span>
          <span class="reward__stat-num">{{ result.streak_best }}</span>
          <span class="reward__stat-cap">рекорд</span>
        </div>
      </div>
    </div>

    <div v-if="result.new_badges.length" class="reward__badges ab-card ab-rise ab-rise-1">
      <span class="ab-eyebrow">Новые значки</span>
      <div class="reward__badges-row">
        <div v-for="b in result.new_badges" :key="b.key" class="reward__badge ab-pop">
          <span class="reward__badge-icon">{{ b.icon }}</span>
          <span class="reward__badge-title">{{ b.title }}</span>
          <span class="reward__badge-desc ab-faint">{{ b.description }}</span>
        </div>
      </div>
    </div>

    <div v-if="result.needs_attention" class="ab-alert ab-alert--warn ab-rise ab-rise-1">
      {{ result.attention_message || 'Расскажи тренеру и родителям, что болит — вместе разберёмся.' }}
    </div>

    <div class="reward__cards">
      <div class="reward__card reward__card--motivation ab-card ab-rise ab-rise-2">
        <span class="ab-eyebrow">Мотивация дня</span>
        <p>{{ result.motivation }}</p>
      </div>
      <div class="reward__card reward__card--joke ab-card ab-rise ab-rise-3">
        <span class="ab-eyebrow">Шутка дня</span>
        <p>{{ result.joke }}</p>
      </div>
    </div>

    <button class="ab-btn ab-btn--lime ab-btn--block ab-rise ab-rise-4" type="button" @click="emit('done')">
      В моё досье →
    </button>
  </div>
</template>

<style scoped lang="scss">
.reward { position: relative; display: flex; flex-direction: column; gap: 16px; }
.reward__confetti { position: fixed; inset: 0; z-index: 5; pointer-events: none; overflow: hidden; }
.reward__confetti span { position: absolute; top: -10vh; border-radius: 2px; animation: ab-confetti linear forwards; }
.reward__hero { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 30px 24px; }
.reward__title { font-size: clamp(1.5rem, 5vw, 2.1rem); }
.reward__xp { display: flex; flex-direction: column; align-items: center; }
.reward__xp-num {
  font-family: var(--ab-font-display); font-weight: 800; font-size: 3.4rem; line-height: 1;
  color: var(--ab-lime); text-shadow: 0 0 30px rgba(198, 242, 78, 0.5);
}
.reward__xp-cap { font-family: var(--ab-font-mono); font-size: 0.82rem; color: var(--ab-text-dim); letter-spacing: 0.06em; }
.reward__stats { display: flex; align-items: center; justify-content: center; gap: 26px; margin-top: 8px; }
.reward__stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.reward__stat-icon { font-size: 1.4rem; }
.reward__stat-num { font-family: var(--ab-font-display); font-weight: 800; font-size: 1.4rem; color: var(--ab-amber); }
.reward__stat-cap { font-size: 0.72rem; color: var(--ab-text-faint); }
.reward__badges { padding: 20px 22px; }
.reward__badges-row { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 12px; }
.reward__badge { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; width: 120px; }
.reward__badge-icon { font-size: 2.2rem; }
.reward__badge-title { font-family: var(--ab-font-display); font-weight: 700; color: var(--ab-lime); font-size: 0.9rem; }
.reward__badge-desc { font-size: 0.72rem; line-height: 1.3; }
.reward__cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.reward__card { padding: 20px 22px; }
.reward__card p { margin: 10px 0 0; font-size: 1.05rem; line-height: 1.5; }
.reward__card--motivation { border-color: rgba(53, 224, 255, 0.4); }
.reward__card--motivation .ab-eyebrow { color: var(--ab-cyan); }
.reward__card--joke { border-color: rgba(255, 176, 32, 0.4); }
.reward__card--joke .ab-eyebrow { color: var(--ab-amber); }
@media (max-width: 560px) { .reward__cards { grid-template-columns: 1fr; } }
</style>