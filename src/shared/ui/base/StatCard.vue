<script setup lang="ts">
/**
 * Карточка-метрика. По мокапам — белый фон, иконка слева в кружке,
 * крупная цифра справа сверху, мелкий текст снизу.
 *
 * Используется на главной для блока «В цифрах о клубе».
 */
withDefaults(
  defineProps<{
    /** Число / значение, например "10+". */
    value: string
    /** Подпись под числом, например "лет работы". */
    label: string
    /** Дополнительный поясняющий текст под подписью. */
    caption?: string
    /** Иконка (Vue-компонент) слева сверху. */
    icon?: unknown
  }>(),
  {},
)
</script>

<template>
  <div class="stat-card">
    <div class="stat-card__head">
      <span v-if="icon" class="stat-card__icon">
        <component :is="icon" :size="28" />
      </span>
      <div class="stat-card__body">
        <p class="stat-card__value">{{ value }}</p>
        <p class="stat-card__label">{{ label }}</p>
      </div>
    </div>
    <p v-if="caption" class="stat-card__caption">{{ caption }}</p>
  </div>
</template>

<style scoped lang="scss">
// По мокапу (скрин 3): верхняя строка — иконка + цифра с подписью,
// ниже — пояснение на всю ширину карточки.
//
// Раньше вся карточка была одним горизонтальным flex: иконка 64px и gap
// съедали половину ширины, и в ряду из четырёх карточек пояснение
// ломалось в узкую колонку в 3–4 строки.
.stat-card {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-6;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  min-height: 196px;
}

.stat-card__head {
  display: flex;
  align-items: center;
  gap: $space-4;
}

.stat-card__icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-brand-50;
  color: $color-brand-500;
  border-radius: 50%;
}

.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  min-width: 0;
}

.stat-card__value {
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: clamp(2rem, 2.8vw, 2.75rem);
  line-height: 1;
  color: $color-brand-500;
  margin: 0;
  letter-spacing: -0.02em;
}

.stat-card__label {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
  margin: 0;
}

.stat-card__caption {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  margin: 0;
  line-height: 1.45;
}

@media (max-width: $bp-md) {
  .stat-card {
    padding: $space-5;
    min-height: auto;
  }
}
</style>
