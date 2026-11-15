<script setup lang="ts">
// Самочувствие: шкала 1–5 (бэкенд хранит pain как scale, не карту тела).
// Силуэт слева подсвечивается по уровню; при >=3 — мягкое предупреждение.
import { computed } from 'vue'

const props = defineProps<{ options: string[]; modelValue?: number }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()

const level = computed(() => props.modelValue ?? 0)
const hue = computed(() => ['#3ddc84', '#a8e05f', '#ffb020', '#ff7a45', '#ff3d71'][level.value - 1] ?? '#61709c')
const warn = computed(() => level.value >= 3)
</script>

<template>
  <div class="pain">
    <div class="pain__body" aria-hidden="true">
      <svg viewBox="0 0 60 100" width="60" height="100">
        <g :fill="hue" :fill-opacity="level ? 0.28 + level * 0.12 : 0.12" :stroke="hue" stroke-width="1.5">
          <circle cx="30" cy="14" r="9" />
          <rect x="18" y="26" width="24" height="34" rx="9" />
          <rect x="6" y="28" width="9" height="28" rx="4.5" />
          <rect x="45" y="28" width="9" height="28" rx="4.5" />
          <rect x="20" y="60" width="9" height="34" rx="4.5" />
          <rect x="31" y="60" width="9" height="34" rx="4.5" />
        </g>
      </svg>
    </div>
    <div class="pain__scale" role="radiogroup" aria-label="Самочувствие">
      <button
        v-for="(label, i) in options"
        :key="i"
        type="button"
        class="pain__opt"
        :class="{ 'is-active': modelValue === i + 1 }"
        :style="modelValue === i + 1 ? { borderColor: hue, boxShadow: `0 0 0 1px ${hue}, 0 6px 22px ${hue}55` } : {}"
        role="radio"
        :aria-checked="modelValue === i + 1"
        @click="emit('update:modelValue', i + 1)"
      >
        <span class="pain__dot" :style="{ background: ['#3ddc84', '#a8e05f', '#ffb020', '#ff7a45', '#ff3d71'][i] }" />
        <span>{{ label }}</span>
      </button>
    </div>
    <p v-if="warn" class="pain__warn">
      Если сильно болит — обязательно скажи тренеру и родителям. Это не слабость, а забота о себе.
    </p>
  </div>
</template>

<style scoped lang="scss">
.pain { display: flex; gap: 18px; align-items: flex-start; flex-wrap: wrap; }
.pain__body { flex: 0 0 auto; display: grid; place-items: center; padding: 8px; border-radius: var(--ab-radius-sm); background: rgba(6, 9, 18, 0.5); border: 1px solid var(--ab-line); }
.pain__body svg { transition: all 200ms ease; }
.pain__scale { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 8px; }
.pain__opt {
  display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 16px;
  border-radius: var(--ab-radius-sm); background: rgba(120, 150, 255, 0.06);
  border: 1px solid var(--ab-line); color: var(--ab-text); font-size: 0.98rem; font-weight: 600;
  cursor: pointer; transition: all 150ms ease; text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.pain__opt:hover { border-color: var(--ab-line-strong); background: rgba(120, 150, 255, 0.12); }
.pain__opt.is-active { background: rgba(255, 61, 113, 0.08); color: #fff; }
.pain__dot { width: 14px; height: 14px; border-radius: 50%; flex: 0 0 auto; box-shadow: 0 0 10px currentColor; }
.pain__warn {
  flex-basis: 100%; margin: 4px 0 0; padding: 12px 16px; border-radius: var(--ab-radius-sm);
  background: rgba(255, 176, 32, 0.12); border: 1px solid rgba(255, 176, 32, 0.45);
  color: #ffe9c2; font-size: 0.9rem; line-height: 1.45;
}
</style>