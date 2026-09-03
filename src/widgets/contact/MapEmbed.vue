<script setup lang="ts">
/**
 * Карта проезда (плейсхолдер).
 *
 * Реальный iframe с Яндекс.Картами подключим на Этапе 11 (после получения API-ключа).
 * Сейчас — стилизованный плейсхолдер с иконкой, адресом и кнопкой «Открыть».
 */
import IconLocation from '@/shared/ui/icons/IconLocation.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'

defineProps<{
  address: string
  mapUrl: string
  /** Опционально — название площадки для отображения */
  venueName?: string
}>()
</script>

<template>
  <a :href="mapUrl" target="_blank" rel="noopener" class="map">
    <!-- Декоративный фон-плейсхолдер -->
    <div class="map__bg" aria-hidden="true">
      <svg class="map__svg" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30,80,216,0.1)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="600" height="300" fill="url(#map-grid)"/>
        <!-- Декоративные "улицы" -->
        <path d="M0 150 L600 150" stroke="rgba(30,80,216,0.25)" stroke-width="3"/>
        <path d="M300 0 L300 300" stroke="rgba(30,80,216,0.25)" stroke-width="3"/>
        <path d="M0 80 L600 80" stroke="rgba(30,80,216,0.15)" stroke-width="2"/>
        <path d="M0 220 L600 220" stroke="rgba(30,80,216,0.15)" stroke-width="2"/>
        <path d="M120 0 L120 300" stroke="rgba(30,80,216,0.15)" stroke-width="2"/>
        <path d="M480 0 L480 300" stroke="rgba(30,80,216,0.15)" stroke-width="2"/>
      </svg>

      <!-- Пин -->
      <div class="map__pin">
        <IconLocation :size="28" />
      </div>
    </div>

    <!-- Оверлей с адресом -->
    <div class="map__overlay">
      <div class="map__overlay-content">
        <span v-if="venueName" class="map__venue-name">{{ venueName }}</span>
        <strong class="map__address">{{ address }}</strong>
        <span class="map__open">
          Открыть на Яндекс.Картах
          <IconArrowRight :size="14" />
        </span>
      </div>
    </div>
  </a>
</template>

<style scoped lang="scss">
.map {
  position: relative;
  display: block;
  aspect-ratio: 2 / 1;
  border-radius: $radius-xl;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  background: $color-bg-soft;
  border: 1px solid $color-border;
  box-shadow: $shadow-sm;
  transition: box-shadow $transition-base, transform $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);

    .map__pin {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
}

.map__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(30, 80, 216, 0.04) 0%, rgba(81, 128, 244, 0.02) 100%);
}

.map__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.map__pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-brand-500;
  color: $color-white;
  border-radius: 50%;
  box-shadow: $shadow-lg;
  transition: transform $transition-base;
}

.map__overlay {
  position: absolute;
  bottom: $space-4;
  left: $space-4;
  right: $space-4;
}

.map__overlay-content {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  padding: $space-4 $space-5;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
}

.map__venue-name {
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-fg-muted;
  font-weight: $font-weight-bold;
}

.map__address {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  line-height: 1.2;
}

.map__open {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  margin-top: $space-1;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-brand-500;
}

@media (max-width: $bp-md) {
  .map__overlay-content { padding: $space-3 $space-4; }
  .map__address { font-size: $font-size-sm; }
}
</style>
