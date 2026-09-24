<script setup lang="ts">
/**
 * «Частые вопросы» — то, из-за чего не нажимают кнопку записи:
 * сколько стоит, что если ребёнок никогда не играл, что взять,
 * какие документы, что при болезни и отпуске.
 *
 * Данные из pageContent.faq — правятся в админке, а не в коде.
 * Раскрытие на нативных <details>: работает без JS, доступно с клавиатуры
 * и не ломается при печати страницы.
 */
import { computed } from 'vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import { useHomeContentQuery } from '@/shared/api/composables'
import type { PageContent } from '@/entities/content/content.types'

const { data, loading } = useHomeContentQuery()

const items = computed(() => {
  const d = data.value as { pageContent?: PageContent } | null
  return d?.pageContent?.faq ?? []
})
</script>

<template>
  <section v-if="loading || items.length" class="faq">
    <div class="container">
      <SectionTitle eyebrow="Перед записью" title="Частые вопросы" />

      <div v-if="loading" class="faq__list">
        <LoadingSkeleton v-for="i in 4" :key="i" variant="block" height="64px" />
      </div>

      <div v-else class="faq__list">
        <details v-for="(f, i) in items" :key="f.id" class="faq__item" :open="i === 0">
          <summary class="faq__q">
            <span>{{ f.question }}</span>
            <span class="faq__marker" aria-hidden="true"></span>
          </summary>
          <p class="faq__a">{{ f.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.faq {
  padding: $space-16 0;
  background: $color-bg-soft;
}

.faq__list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  max-width: 860px;
}

.faq__item {
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
}

.faq__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  padding: $space-5 $space-6;
  cursor: pointer;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
  line-height: 1.35;
  list-style: none;

  &::-webkit-details-marker { display: none; }

  &:hover { color: $color-brand-600; }

  &:focus-visible {
    outline: 2px solid $color-brand-500;
    outline-offset: -2px;
  }
}

/** Плюс/минус рисуем сами: нативный треугольник по-разному выглядит в браузерах. */
.faq__marker {
  position: relative;
  flex: 0 0 auto;
  width: 16px;
  height: 16px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    background: $color-brand-500;
    transform: translate(-50%, -50%);
    transition: opacity $transition-base;
  }

  &::before { width: 16px; height: 2px; }
  &::after  { width: 2px; height: 16px; }
}

.faq__item[open] .faq__marker::after { opacity: 0; }

.faq__a {
  margin: 0;
  padding: 0 $space-6 $space-6;
  color: $color-fg-muted;
  line-height: $line-height-base;
  max-width: 68ch;
}

@media (prefers-reduced-motion: reduce) {
  .faq__marker::before,
  .faq__marker::after { transition: none; }
}
</style>
