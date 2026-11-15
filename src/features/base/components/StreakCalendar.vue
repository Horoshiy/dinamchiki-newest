<script setup lang="ts">
// Календарь серии: 30 дней, текущая и лучшая серия. Огонёк «горит»,
// пока серия жива. Последний день — сегодня.
import { computed } from 'vue'
import type { DayStat } from '../api/base.types'

const props = defineProps<{ calendar: DayStat[]; current: number; best: number }>()

const todayKey = computed(() => props.calendar.at(-1)?.day_key ?? '')
function dayNum(dk: string): string { return dk.slice(8, 10) }
</script>

<template>
  <div class="streak">
    <div class="streak__head">
      <div class="streak__flame" :class="{ 'is-cold': current === 0 }">
        <span class="streak__fire">🔥</span>
        <div>
          <div class="streak__num">{{ current }}</div>
          <div class="streak__cap">{{ current === 1 ? 'день подряд' : 'дней подряд' }}</div>
        </div>
      </div>
      <div class="streak__best">
        <span class="ab-eyebrow">Рекорд</span>
        <span class="streak__best-num">{{ best }}</span>
      </div>
    </div>
    <div class="streak__grid" role="img" :aria-label="`Серия ${current} дней, рекорд ${best}`">
      <div
        v-for="d in calendar"
        :key="d.day_key"
        class="streak__cell"
        :class="{ 'is-done': d.completed, 'is-today': d.day_key === todayKey }"
        :title="d.day_key"
      >
        <span>{{ dayNum(d.day_key) }}</span>
      </div>
    </div>
    <p class="streak__hint ab-faint">Заходи каждый день — серия растёт. Один пропуск в 30 дней прощается.</p>
  </div>
</template>

<style scoped lang="scss">
.streak { display: flex; flex-direction: column; gap: 16px; }
.streak__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.streak__flame { display: flex; align-items: center; gap: 12px; }
.streak__fire { font-size: 2.4rem; animation: ab-flame 1.6s ease-in-out infinite; }
.streak__flame.is-cold .streak__fire { filter: grayscale(1); opacity: 0.4; animation: none; }
.streak__num { font-family: var(--ab-font-display); font-weight: 800; font-size: 2rem; color: var(--ab-amber); line-height: 1; }
.streak__cap { font-size: 0.8rem; color: var(--ab-text-dim); }
.streak__best { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.streak__best-num { font-family: var(--ab-font-display); font-weight: 800; font-size: 1.5rem; color: var(--ab-cyan); }
.streak__grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
.streak__cell {
  aspect-ratio: 1; display: grid; place-items: center; border-radius: 8px;
  background: rgba(120, 150, 255, 0.06); border: 1px solid var(--ab-line);
  font-family: var(--ab-font-mono); font-size: 0.66rem; color: var(--ab-text-faint);
}
.streak__cell.is-done {
  background: linear-gradient(180deg, rgba(198, 242, 78, 0.85), rgba(143, 191, 38, 0.7));
  border-color: var(--ab-lime); color: #0c1400; font-weight: 700;
}
.streak__cell.is-today { box-shadow: 0 0 0 2px var(--ab-cyan); }
.streak__hint { font-size: 0.8rem; margin: 0; }
@media (max-width: 480px) { .streak__grid { grid-template-columns: repeat(7, 1fr); } }
</style>