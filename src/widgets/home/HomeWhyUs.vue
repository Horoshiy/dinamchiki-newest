<script setup lang="ts">
/**
 * Секция «Почему выбирают наш клуб» — преимущества в сетке.
 *
 * Данные из pageContent (useHomeContentQuery).
 */
import { computed } from 'vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import { iconByKey } from '@/shared/ui/icons/registry'
import { useHomeContentQuery } from '@/shared/api/composables'
import type { PageContent } from '@/entities/content/content.types'

const { data, loading } = useHomeContentQuery()

const features = computed(() => {
  const d = data.value as { pageContent?: PageContent } | null
  return (d?.pageContent?.features ?? []).map((f) => ({ ...f, icon: iconByKey(f.iconKey) }))
})
</script>

<template>
  <section class="why-us">
    <div class="container">
      <SectionTitle
        eyebrow="Преимущества"
        title="Почему выбирают наш клуб"
      />
      <div v-if="loading" class="why-us__grid">
        <LoadingSkeleton v-for="i in 6" :key="i" variant="block" height="140px" />
      </div>
      <ul v-else class="why-us__grid">
        <li v-for="f in features" :key="f.id" class="why-us__item">
          <span class="why-us__icon">
            <component :is="f.icon" :size="28" />
          </span>
          <div class="why-us__body">
            <h3 class="why-us__title">{{ f.title }}</h3>
            <p class="why-us__desc">{{ f.description }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.why-us {
  padding: $space-16 0;
  background: $color-white;
}

.why-us__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-5;

  @media (max-width: $bp-lg) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: $bp-sm) {
    grid-template-columns: 1fr;
  }
}

.why-us__item {
  display: flex;
  align-items: flex-start;
  gap: $space-5;
  padding: $space-6;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  transition: box-shadow $transition-base, transform $transition-base, border-color $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $color-border-strong;
  }
}

.why-us__icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-brand-50;
  color: $color-brand-500;
  border-radius: 50%;
}

.why-us__body {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.why-us__title {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  line-height: 1.25;
}

.why-us__desc {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
}
</style>
