<script setup lang="ts">
// Ввод кода игрока: 10 символов Crockford base32.
// Поле принимает только латинские буквы и цифры — кириллица и прочее отбрасываются,
// чтобы русская раскладка не превращалась в другой код.
import { computed, ref } from 'vue'
import { formatAgentCode, normalizeAgentCode } from '../utils/agentCode'

const props = defineProps<{ modelValue: string; loading?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [string]; submit: [] }>()

const clean = computed(() => normalizeAgentCode(props.modelValue))
const grouped = computed(() => formatAgentCode(props.modelValue))
// Символы вне латиницы и цифр не попадают в поле — говорим об этом явно.
// Флаг держится, пока поле не очищено: символ мог быть отброшен на первом
// нажатии, и к последнему вводу кириллицы в поле уже не видно.
const dropped = ref(false)

// codeCharsBefore — сколько букв и цифр кода стоит до каретки (дефисы не считаем).
// Считаем по нормализованному префиксу: иначе строчные буквы (ввод с
// автокапитализацией выключенным) обнуляются в счёте, каретка уезжает влево,
// и следующая буква вставляется ПЕРЕД предыдущей — «9NE» превращается в «9EN».
function codeCharsBefore(raw: string, caret: number): number {
  return normalizeAgentCode(raw.slice(0, caret)).length
}

// caretAfterCode — позиция каретки после n-й буквы кода. Если дальше дефис,
// перескакиваем его: следующая буква вводится в следующую группу.
function caretAfterCode(display: string, n: number): number {
  if (n <= 0) return 0
  let seen = 0
  for (let i = 0; i < display.length; i++) {
    if (/[A-Za-z0-9]/.test(display[i])) {
      seen++
      if (seen === n) return display[i + 1] === '-' ? i + 2 : i + 1
    }
  }
  return display.length
}

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const raw = el.value
  const caret = el.selectionStart ?? raw.length
  const next = normalizeAgentCode(raw)
  if (/[^\u0020-\u007E]/.test(raw)) dropped.value = true
  if (raw.trim() === '') dropped.value = false
  emit('update:modelValue', next)
  const display = formatAgentCode(next)
  if (el.value !== display) {
    el.value = display
    // Каретку возвращаем на своё место: иначе после переформатирования
    // ввода курсор уезжает в конец поля.
    const pos = caretAfterCode(display, codeCharsBefore(raw, caret))
    el.setSelectionRange(pos, pos)
  }
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
        inputmode="latin"
        lang="en"
        autocomplete="off"
        autocapitalize="characters"
        autocorrect="off"
        spellcheck="false"
        maxlength="13"
        placeholder="XXXX-XXXX-XX"
        :disabled="loading"
        @input="onInput"
        @keydown="onKey"
      />
      <span class="code-input__count">{{ clean.length }}/10</span>
    </div>
    <p v-if="dropped && clean.length < 10" class="code-input__warn" role="alert">
      Русские буквы не подходят — переключи раскладку на английскую.
    </p>
    <p v-else class="code-input__hint ab-faint">Код из 10 символов — на карточке, которую дал тренер. Только латинские буквы и цифры.</p>
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
.code-input__warn { font-size: 0.82rem; margin: 0; color: var(--ab-cyan); }
@media (max-width: 480px) {
  .code-input__raw { font-size: 1.15rem; letter-spacing: 0.12em; padding: 0 12px; }
  .code-input__raw::placeholder { letter-spacing: 0.1em; }
  .code-input__count { padding-right: 12px; font-size: 0.75rem; }
}
</style>
