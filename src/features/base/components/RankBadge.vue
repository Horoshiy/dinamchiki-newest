<script setup lang="ts">
// Эмблема звания: щит игрока с уровнем. Цвет зависит от ступени звания.
import { computed } from 'vue'

const props = withDefaults(defineProps<{ rank: string; xp?: number; size?: 'sm' | 'md' | 'lg' }>(), {
  xp: undefined,
  size: 'md',
})

const RANKS = ['Новичок', 'Игрок', 'Мастер', 'Капитан', 'Легенда клуба']
const COLORS = ['#61709c', '#35e0ff', '#3b6dff', '#c6f24e', '#ffb020']

const tier = computed(() => Math.max(0, RANKS.indexOf(props.rank)))
const color = computed(() => COLORS[tier.value] ?? COLORS[0])
const stars = computed(() => tier.value + 1)
const px = computed(() => ({ sm: 56, md: 92, lg: 132 }[props.size]))
</script>

<template>
  <div class="rank-badge" :class="`rank-badge--${size}`">
    <svg :width="px" :height="px" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient :id="`rg-${tier}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="color" stop-opacity="0.95" />
          <stop offset="1" :stop-color="color" stop-opacity="0.45" />
        </linearGradient>
      </defs>
      <path d="M50 6 L86 20 V50 C86 74 68 88 50 95 C32 88 14 74 14 50 V20 Z"
        :fill="`url(#rg-${tier})`" :stroke="color" stroke-width="2.5" />
      <path d="M50 14 L78 25 V50 C78 69 64 81 50 87 C36 81 22 69 22 50 V25 Z"
        fill="rgba(6,9,18,0.55)" :stroke="color" stroke-width="1" stroke-opacity="0.5" />
      <g :fill="color">
        <template v-for="i in stars" :key="i">
          <circle :cx="50 + (i - (stars + 1) / 2) * 13" cy="42" r="3.4" />
        </template>
      </g>
      <text x="50" y="68" text-anchor="middle" font-size="22" font-weight="800"
        :fill="color" font-family="Manrope, sans-serif">{{ tier + 1 }}</text>
    </svg>
    <div class="rank-badge__meta">
      <span class="rank-badge__title" :style="{ color }">{{ rank }}</span>
      <span v-if="xp !== undefined" class="rank-badge__xp">{{ xp }} XP</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rank-badge { display: inline-flex; flex-direction: column; align-items: center; gap: 8px; }
.rank-badge svg { filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.5)); }
.rank-badge__meta { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.rank-badge__title { font-family: var(--ab-font-display); font-weight: 800; font-size: 1rem; letter-spacing: 0.02em; }
.rank-badge__xp { font-family: var(--ab-font-mono); font-size: 0.78rem; color: var(--ab-lime); }
.rank-badge--lg .rank-badge__title { font-size: 1.3rem; }
.rank-badge--sm .rank-badge__title { font-size: 0.85rem; }
</style>