<script setup lang="ts">
// Мечта в футболе: свободный текст с мягким лимитом и счётчиком.
import { computed } from 'vue'

const props = withDefaults(defineProps<{ modelValue?: string; maxLen?: number }>(), { maxLen: 200 })
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const len = computed(() => (props.modelValue ?? '').length)
function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value.slice(0, props.maxLen))
}
</script>

<template>
  <div class="dream">
    <textarea
      class="ab-input dream__area"
      :value="modelValue"
      :maxlength="maxLen"
      rows="4"
      placeholder="Например: забить гол в девятку или сыграть на большом стадионе…"
      @input="onInput"
    />
    <div class="dream__foot">
      <span class="ab-faint">Мечты сбываются у тех, кто тренируется 💪</span>
      <span class="dream__count" :class="{ 'is-near': len > maxLen - 20 }">{{ len }}/{{ maxLen }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dream { display: flex; flex-direction: column; gap: 8px; }
.dream__area { font-size: 1.05rem; }
.dream__area:focus { border-color: var(--ab-cyan); }
.dream__foot { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
.dream__count { font-family: var(--ab-font-mono); color: var(--ab-text-faint); }
.dream__count.is-near { color: var(--ab-amber); }
</style>