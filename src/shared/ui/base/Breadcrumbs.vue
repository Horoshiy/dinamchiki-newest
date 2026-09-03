<script setup lang="ts">
/**
 * Хлебные крошки. Используется на внутренних страницах.
 *
 * Пример:
 *   <Breadcrumbs :items="[
 *     { label: 'Главная', to: '/' },
 *     { label: 'Команды' },
 *   ]" />
 */
import { RouterLink } from 'vue-router'

defineProps<{
  items: ReadonlyArray<{ label: string; to?: string | object }>
}>()
</script>

<template>
  <nav class="breadcrumbs" aria-label="Хлебные крошки">
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="breadcrumbs__item"
        :aria-current="i === items.length - 1 && !item.to ? 'page' : undefined"
      >
        <RouterLink v-if="item.to && i < items.length - 1" :to="item.to" class="breadcrumbs__link">
          {{ item.label }}
        </RouterLink>
        <span v-else class="breadcrumbs__current">{{ item.label }}</span>
        <span v-if="i < items.length - 1" class="breadcrumbs__sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.breadcrumbs {
  font-size: $font-size-sm;
  color: $color-fg-muted;
}

.breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-2;
}

.breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
}

.breadcrumbs__link {
  color: $color-brand-500;
  font-weight: $font-weight-medium;

  &:hover { color: $color-brand-600; }
}

.breadcrumbs__current {
  color: $color-fg-strong;
  font-weight: $font-weight-semibold;
}

.breadcrumbs__sep {
  color: $color-ink-300;
  user-select: none;
}
</style>
