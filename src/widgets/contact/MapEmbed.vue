<script setup lang="ts">
/**
 * Карта проезда — настоящие Яндекс.Карты со всеми площадками клуба.
 *
 * Раньше здесь была нарисованная сетка с булавкой посередине: она выглядела
 * как карта, но ничего не показывала. Виджет `map-widget/v1` не требует
 * API-ключа, поэтому ждать ключ было не нужно.
 *
 * Iframe грузится лениво и получает `title` — без него скринридер объявляет
 * его как безымянный фрейм.
 */
import { computed } from 'vue'
import type { Venue } from '@/entities/contact/contact.types'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'

const props = defineProps<{ venues: ReadonlyArray<Venue> }>()

/** Площадки, у которых есть координаты: только их можно поставить на карту. */
const points = computed(() =>
  props.venues.filter((v): v is Venue & { lat: number; lon: number } =>
    typeof v.lat === 'number' && typeof v.lon === 'number'),
)

const center = computed(() => {
  const p = points.value
  if (!p.length) return null
  return {
    lat: p.reduce((s, v) => s + v.lat, 0) / p.length,
    lon: p.reduce((s, v) => s + v.lon, 0) / p.length,
  }
})

const src = computed(() => {
  const c = center.value
  if (!c) return null
  // Яндекс ждёт долготу первой. pm2blm — синяя метка с буквой.
  const pt = points.value.map((v) => `${v.lon.toFixed(6)},${v.lat.toFixed(6)},pm2blm`).join('~')
  return `https://yandex.ru/map-widget/v1/?ll=${c.lon.toFixed(6)},${c.lat.toFixed(6)}`
       + `&z=12&pt=${pt}`
})

/** Ссылка «открыть в Яндекс.Картах» — на главную площадку. */
const primary = computed(() => props.venues.find((v) => v.isPrimary) ?? props.venues[0] ?? null)
</script>

<template>
  <div class="map">
    <iframe
      v-if="src"
      class="map__frame"
      :src="src"
      title="Карта площадок ДФК «Динамчики» в Ставрополе"
      loading="lazy"
      allowfullscreen
    ></iframe>

    <div class="map__legend">
      <ul class="map__list">
        <li v-for="v in venues" :key="v.id" class="map__item">
          <strong class="map__name">{{ v.name }}</strong>
          <span class="map__addr">{{ v.address }}</span>
        </li>
      </ul>
      <a
        v-if="primary"
        :href="primary.mapUrl"
        target="_blank"
        rel="noopener"
        class="map__open"
      >
        Открыть на Яндекс.Картах
        <IconArrowRight :size="14" />
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.map {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: $space-5;
  align-items: stretch;

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr;
  }
}

.map__frame {
  width: 100%;
  min-height: 380px;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  // Виджет рисует свой белый фон — рамка не должна просвечивать сквозь углы.
  background: $color-bg-soft;
}

.map__legend {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-6;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
}

.map__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.map__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: $space-4;
  border-left: 3px solid $color-brand-500;
}

.map__name {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  line-height: 1.3;
}

.map__addr {
  font-size: $font-size-sm;
  color: $color-fg-muted;
}

.map__open {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  margin-top: auto;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
  text-decoration: none;

  &:hover { color: $color-brand-600; text-decoration: underline; }
}
</style>
