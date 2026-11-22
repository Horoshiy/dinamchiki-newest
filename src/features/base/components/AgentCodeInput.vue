<script setup lang="ts">
// Ввод кода игрока: 10 символов Crockford base32.
// Нормализацию (O→0, I/L→1) делает сервер; здесь — верхний регистр и чистка.
import { computed } from 'vue'

const props = defineProps<{ modelValue: string; loading?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [string]; submit: [] }>()

const clean = computed(() => props.modelValue.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))
const grouped = computed(() => {
  const c = clean.value
  return [c.slice(0, 4), c.slice(4, 8), c.slice(8, 10)].filter(Boolean).join('-')
})

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
  emit('update:modelValue', v)
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && clean.value.length === 10) emit('submit')
}
</script>

<template>
  <div class="code-input">
    <label class="ab-eyebrow" for="agent-code">Код игрока</label>
    <div class="code-input__field" :class="{ 'is-full': clean.length === 10 }">
      <input
        id="agent-code"
        class="code-input__raw"
        :value="grouped"
        type="text"
        inputmode="text"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        maxlength="12"
        placeholder="XXXX-XXXX-XX"
        :disabled="loading"
        @input="onInput"
        @keydown="onKey"
      />
      <span class="code-input__count">{{ clean.length }}/10</span>
    </div>
    <p class="code-input__hint ab-faint">Код из 10 символов — на карточке, которую дал тренер.</p>
  </div>
</template>

<style scoped lang="scss">
.code-input { display: flex; flex-direction: column; gap: 10px; }
.code-input__field {
  position: relative; display: flex; align-items: center;
  background: rgba(6, 9, 18, 0.8); border: 1px solid var(--ab-line-strong);
  border-radius: var(--ab-radius-sm); transition: border-color 160ms ease, box-shadow 160ms ease;
}
.code-input__field:focus-within { border-color: var(--ab-cyan); box-shadow: 0 0 0 3px rgba(53, 224, 255, 0.18); }
.code-input__field.is-full { border-color: var(--ab-lime); box-shadow: 0 0 0 3px rgba(198, 242, 78, 0.16); }
.code-input__raw {
  flex: 1; min-width: 0; min-height: 64px; padding: 0 18px; background: transparent; border: none; outline: none;
  color: var(--ab-text); font-family: var(--ab-font-mono); font-size: 1.5rem; letter-spacing: 0.22em;
  text-transform: uppercase;
}
.code-input__raw::placeholder { color: var(--ab-text-faint); letter-spacing: 0.18em; }
.code-input__count { flex-shrink: 0; padding-right: 16px; font-family: var(--ab-font-mono); font-size: 0.8rem; color: var(--ab-text-faint); }
.code-input__hint { font-size: 0.82rem; margin: 0; }
@media (max-width: 480px) {
  .code-input__raw { font-size: 1.15rem; letter-spacing: 0.12em; padding: 0 12px; }
  .code-input__raw::placeholder { letter-spacing: 0.1em; }
  .code-input__count { padding-right: 12px; font-size: 0.75rem; }
}
</style>