<script setup lang="ts">
/**
 * Группа pill-кнопок для фильтрации. Используется на страницах
 * «Команды» (фильтр по возрасту), «Галерея» (фильтр по альбомам)
 * и т.д.
 *
 * Управляется через v-model:selected — строка с активным значением.
 * Если selected=null — ни одна кнопка не подсвечена.
 */

defineProps<{
  items: ReadonlyArray<{ value: string; label: string }>
  selected: string | null
}>()

defineEmits<{
  (e: 'update:selected', value: string | null): void
}>()
</script>

<template>
  <div class="chips" role="tablist">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      role="tab"
      :aria-selected="selected === item.value"
      class="chip"
      :class="{ 'chip--active': selected === item.value }"
      @click="$emit('update:selected', selected === item.value ? null : item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.chip {
  appearance: none;
  border: 1.5px solid $color-border;
  background: $color-white;
  color: $color-fg;
  font-family: $font-family-sans;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  padding: $space-2 $space-5;
  border-radius: $radius-pill;
  cursor: pointer;
  transition:
    background $transition-base,
    color $transition-base,
    border-color $transition-base;

  &:hover {
    border-color: $color-brand-500;
    color: $color-brand-500;
  }

  &:focus-visible {
    outline: 2px solid $color-brand-500;
    outline-offset: 2px;
  }

  &--active {
    background: $color-brand-500;
    border-color: $color-brand-500;
    color: $color-white;

    &:hover {
      background: $color-brand-600;
      border-color: $color-brand-600;
      color: $color-white;
    }
  }
}
</style>
