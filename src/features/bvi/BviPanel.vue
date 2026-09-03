<script setup lang="ts">
/**
 * Панель управления версией для слабовидящих.
 * Показывается только когда режим включён — обычному посетителю не мешает.
 */
import { useBvi, type BviSize, type BviTheme } from './useBvi'

const { state, disable, setSize, setTheme, toggleImages } = useBvi()

const SIZES: ReadonlyArray<{ value: BviSize; label: string; hint: string }> = [
  { value: 1, label: 'A',  hint: 'Обычный размер шрифта' },
  { value: 2, label: 'A',  hint: 'Крупный шрифт' },
  { value: 3, label: 'A',  hint: 'Очень крупный шрифт' },
]

const THEMES: ReadonlyArray<{ value: BviTheme; label: string }> = [
  { value: 'white', label: 'Чёрным по белому' },
  { value: 'black', label: 'Белым по чёрному' },
  { value: 'blue',  label: 'Тёмно-синим по голубому' },
]
</script>

<template>
  <div v-if="state.enabled" class="bvi-panel" role="region" aria-label="Настройки версии для слабовидящих">
    <div class="container bvi-panel__inner">
      <div class="bvi-panel__group">
        <span class="bvi-panel__label">Размер шрифта</span>
        <button
          v-for="s in SIZES"
          :key="s.value"
          type="button"
          class="bvi-panel__btn"
          :class="[`bvi-panel__btn--size-${s.value}`, { 'is-active': state.size === s.value }]"
          :aria-pressed="state.size === s.value"
          :title="s.hint"
          @click="setSize(s.value)"
        >{{ s.label }}</button>
      </div>

      <div class="bvi-panel__group">
        <span class="bvi-panel__label">Цвета</span>
        <button
          v-for="t in THEMES"
          :key="t.value"
          type="button"
          class="bvi-panel__btn"
          :class="{ 'is-active': state.theme === t.value }"
          :aria-pressed="state.theme === t.value"
          @click="setTheme(t.value)"
        >{{ t.label }}</button>
      </div>

      <div class="bvi-panel__group">
        <button
          type="button"
          class="bvi-panel__btn"
          :aria-pressed="!state.images"
          @click="toggleImages()"
        >{{ state.images ? 'Выключить изображения' : 'Включить изображения' }}</button>
      </div>

      <button type="button" class="bvi-panel__btn bvi-panel__btn--exit" @click="disable()">
        Обычная версия
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bvi-panel {
  border-bottom: 2px solid currentColor;
  padding: $space-3 0;
}

.bvi-panel__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-4;
}

.bvi-panel__group {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.bvi-panel__label {
  font-size: $font-size-sm;
}

.bvi-panel__btn {
  padding: $space-2 $space-3;
  border: 2px solid currentColor;
  border-radius: $radius-sm;
  background: transparent;
  font-size: $font-size-sm;
  line-height: 1.2;

  &.is-active {
    outline: 3px solid currentColor;
    outline-offset: 1px;
    font-weight: $font-weight-bold;
  }

  &:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 2px;
  }
}

.bvi-panel__btn--size-2 { font-size: $font-size-md; }
.bvi-panel__btn--size-3 { font-size: $font-size-xl; }

.bvi-panel__btn--exit { margin-left: auto; }
</style>
