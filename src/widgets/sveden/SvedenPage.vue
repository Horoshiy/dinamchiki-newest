<script setup lang="ts">
/**
 * Каркас страницы подраздела «Сведения об образовательной организации».
 *
 * Даёт единые для всего раздела крошки, заголовок, боковую навигацию
 * (требование п. 2 приказа № 1493 — механизм навигации на каждой странице)
 * и колонку контента.
 *
 * Микроразметка itemprop="copy" (наличие версии для слабовидящих) живёт
 * в шапке сайта: она присутствует в DOM и на главной, и на каждой странице
 * раздела, как того требуют Методические рекомендации.
 */
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import Breadcrumbs from '@/shared/ui/base/Breadcrumbs.vue'
import SvedenNav from './SvedenNav.vue'

defineProps<{
  /** Номер подраздела в порядке п. 6 приказа № 1493. */
  num?: number
  title: string
  /** Короткое имя для хлебных крошек. */
  crumb?: string
  lead?: string
}>()
</script>

<template>
  <PageContainer>
    <section class="container">
      <Breadcrumbs
        :items="[
          { label: 'Главная', to: '/' },
          { label: 'Сведения об образовательной организации', to: '/sveden' },
          { label: crumb ?? title },
        ]"
      />

      <div class="sv-layout">
        <aside class="sv-layout__side">
          <SvedenNav />
        </aside>

        <div class="sv-layout__main">
          <header class="sv-head">
            <p v-if="num" class="sv-head__num">Подраздел {{ num }}</p>
            <h1 class="sv-head__title">{{ title }}</h1>
            <p v-if="lead" class="sv-head__lead">{{ lead }}</p>
          </header>

          <div class="sv-body">
            <slot />
          </div>
        </div>
      </div>
    </section>
  </PageContainer>
</template>

<style scoped lang="scss">
.sv-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: $space-10;
  margin-top: $space-6;

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr;
    gap: $space-6;
  }
}

.sv-layout__side {
  @media (min-width: $bp-lg) {
    position: sticky;
    top: $space-6;
    align-self: start;
  }
}

// Колонка контента не должна распирать грид широкой таблицей.
.sv-layout__main { min-width: 0; }

.sv-head {
  padding-bottom: $space-5;
  border-bottom: 2px solid $color-brand-500;
}

.sv-head__num {
  margin: 0 0 $space-2;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $color-brand-500;
}

.sv-head__title {
  margin: 0;
  font-family: $font-family-display;
  font-size: $font-size-2xl;
  line-height: $line-height-tight;
  color: $color-fg-strong;
  text-wrap: balance;

  @media (max-width: $bp-md) { font-size: $font-size-xl; }
}

.sv-head__lead {
  margin: $space-3 0 0;
  color: $color-fg-muted;
  max-width: 70ch;
}

.sv-body {
  display: flex;
  flex-direction: column;
  gap: $space-8;
  margin-top: $space-8;
}
</style>
