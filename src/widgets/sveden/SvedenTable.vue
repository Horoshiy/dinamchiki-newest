<script setup lang="ts">
/**
 * Обёртка для таблиц раздела: горизонтальная прокрутка внутри блока,
 * чтобы страница не ехала вбок на мобильных.
 */
defineProps<{ caption?: string }>()
</script>

<template>
  <div class="sv-table" role="region" :aria-label="caption" tabindex="0">
    <table>
      <slot />
    </table>
  </div>
</template>

<style scoped lang="scss">
.sv-table {
  overflow-x: auto;
  border: 1px solid $color-border;
  border-radius: $radius-lg;

  &:focus-visible {
    outline: 2px solid $color-brand-500;
    outline-offset: 2px;
  }
}

table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  font-size: $font-size-sm;
}

:deep(th),
:deep(td) {
  text-align: left;
  padding: $space-3 $space-4;
  border-bottom: 1px solid $color-border;
  vertical-align: top;
}

:deep(thead th) {
  background: $color-bg-soft;
  font-size: $font-size-xs;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $color-fg-muted;
  font-weight: $font-weight-bold;
  white-space: nowrap;
}

:deep(tbody tr:last-child td) { border-bottom: none; }

:deep(td.num),
:deep(th.num) {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

:deep(tfoot td) {
  font-weight: $font-weight-bold;
  background: $color-bg-soft;
  color: $color-fg-strong;
}
</style>
