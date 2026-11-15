<script setup lang="ts">
// Рендерит один вопрос нужным компонентом и собирает AnswerInput.
// Звук выбора централизован здесь, чтобы компоненты ввода оставались чистыми.
import { computed } from 'vue'
import type { AnswerInput, BaseQuestion } from '../api/base.types'
import { useBaseSound } from '../stores/baseSound'
import MoodScale from './MoodScale.vue'
import EnergySlider from './EnergySlider.vue'
import PainScale from './PainScale.vue'
import GoalPicker from './GoalPicker.vue'
import DreamInput from './DreamInput.vue'

const props = defineProps<{ question: BaseQuestion; modelValue?: AnswerInput }>()
const emit = defineEmits<{ 'update:modelValue': [AnswerInput] }>()
const sound = useBaseSound()

const scaleValue = computed(() => props.modelValue?.value_int || undefined)
const textValue = computed(() => props.modelValue?.value_text ?? '')
const multiValue = computed(() => props.modelValue?.values ?? [])

function setScale(v: number) {
  sound.play('select')
  emit('update:modelValue', { question_id: props.question.id, value_int: v })
}
function setText(v: string) {
  emit('update:modelValue', { question_id: props.question.id, value_text: v })
}
function toggleMulti(opt: string) {
  sound.play('select')
  const next = multiValue.value.includes(opt)
    ? multiValue.value.filter((x) => x !== opt)
    : [...multiValue.value, opt]
  emit('update:modelValue', { question_id: props.question.id, values: next })
}

const scaleComponent = computed(() => {
  if (props.question.template_key === 'energy') return EnergySlider
  if (props.question.template_key === 'pain') return PainScale
  return MoodScale
})
</script>

<template>
  <div class="q-render">
    <component
      :is="scaleComponent"
      v-if="question.kind === 'scale'"
      :options="question.options" :model-value="scaleValue" @update:model-value="setScale"
    />
    <GoalPicker
      v-else-if="question.kind === 'single'"
      :options="question.options" :model-value="textValue" @update:model-value="setText"
    />
    <DreamInput
      v-else-if="question.kind === 'text'"
      :max-len="question.max_len" :model-value="textValue" @update:model-value="setText"
    />
    <div v-else-if="question.kind === 'multi'" class="q-render__multi">
      <button
        v-for="opt in question.options" :key="opt" type="button"
        class="ab-chip" :class="{ 'is-active': multiValue.includes(opt) }"
        @click="toggleMulti(opt)"
      >{{ opt }}</button>
    </div>
    <PainScale
      v-else
      :options="question.options" :model-value="scaleValue" @update:model-value="setScale"
    />
  </div>
</template>

<style scoped lang="scss">
.q-render__multi { display: flex; flex-wrap: wrap; gap: 10px; }
</style>