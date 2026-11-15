<script setup lang="ts">
// Энергия: батарея из 5 сегментов. Клик по сегменту задаёт уровень 1..5.
defineProps<{ options: string[]; modelValue?: number }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()
</script>

<template>
  <div class="energy">
    <div class="energy__battery" role="radiogroup" aria-label="Энергия">
      <button
        v-for="(label, i) in options"
        :key="i"
        type="button"
        class="energy__seg"
        :class="{ 'is-on': modelValue !== undefined && modelValue >= i + 1, 'is-pick': modelValue === i + 1 }"
        role="radio"
        :aria-checked="modelValue === i + 1"
        :aria-label="label"
        @click="emit('update:modelValue', i + 1)"
      >
        <span class="energy__bar" />
      </button>
      <span class="energy__cap" aria-hidden="true" />
    </div>
    <div class="energy__labels">
      <span>{{ options[0] }}</span>
      <span class="energy__current" :class="{ 'has-value': modelValue }">
        {{ modelValue ? options[modelValue - 1] : 'Выбери уровень' }}
      </span>
      <span>{{ options[options.length - 1] }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.energy { display: flex; flex-direction: column; gap: 14px; }
.energy__battery { display: flex; align-items: stretch; gap: 6px; }
.energy__seg {
  flex: 1; min-height: 72px; padding: 6px; border-radius: 10px; cursor: pointer;
  background: rgba(120, 150, 255, 0.06); border: 1px solid var(--ab-line);
  display: flex; align-items: flex-end; transition: all 150ms ease;
  -webkit-tap-highlight-color: transparent;
}
.energy__seg:hover { border-color: var(--ab-line-strong); }
.energy__bar { width: 100%; height: 30%; border-radius: 6px; background: rgba(120, 150, 255, 0.15); transition: all 200ms ease; }
.energy__seg:nth-child(1) .energy__bar { height: 22%; }
.energy__seg:nth-child(2) .energy__bar { height: 40%; }
.energy__seg:nth-child(3) .energy__bar { height: 58%; }
.energy__seg:nth-child(4) .energy__bar { height: 78%; }
.energy__seg:nth-child(5) .energy__bar { height: 100%; }
.energy__seg.is-on { border-color: rgba(53, 224, 255, 0.5); }
.energy__seg.is-on .energy__bar { background: linear-gradient(180deg, #7deeff, var(--ab-cyan)); box-shadow: 0 0 14px rgba(53, 224, 255, 0.5); }
.energy__seg.is-pick { box-shadow: 0 0 0 2px var(--ab-cyan); }
.energy__cap { width: 8px; align-self: center; height: 28px; border-radius: 0 4px 4px 0; background: var(--ab-line-strong); }
.energy__labels { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--ab-text-faint); }
.energy__current { font-family: var(--ab-font-display); font-weight: 700; color: var(--ab-text-dim); }
.energy__current.has-value { color: var(--ab-cyan); font-size: 1rem; }
</style>