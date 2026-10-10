<script setup lang="ts">
/**
 * Уведомление о cookie. Яндекс Метрика запускается только после «Хорошо»
 * (см. shared/lib/metrika.ts). Если счётчик в сборке не задан — на бете —
 * баннера нет: спрашивать согласие не на что.
 */
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { acceptCookies, hasCookieConsent, isMetrikaEnabled } from '@/shared/lib/metrika'

const visible = ref(isMetrikaEnabled() && !hasCookieConsent())

function accept() {
  acceptCookies()
  visible.value = false
}
</script>

<template>
  <div v-if="visible" class="cookie" role="region" aria-label="Уведомление о cookie">
    <p class="cookie__text">
      Сайт использует cookie и&nbsp;Яндекс Метрику, чтобы считать посещения.
      <RouterLink to="/privacy">Подробнее</RouterLink>
    </p>
    <button type="button" class="cookie__btn" @click="accept">Хорошо</button>
  </div>
</template>

<style scoped lang="scss">
.cookie {
  position: fixed;
  left: $space-4;
  right: $space-4;
  bottom: $space-4;
  z-index: 70;
  display: flex;
  align-items: center;
  gap: $space-4;
  max-width: 560px;
  margin: 0 auto;
  padding: $space-3 $space-4;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;

  // Над липкой панелью «Позвонить / WhatsApp».
  @media (max-width: $bp-md) {
    bottom: calc(76px + env(safe-area-inset-bottom) + #{$space-2});
  }
}

.cookie__text {
  margin: 0;
  font-size: $font-size-sm;
  line-height: 1.45;
  color: $color-fg;

  a { color: $color-brand-600; }
}

.cookie__btn {
  flex-shrink: 0;
  min-height: 44px;
  padding: 0 $space-5;
  border: 0;
  border-radius: $radius-md;
  background: $color-brand-500;
  color: $color-white;
  font: inherit;
  font-weight: $font-weight-semibold;
  cursor: pointer;

  &:hover { background: $color-brand-600; }
  &:focus-visible { outline: 3px solid $color-brand-600; outline-offset: 2px; }
}
</style>
