<script setup lang="ts">
/**
 * Layout по умолчанию — header + main + footer.
 *
 * Используется как `component` в роуте-обёртке (см. router/index.ts):
 *   { path: '/', component: DefaultLayout, children: [{ path: '', component: HomePage }, ...] }
 */
import AppHeader from '@/shared/ui/layout/AppHeader.vue'
import AppFooter from '@/shared/ui/layout/AppFooter.vue'
import BviPanel from '@/features/bvi/BviPanel.vue'
import MobileContactBar from '@/shared/ui/layout/MobileContactBar.vue'
import CookieNotice from '@/shared/ui/layout/CookieNotice.vue'
</script>

<template>
  <div class="layout">
    <a href="#main" class="skip-link">К содержимому</a>
    <BviPanel />
    <AppHeader />
    <main id="main" class="layout-main" tabindex="-1">
      <RouterView />
    </main>
    <AppFooter />
    <MobileContactBar />
    <CookieNotice />
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  // Место под липкую панель связи, иначе она перекрывает конец подвала.
  @media (max-width: $bp-md) {
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
}

.layout-main {
  flex: 1 1 auto;
  outline: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
