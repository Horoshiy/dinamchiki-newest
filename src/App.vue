<script setup lang="ts">
// Корневой шаблон. Все страницы обёрнуты в DefaultLayout через router (см. router/index.ts),
// поэтому App.vue остаётся минимальным.
</script>

<template>
  <RouterView />
</template>

<style lang="scss">
// Корневой компонент — стили не нужны, всё в global.scss и в layout-страницах.
</style>
