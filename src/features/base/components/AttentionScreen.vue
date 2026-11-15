<script setup lang="ts">
// Экран заботы: боль >= 3. Просим рассказать тренеру и родителям.
// Показывается до награды, чтобы ребёнок точно это увидел.
defineProps<{ message?: string }>()
const emit = defineEmits<{ ok: [] }>()
</script>

<template>
  <div class="attention ab-card ab-pop" role="alertdialog" aria-label="Важно рассказать взрослым">
    <div class="attention__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="40" height="40">
        <path d="M12 3l9 16H3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M12 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <circle cx="12" cy="17" r="1.2" fill="currentColor" />
      </svg>
    </div>
    <h2 class="attention__title">Это важно</h2>
    <p class="attention__text">
      {{ message || 'Расскажи тренеру и родителям, что болит. Это важно — вместе разберёмся.' }}
    </p>
    <p class="attention__sub ab-dim">
      Тренер уже увидел отметку в своей тренерской и поможет. Ты молодец, что честно ответил.
    </p>
    <button class="ab-btn ab-btn--block" type="button" @click="emit('ok')">Понятно, я расскажу</button>
  </div>
</template>

<style scoped lang="scss">
.attention {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px;
  padding: 34px 28px; max-width: 460px; margin: 0 auto;
  border-color: rgba(255, 176, 32, 0.5);
  background: linear-gradient(180deg, rgba(255, 176, 32, 0.14), rgba(17, 24, 52, 0.8));
}
.attention__icon { display: grid; place-items: center; width: 76px; height: 76px; border-radius: 50%;
  color: var(--ab-amber); background: rgba(255, 176, 32, 0.16); animation: ab-pulse-ring 2s ease-out infinite; }
.attention__title { font-size: 1.6rem; color: var(--ab-amber); }
.attention__text { font-size: 1.1rem; line-height: 1.5; margin: 0; }
.attention__sub { font-size: 0.9rem; margin: 0; }
</style>