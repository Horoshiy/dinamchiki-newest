<script setup lang="ts">
/**
 * Секция «Клуб в цифрах» — 4 метрики StatCard в ряд.
 *
 * Данные из pageContent (useHomeContentQuery), а не из литералов в файле.
 */
import { computed } from 'vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import StatCard from '@/shared/ui/base/StatCard.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import { iconByKey } from '@/shared/ui/icons/registry'
import { useHomeContentQuery } from '@/shared/api/composables'
import type { PageContent } from '@/entities/content/content.types'

const { data, loading } = useHomeContentQuery()

const stats = computed(() => {
  const d = data.value as { pageContent?: PageContent } | null
  return (d?.pageContent?.stats ?? []).map((s) => ({ ...s, icon: iconByKey(s.iconKey) }))
})
</script>

<template>
  <section class="stats">
    <div class="container">
      <SectionTitle
        eyebrow="О клубе"
        title="Клуб в цифрах"
        align="center"
      />
      <div v-if="loading" class="stats__grid">
        <LoadingSkeleton v-for="i in 4" :key="i" variant="block" height="180px" />
      </div>
      <div v-else class="stats__grid">
        <StatCard
          v-for="s in stats"
          :key="s.id"
          :value="s.value"
          :label="s.label"
          :caption="s.caption"
          :icon="s.icon"
        />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.stats {
  padding: $space-16 0;
  background: $color-bg-soft;
}

.stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-5;

  @media (max-width: $bp-lg) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: $bp-sm) {
    grid-template-columns: 1fr;
  }
}
</style>
