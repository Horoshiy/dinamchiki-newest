<script setup lang="ts">
/**
 * Шаблонный PageHeader для внутренних страниц.
 *
 * Структура (сверху вниз):
 *   [Breadcrumbs (опционально)]
 *   [Eyebrow (мелкий капс)]
 *   [Заголовок h1]
 *   [Описание]
 *   [Action — кнопка/ссылка справа]
 *
 * Использование:
 *   <PageHeader
 *     eyebrow="Команды"
 *     title="Наши команды"
 *     description="..."
 *   >
 *     <template #action>
 *       <BaseButton>Записаться</BaseButton>
 *     </template>
 *   </PageHeader>
 */
import Breadcrumbs from '@/shared/ui/base/Breadcrumbs.vue'

interface Crumb { label: string; to?: string | object }

withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    description?: string
    /** Хлебные крошки над заголовком. По умолчанию — «Главная / [title]». */
    breadcrumbs?: ReadonlyArray<Crumb>
    /** Выравнивание по центру (для коротких страниц типа 404). */
    align?: 'left' | 'center'
  }>(),
  { align: 'left' },
)
</script>

<template>
  <header class="page-header" :class="[`page-header--${align}`]">
    <Breadcrumbs
      v-if="breadcrumbs && breadcrumbs.length > 0"
      :items="breadcrumbs"
      class="page-header__crumbs"
    />
    <p v-if="eyebrow" class="page-header__eyebrow">{{ eyebrow }}</p>
    <h1 class="page-header__title">{{ title }}</h1>
    <p v-if="description" class="page-header__description">{{ description }}</p>
    <div v-if="$slots.action" class="page-header__action">
      <slot name="action" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.page-header {
  padding: $space-12 0 $space-10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $space-4;

  @media (max-width: $bp-md) {
    padding: $space-8 0 $space-6;
  }

  &--center {
    align-items: center;
    text-align: center;
  }
}

.page-header__crumbs {
  margin-bottom: $space-2;
}

.page-header__eyebrow {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $color-brand-500;
  margin: 0;
}

.page-header__title {
  font-family: $font-family-display;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: $font-weight-extrabold;
  line-height: 1.1;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.02em;
  // «образовательной» при крупном системном шрифте шире экрана 360px:
  // переносим по слогам, а не распираем страницу.
  hyphens: auto;
  overflow-wrap: break-word;
}

.page-header__description {
  font-size: $font-size-md;
  color: $color-fg-muted;
  line-height: $line-height-base;
  max-width: 70ch;
  margin: 0;
}

.page-header__action {
  display: flex;
  gap: $space-3;
  margin-top: $space-4;
  flex-wrap: wrap;
}
</style>
