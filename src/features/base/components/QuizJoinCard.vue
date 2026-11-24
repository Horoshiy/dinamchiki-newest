<script setup lang="ts">
// Запись в квиз: категория по возрасту (⭐) или на ступень выше — с подтверждением.
import { ref } from 'vue'
import type { QuizJoin } from '../api/base.types'

defineProps<{ join: QuizJoin; busy: boolean }>()
const emit = defineEmits<{ join: [string, boolean] }>()
const confirmCode = ref('')

function pick(code: string, recommended: boolean) {
  if (recommended) {
    emit('join', code, false)
    return
  }
  confirmCode.value = code
}
</script>

<template>
  <section class="quiz-join ab-card ab-rise">
    <span class="ab-eyebrow">Воскресный квиз</span>
    <h2 class="quiz-join__title">⚽ Футбольный квиз «Динамчиков»</h2>
    <p class="quiz-join__text">
      Каждое воскресенье в 10:00 — 10 вопросов о футболе, правилах и ставропольском «Динамо».
      Баллы копятся весь сезон, в конце — призы. Зачёт общий с ботом: можно отвечать и тут, и в Telegram.
    </p>

    <p v-if="join.needs_dob" class="ab-alert ab-alert--info">
      Для записи нужна дата рождения. Попроси родителя записать тебя через бота — там он укажет её, и квиз откроется здесь.
    </p>
    <p v-else-if="join.not_published" class="ab-alert ab-alert--info">
      Записаться можно, только пока ты занимаешься в клубе. Если что-то не так — напишите администратору.
    </p>

    <template v-else-if="!confirmCode">
      <p class="quiz-join__hint">В какой категории будешь играть? Можно по возрасту (⭐) или на ступень выше.</p>
      <div class="quiz-join__opts">
        <button
          v-for="opt in join.allowed" :key="opt.code" type="button"
          class="ab-btn" :class="{ 'ab-btn--lime': opt.recommended }" :disabled="busy"
          @click="pick(opt.code, opt.recommended)"
        >
          {{ opt.recommended ? '⭐ ' : '' }}{{ opt.title }}
        </button>
      </div>
    </template>

    <template v-else>
      <p class="ab-alert ab-alert--warn">
        Эта категория выше возрастной — вопросы будут сложнее. Точно?
      </p>
      <div class="quiz-join__opts">
        <button class="ab-btn ab-btn--lime" type="button" :disabled="busy" @click="emit('join', confirmCode, true)">
          Да, играть в ней
        </button>
        <button class="ab-btn ab-btn--ghost" type="button" :disabled="busy" @click="confirmCode = ''">
          Выбрать другую
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.quiz-join { padding: 28px 24px; display: flex; flex-direction: column; gap: 14px; }
.quiz-join__title { margin: 0; font-size: clamp(1.3rem, 4vw, 1.7rem); }
.quiz-join__text { margin: 0; color: var(--ab-text-dim); line-height: 1.6; }
.quiz-join__hint { margin: 0; font-weight: 600; }
.quiz-join__opts { display: flex; flex-wrap: wrap; gap: 12px; }
</style>