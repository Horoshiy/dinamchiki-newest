<script setup lang="ts">
/**
 * Карточка площадки клуба (филиала).
 *
 * Адрес + расписание + возрастные группы + ссылка «Открыть на карте».
 */
import { computed } from 'vue'
import type { Venue } from '@/entities/contact/contact.types'
import IconLocation from '@/shared/ui/icons/IconLocation.vue'
import IconClock from '@/shared/ui/icons/IconClock.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'
import IconUsers from '@/shared/ui/icons/IconUsers.vue'

const props = defineProps<{ venue: Venue }>()

const ageGroupsText = computed(() => props.venue.ageGroups.join(' · '))
</script>

<template>
  <!-- Плашку «Главная» и выделение убрали 30.10: все площадки равны.
       isPrimary остаётся только для центра карты (MapEmbed). -->
  <article class="venue">
    <div class="venue__head">
      <h3 class="venue__name">{{ venue.name }}</h3>
    </div>

    <dl class="venue__meta">
      <div class="venue__meta-item">
        <dt><IconLocation :size="16" /> Адрес</dt>
        <dd>{{ venue.address }}</dd>
      </div>
      <div class="venue__meta-item">
        <dt><IconClock :size="16" /> Часы работы</dt>
        <dd>{{ venue.workingHours }}</dd>
      </div>
      <!-- Группы к площадкам ещё не привязаны: пустая строка «Возрастные
           группы» выглядела как недогруженные данные. -->
      <div v-if="ageGroupsText" class="venue__meta-item">
        <dt><IconUsers :size="16" /> Возрастные группы</dt>
        <dd>{{ ageGroupsText }}</dd>
      </div>
    </dl>

    <a :href="venue.mapUrl" target="_blank" rel="noopener" class="venue__link">
      Открыть на Яндекс.Картах
      <IconArrowRight :size="14" />
    </a>
  </article>
</template>

<style scoped lang="scss">
.venue {
  display: flex;
  flex-direction: column;
  gap: $space-4;
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

.venue__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;
  flex-wrap: wrap;
}

.venue__name {
  font-family: $font-family-display;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0;
  letter-spacing: -0.01em;
}

.venue__meta {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin: 0;
}

.venue__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;

  dt {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    font-size: $font-size-xs;
    color: $color-fg-muted;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: $font-weight-semibold;
    margin: 0;
  }

  dd {
    margin: 0;
    font-size: $font-size-sm;
    color: $color-fg;
    line-height: $line-height-base;
  }
}

.venue__link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  margin-top: auto;
  padding-top: $space-3;
  border-top: 1px solid $color-border;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
  text-decoration: none;
  transition: gap $transition-base;

  &:hover {
    gap: $space-3;
  }
}
</style>
