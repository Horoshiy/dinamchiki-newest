<script setup lang="ts">
// Шапка миссии дня: тема, дата, слоган клуба.
import { computed } from 'vue'

const props = defineProps<{ theme: string; dayKey: string; weekday: number; slogan: string }>()

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const DAYS = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

const dateLabel = computed(() => {
  const [, m, d] = props.dayKey.split('-').map(Number)
  return `${d} ${MONTHS[(m ?? 1) - 1]}`
})
const dayName = computed(() => DAYS[props.weekday] ?? '')
</script>

<template>
  <header class="mission-card ab-card ab-rise">
    <div class="mission-card__radar" aria-hidden="true"><span /></div>
    <div class="mission-card__body">
      <span class="ab-eyebrow">Миссия дня · {{ dateLabel }} · {{ dayName }}</span>
      <h1 class="mission-card__title">{{ theme || 'Ежедневная миссия агента' }}</h1>
      <p class="mission-card__slogan">{{ slogan }}</p>
    </div>
  </header>
</template>

<style scoped lang="scss">
.mission-card { position: relative; overflow: hidden; padding: 26px 28px; }
.mission-card__body { position: relative; z-index: 1; }
.mission-card__title { font-size: clamp(1.5rem, 4vw, 2.2rem); margin: 10px 0 12px; }
.mission-card__slogan {
  margin: 0; font-family: var(--ab-font-mono); font-size: 0.8rem; letter-spacing: 0.14em;
  color: var(--ab-lime); text-transform: uppercase;
}
.mission-card__radar { position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%;
  border: 1px solid var(--ab-line); opacity: 0.5;
  background: radial-gradient(circle, rgba(53, 224, 255, 0.08), transparent 70%); }
.mission-card__radar::before { content: ''; position: absolute; inset: 30px; border-radius: 50%; border: 1px solid var(--ab-line); }
.mission-card__radar span { position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(53, 224, 255, 0.35), transparent 25%);
  animation: ab-sweep 4s linear infinite; }
@media (prefers-reduced-motion: reduce) { .mission-card__radar span { animation: none; } }
</style>