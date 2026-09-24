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
</script>

<template>
  <div class="layout">
    <BviPanel />
    <AppHeader />
    <main class="layout-main">
      <RouterView />
    </main>
    <AppFooter />
    <MobileContactBar />
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
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
