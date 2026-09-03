<script setup lang="ts">
/** Смысловой блок внутри подраздела: заголовок + содержимое. */
defineProps<{ title?: string }>()
</script>

<template>
  <section class="sv-block">
    <h2 v-if="title" class="sv-block__title">{{ title }}</h2>
    <div class="sv-block__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.sv-block__title {
  margin: 0 0 $space-4;
  font-family: $font-family-display;
  font-size: $font-size-lg;
  line-height: $line-height-snug;
  color: $color-fg-strong;
}

.sv-block__body {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  :deep(p) { margin: 0; max-width: 74ch; }
  :deep(ul) { margin: 0; padding-left: $space-5; display: flex; flex-direction: column; gap: $space-2; }
  :deep(ol) { margin: 0; padding-left: $space-5; display: flex; flex-direction: column; gap: $space-2; }
  :deep(li) { max-width: 72ch; }
}
</style>
