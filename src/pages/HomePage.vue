<script setup lang="ts">
/**
 * Главная страница.
 *
 * Сквозной pageLayouts контракт (БД → админка → публичный сайт):
 *   - Хукаем usePageLayoutQuery('/') — возвращает sections[order, kind, collection, visible]
 *   - По `collection` маппим на конкретный виджет из @/widgets/home/
 *   - Если бэкенд вернул layout — рендерим секции в его порядке (видимость учитывается)
 *   - Если бэкенд упал / layout == null — fallback на дефолтный порядок
 *
 * Секции вне pageLayout (Coaches/Tournaments/Gallery/Cta) добавляются в конец
 * как «статичные блоки» — Юрий потом сможет управлять ими через pageLayout,
 * но пока они работают как раньше.
 */
import { computed } from 'vue'
import HomeHero from '@/widgets/home/HomeHero.vue'
import HomeWhyUs from '@/widgets/home/HomeWhyUs.vue'
import HomeStats from '@/widgets/home/HomeStats.vue'
import HomeGroups from '@/widgets/home/HomeGroups.vue'
import HomeHowItWorks from '@/widgets/home/HomeHowItWorks.vue'
import HomeCoachesPreview from '@/widgets/home/HomeCoachesPreview.vue'
import HomeTournamentsPreview from '@/widgets/home/HomeTournamentsPreview.vue'
import HomeGalleryPreview from '@/widgets/home/HomeGalleryPreview.vue'
import HomeCta from '@/widgets/home/HomeCta.vue'
import { usePageLayoutQuery, type PageSection } from '@/shared/api/composables'

/** Маппинг `collection` (бэкенд) → Vue-компонент (фронт). */
const COLLECTION_TO_COMPONENT: Record<string, unknown> = {
  hero: HomeHero,
  features: HomeWhyUs, // WhyUs рендерит features из pageContent
  stats: HomeStats,
  programs: HomeGroups, // Groups рендерит programs
  trainingSteps: HomeHowItWorks,
  // Эти коллекции pageLayout пока не возвращает (pageLayout для / имеет 5 секций),
  // но маппинг готов — когда Юрий добавит их в pageLayouts, всё подхватится.
  coaches: HomeCoachesPreview,
  tournaments: HomeTournamentsPreview,
  albums: HomeGalleryPreview,
  photos: HomeGalleryPreview,
  reviews: HomeGalleryPreview,
  contactInfo: HomeCta,
}

/** Дефолтный порядок (как было до pageLayout) — fallback если бэкенд не вернул layout. */
const FALLBACK_HOME_SECTIONS: PageSection[] = [
  { order: 0, kind: 'HERO', label: 'Hero',                collection: 'hero',          visible: true },
  { order: 1, kind: 'LIST', label: 'Преимущества',        collection: 'features',      visible: true },
  { order: 2, kind: 'LIST', label: 'Статистика',          collection: 'stats',         visible: true },
  { order: 3, kind: 'LIST', label: 'Программы',           collection: 'programs',      visible: true },
  { order: 4, kind: 'LIST', label: 'Этапы тренировки',    collection: 'trainingSteps', visible: true },
]

const { data: layoutData } = usePageLayoutQuery('/')

/** Секции для рендера: из бэкенда или fallback. */
const sectionsToRender = computed<PageSection[]>(() => {
  const fromBackend = layoutData.value?.pageLayout?.sections
  if (fromBackend && fromBackend.length > 0) {
    return [...fromBackend].sort((a, b) => a.order - b.order)
  }
  return FALLBACK_HOME_SECTIONS
})

/** Vue-компонент для секции. */
function componentFor(section: PageSection): unknown | null {
  return COLLECTION_TO_COMPONENT[section.collection] ?? null
}

/** Секции, для которых нашёлся компонент (и visible=true). */
const renderableSections = computed(() =>
  sectionsToRender.value.filter((s) => s.visible && componentFor(s) !== null),
)
</script>

<template>
  <div class="home">
    <!-- Управляемые секции: порядок из pageLayouts контракта -->
    <template v-for="(section, idx) in renderableSections" :key="`${section.collection}-${idx}`">
      <component :is="componentFor(section)" />
    </template>

    <!-- Статичные секции, которых пока нет в pageLayout (Coaches / Tournaments / Gallery / Cta) -->
    <HomeCoachesPreview />
    <HomeTournamentsPreview />
    <HomeGalleryPreview />
    <HomeCta />
  </div>
</template>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
}
</style>
