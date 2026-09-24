<script setup lang="ts">
/**
 * Секция «Возрастные группы» — карточки программ по возрасту.
 *
 * Данные из pageContent (useHomeContentQuery). «Подробнее» ведёт
 * на /teams с уже выбранным фильтром возраста.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import { useHomeContentQuery } from '@/shared/api/composables'
import type { PageContent } from '@/entities/content/content.types'

const { data, loading } = useHomeContentQuery()

const groups = computed(() => {
  const d = data.value as { pageContent?: PageContent } | null
  return (d?.pageContent?.programs ?? []).map((p) => ({
    ...p,
    href: `/teams?age=${p.ageGroup}`,
  }))
})
</script>

<template>
  <section id="programs" class="groups">
    <div class="container">
      <SectionTitle
        eyebrow="Программы"
        title="Возрастные группы и цены"
      />
      <div v-if="loading" class="groups__list">
        <LoadingSkeleton v-for="i in 3" :key="i" variant="block" height="260px" />
      </div>
      <ul v-else class="groups__list">
        <li v-for="g in groups" :key="g.id" class="group">
          <div class="group__body">
            <p class="group__age">{{ g.ageLabel }} лет</p>
            <h3 class="group__title">{{ g.title }}</h3>
            <span class="group__bar" aria-hidden="true" />
            <p class="group__desc">{{ g.description }}</p>
            <RouterLink :to="g.href" class="group__link">
              Подробнее
              <IconArrowRight :size="16" />
            </RouterLink>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.groups {
  padding: $space-16 0;
  background: $color-white;
  // Якорь из hero («Возрастные группы и цены») — отступ под липкую шапку.
  scroll-margin-top: 88px;
}

.groups__list {
  display: grid;
  // Программ ровно четыре — в три колонки последняя карточка оставалась
  // одна в ряду. Четыре колонки на широком экране, две на планшете.
  grid-template-columns: repeat(4, 1fr);
  gap: $space-5;

  @media (max-width: $bp-xl) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: $bp-md) {
    grid-template-columns: 1fr;
  }
}

.group {
  display: flex;
  flex-direction: column;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: box-shadow $transition-base, transform $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }

}

.group__body {
  padding: $space-6;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: $space-2;
}

.group__age {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $color-brand-500;
  margin: 0;
}

.group__title {
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.01em;
}

.group__bar {
  display: block;
  width: 48px;
  height: 3px;
  background: $color-brand-500;
  border-radius: $radius-pill;
  margin: $space-1 0 $space-2;
}

.group__desc {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
  flex: 1;
}

.group__link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  // auto — прижимает кнопку к низу карточки, иначе при разной длине
  // описания «Подробнее» в соседних карточках стоят на разной высоте.
  margin-top: auto;
  padding: $space-2 $space-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
  border: 1.5px solid $color-brand-500;
  border-radius: $radius-md;
  text-decoration: none;
  align-self: flex-start;
  transition: background $transition-base, color $transition-base;

  &:hover {
    background: $color-brand-500;
    color: $color-white;
  }
}
</style>
