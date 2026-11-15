<script setup lang="ts">
// Футбольная цель дня: одиночный выбор из 4 вариантов (чипы).
defineProps<{ options: string[]; modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const ICONS = ['⚡', '🎯', '🤝', '🛡️', '🔥', '⭐', '🚀', '🏆']
</script>

<template>
  <div class="goal" role="radiogroup" aria-label="Цель дня">
    <button
      v-for="(opt, i) in options"
      :key="opt"
      type="button"
      class="goal__opt"
      :class="{ 'is-active': modelValue === opt }"
      role="radio"
      :aria-checked="modelValue === opt"
      @click="emit('update:modelValue', opt)"
    >
      <span class="goal__icon">{{ ICONS[i % ICONS.length] }}</span>
      <span class="goal__text">{{ opt }}</span>
      <span class="goal__check" aria-hidden="true">✓</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.goal { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.goal__opt {
  position: relative; display: flex; align-items: center; gap: 12px; min-height: 72px; padding: 14px 16px;
  border-radius: var(--ab-radius-sm); background: rgba(120, 150, 255, 0.06);
  border: 1px solid var(--ab-line); color: var(--ab-text); cursor: pointer;
  font-size: 1rem; font-weight: 600; text-align: left; transition: all 150ms ease;
  -webkit-tap-highlight-color: transparent;
}
.goal__opt:hover { border-color: var(--ab-line-strong); transform: translateY(-2px); }
.goal__icon { font-size: 1.6rem; }
.goal__text { flex: 1; }
.goal__check { opacity: 0; color: var(--ab-lime); font-weight: 800; transition: opacity 150ms ease; }
.goal__opt.is-active {
  background: linear-gradient(180deg, rgba(59, 109, 255, 0.35), rgba(30, 80, 216, 0.2));
  border-color: var(--ab-blue-bright); color: #fff;
  box-shadow: 0 0 0 1px var(--ab-blue-bright), 0 8px 26px rgba(30, 80, 216, 0.3);
}
.goal__opt.is-active .goal__check { opacity: 1; }
@media (max-width: 480px) { .goal { grid-template-columns: 1fr; } }
</style>