<script setup lang="ts">
/**
 * Навигация по разделу «Сведения об образовательной организации».
 *
 * Пункт 2 приказа Рособрнадзора № 1493: раздел должен иметь общий механизм
 * навигации, представленный НА КАЖДОЙ странице раздела. Поэтому компонент
 * рендерится внутри SvedenPage, а не один раз в лэйауте.
 */
import { RouterLink } from 'vue-router'
import { SVEDEN_SECTIONS, svedenPath } from '@/entities/sveden/sveden.sections'
</script>

<template>
  <nav class="sv-nav" aria-label="Навигация по разделу «Сведения об образовательной организации»">
    <p class="sv-nav__title">Разделы</p>
    <ul class="sv-nav__list">
      <li>
        <RouterLink to="/sveden" class="sv-nav__link" exact-active-class="sv-nav__link--active">
          Все сведения
        </RouterLink>
      </li>
      <li v-for="(s, i) in SVEDEN_SECTIONS" :key="s.slug">
        <RouterLink
          :to="svedenPath(s.slug)"
          class="sv-nav__link"
          active-class="sv-nav__link--active"
        >
          <span class="sv-nav__num">{{ i + 1 }}</span>
          {{ s.short }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.sv-nav {
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  background: $color-bg-soft;
}

.sv-nav__title {
  margin: 0 0 $space-3;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $color-fg-muted;
}

.sv-nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sv-nav__link {
  display: flex;
  align-items: baseline;
  gap: $space-2;
  padding: $space-2 $space-3;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  line-height: $line-height-snug;
  color: $color-fg;

  &:hover {
    background: $color-white;
    color: $color-link;
  }

  &--active {
    background: $color-brand-500;
    color: $color-white;
    font-weight: $font-weight-semibold;

    &:hover {
      background: $color-brand-600;
      color: $color-white;
    }

    .sv-nav__num { color: rgba($color-white, 0.75); }
  }
}

.sv-nav__num {
  flex: none;
  min-width: 1.4em;
  font-size: $font-size-xs;
  font-variant-numeric: tabular-nums;
  color: $color-fg-muted;
}
</style>
