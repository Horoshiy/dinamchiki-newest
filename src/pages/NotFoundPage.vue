<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found">
    <section class="container">
      <p class="code">404</p>
      <h1>Страница не найдена</h1>
      <p>Возможно, она ещё не готова — мы работаем над этим.</p>
      <RouterLink class="back" to="/">На главную</RouterLink>
    </section>
  </main>
</template>

<style scoped lang="scss">
.not-found {
  flex: 1;
  display: flex;
  align-items: center;
  padding: $space-16 0;
}

.code {
  font-family: $font-family-display;
  font-size: $font-size-5xl;
  font-weight: $font-weight-black;
  color: $color-brand-600;
  margin-bottom: $space-2;
  letter-spacing: -0.04em;
}

h1 {
  font-size: $font-size-3xl;
  margin-bottom: $space-3;
}

p {
  color: $color-fg-muted;
  margin-bottom: $space-6;
}

.back {
  font-weight: $font-weight-semibold;
}
</style>
