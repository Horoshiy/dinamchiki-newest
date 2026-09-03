<script setup lang="ts">
/**
 * Список документов подраздела.
 *
 * Документ без `href` показывается как «не размещён» — прятать строку нельзя:
 * отсутствие документа само по себе является сведением, а тихо пропавшая
 * строка выглядит как выполненное требование.
 */
import type { SvedenDoc } from '@/entities/sveden/sveden.data'

defineProps<{ docs: ReadonlyArray<SvedenDoc> }>()
</script>

<template>
  <ul class="sv-docs">
    <li v-for="(d, i) in docs" :key="i" class="sv-docs__item">
      <div class="sv-docs__text">
        <p class="sv-docs__title">{{ d.title }}</p>
        <p class="sv-docs__desc">{{ d.description }}</p>
      </div>
      <a
        v-if="d.href"
        class="sv-docs__link"
        :href="d.href"
        :itemprop="d.itemprop"
        target="_blank"
        rel="noopener"
      >
        Скачать<span v-if="d.size"> · {{ d.size }}</span>
      </a>
      <span v-else class="sv-docs__pending" :itemprop="d.itemprop">Не размещён</span>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.sv-docs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.sv-docs__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  padding: $space-4 $space-5;
  border: 1px solid $color-border;
  border-radius: $radius-lg;

  @media (max-width: $bp-md) {
    flex-direction: column;
    align-items: flex-start;
    gap: $space-3;
  }
}

.sv-docs__title {
  margin: 0;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
}

.sv-docs__desc {
  margin: 2px 0 0;
  font-size: $font-size-sm;
  color: $color-fg-muted;
  max-width: 60ch;
}

.sv-docs__link {
  flex: none;
  padding: $space-2 $space-4;
  border-radius: $radius-md;
  background: $color-brand-50;
  color: $color-brand-700;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  white-space: nowrap;

  &:hover { background: $color-brand-100; color: $color-brand-700; }
}

.sv-docs__pending {
  flex: none;
  padding: $space-2 $space-4;
  border-radius: $radius-md;
  background: $color-warning-bg;
  color: $color-warning-fg;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  white-space: nowrap;
}
</style>
