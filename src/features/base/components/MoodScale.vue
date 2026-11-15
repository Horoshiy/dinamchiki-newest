<script setup lang="ts">
// Настрой: шкала 1–5 с лицами. Значение — целое 1..5 (индекс + 1).
defineProps<{ options: string[]; modelValue?: number }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()
const FACES = ['😫', '😕', '😐', '🙂', '😄']
</script>

<template>
  <div class="mood" role="radiogroup" aria-label="Настрой">
    <button
      v-for="(label, i) in options"
      :key="i"
      type="button"
      class="mood__opt"
      :class="{ 'is-active': modelValue === i + 1 }"
      role="radio"
      :aria-checked="modelValue === i + 1"
      @click="emit('update:modelValue', i + 1)"
    >
      <span class="mood__face">{{ FACES[i] ?? '🙂' }}</span>
      <span class="mood__label">{{ label }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.mood { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.mood__opt {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  min-height: 96px; padding: 12px 6px; border-radius: var(--ab-radius-sm);
  background: rgba(120, 150, 255, 0.06); border: 1px solid var(--ab-line);
  color: var(--ab-text-dim); cursor: pointer; transition: all 150ms ease;
  -webkit-tap-highlight-color: transparent;
}
.mood__opt:hover { border-color: var(--ab-line-strong); transform: translateY(-2px); }
.mood__face { font-size: 2rem; filter: grayscale(0.4); transition: filter 150ms ease, transform 150ms ease; }
.mood__label { font-size: 0.78rem; text-align: center; line-height: 1.2; }
.mood__opt.is-active {
  background: linear-gradient(180deg, rgba(59, 109, 255, 0.35), rgba(30, 80, 216, 0.2));
  border-color: var(--ab-blue-bright); color: #fff;
  box-shadow: 0 0 0 1px var(--ab-blue-bright), 0 8px 26px rgba(30, 80, 216, 0.3);
}
.mood__opt.is-active .mood__face { filter: none; transform: scale(1.18); }
@media (max-width: 480px) {
  .mood { gap: 6px; }
  .mood__opt { min-height: 84px; padding: 10px 2px; }
  .mood__face { font-size: 1.6rem; }
  .mood__label { font-size: 0.66rem; }
}
</style>