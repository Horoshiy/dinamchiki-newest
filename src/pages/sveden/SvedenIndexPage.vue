<script setup lang="ts">
/**
 * Главная страница раздела «Сведения об образовательной организации» (`/sveden`).
 *
 * Структура раздела — по п. 6 приказа Рособрнадзора № 1493 от 04.08.2023.
 * Подраздел «Образовательные стандарты и требования» отсутствует намеренно:
 * он обязателен только при работе по ФГОС или ФГТ, а клуб реализует
 * дополнительные общеобразовательные общеразвивающие программы.
 */
import { RouterLink } from 'vue-router'
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import { SVEDEN_SECTIONS, svedenPath } from '@/entities/sveden/sveden.sections'
import { ORG, LICENSE } from '@/entities/sveden/sveden.data'
</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="Официальная информация"
        title="Сведения об образовательной организации"
        description="Раздел сформирован в соответствии с приказом Рособрнадзора от 04.08.2023 № 1493 и содержит обязательные сведения об ООО ДФК «Динамчики»."
        :breadcrumbs="[{ label: 'Главная', to: '/' }, { label: 'Сведения об образовательной организации' }]"
      />

      <div class="sv-index__summary">
        <p>
          <strong>{{ ORG.fullName }}</strong> осуществляет образовательную деятельность
          на основании лицензии № {{ LICENSE.number }} от {{ LICENSE.date }},
          выданной {{ LICENSE.issuer.replace('Министерство', 'Министерством') }}.
        </p>
      </div>

      <!--
        Плитка подразделов — это и есть механизм навигации по разделу
        для его главной страницы (п. 2 приказа № 1493). Aria-label совпадает
        с боковой навигацией внутри подразделов, чтобы механизм читался
        как один и тот же.
      -->
      <nav aria-label="Навигация по разделу «Сведения об образовательной организации»">
      <ul class="sv-index__grid">
        <li v-for="(s, i) in SVEDEN_SECTIONS" :key="s.slug">
          <RouterLink :to="svedenPath(s.slug)" class="sv-card">
            <span class="sv-card__num">{{ i + 1 }}</span>
            <span class="sv-card__body">
              <span class="sv-card__title">{{ s.short }}</span>
              <span class="sv-card__desc">{{ s.description }}</span>
            </span>
          </RouterLink>
        </li>
      </ul>
      </nav>
    </section>
  </PageContainer>
</template>

<style scoped lang="scss">
.sv-index__summary {
  margin-top: $space-6;
  padding: $space-5 $space-6;
  border-left: 3px solid $color-brand-500;
  background: $color-bg-soft;
  border-radius: 0 $radius-lg $radius-lg 0;

  p { margin: 0; max-width: 80ch; }
}

.sv-index__grid {
  list-style: none;
  margin: $space-8 0 0;
  padding: 0;
  display: grid;
  // min() — иначе колонка 320px не влезает в экран 320px за вычетом отступов.
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: $space-4;
}

.sv-card {
  display: flex;
  gap: $space-4;
  height: 100%;
  padding: $space-5;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: $color-white;
  color: $color-fg;
  transition: border-color $transition-base, box-shadow $transition-base;

  &:hover {
    border-color: $color-brand-300;
    box-shadow: $shadow-sm;
    color: $color-fg;
  }
}

.sv-card__num {
  flex: none;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: $radius-sm;
  background: $color-brand-50;
  color: $color-brand-700;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  font-variant-numeric: tabular-nums;
}

.sv-card__body { display: flex; flex-direction: column; gap: $space-1; }

.sv-card__title {
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
  line-height: $line-height-snug;
}

.sv-card__desc {
  font-size: $font-size-sm;
  color: $color-fg-muted;
  line-height: $line-height-base;
}
</style>
