<script setup lang="ts">
/**
 * Секция «Клуб в цифрах» — 4 метрики StatCard в ряд.
 *
 * Данные из pageContent (useHomeContentQuery), а не из литералов в файле.
 * Две метрики считаются сами и перекрывают то, что введено в админке:
 * `years` — от даты регистрации клуба, `groups` — по списку групп из CRM.
 * Руками их никто не обновлял: «17 групп» и «11 лет» устаревали молча.
 */
import { computed } from 'vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import StatCard from '@/shared/ui/base/StatCard.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import { iconByKey } from '@/shared/ui/icons/registry'
import { useHomeContentQuery, useTeamsQuery } from '@/shared/api/composables'
import type { PageContent, StatItem } from '@/entities/content/content.types'
import { clubYears } from '@/entities/club/club.facts'
import { plural } from '@/shared/lib/plural'

const { data, loading } = useHomeContentQuery()
const { data: teamsData } = useTeamsQuery()

const groupsCount = computed(() => (teamsData.value as { teams?: unknown[] } | null)?.teams?.length ?? 0)

/** Подменяет число и согласует подпись: «лет работы» → «год работы» и т. п. */
function withLiveNumbers(s: StatItem): StatItem {
  if (s.id === 'years') {
    const n = clubYears()
    return { ...s, value: String(n), label: s.label.replace(/^(лет|года?)(?=\s|$)/, plural(n, ['год', 'года', 'лет'])) }
  }
  if (s.id === 'groups' && groupsCount.value > 0) {
    const n = groupsCount.value
    return { ...s, value: String(n), label: s.label.replace(/^групп[аы]?(?=\s|$)/, plural(n, ['группа', 'группы', 'групп'])) }
  }
  return s
}

const stats = computed(() => {
  const d = data.value as { pageContent?: PageContent } | null
  return (d?.pageContent?.stats ?? []).map((s) => ({ ...withLiveNumbers(s), icon: iconByKey(s.iconKey) }))
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
