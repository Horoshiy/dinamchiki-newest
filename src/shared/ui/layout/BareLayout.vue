<script setup lang="ts">
/**
 * Layout без header/footer — для 404 и технических страниц.
 */
</script>

<template>
  <div class="layout-bare">
    <RouterView />
  </div>
</template>

<style scoped lang="scss">
.layout-bare {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
