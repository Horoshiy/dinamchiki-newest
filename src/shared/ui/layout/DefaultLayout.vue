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
</script>

<template>
  <div class="layout">
    <BviPanel />
    <AppHeader />
    <main class="layout-main">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
