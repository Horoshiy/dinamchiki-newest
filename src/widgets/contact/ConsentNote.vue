<script setup lang="ts">
/**
 * Подпись под кнопкой заявки: согласие на обработку ПДн даётся нажатием.
 *
 * Сознательно не галочка (решение 09.10.2026: на одно действие меньше).
 * Чтобы такое согласие было информированным, подпись обязана вести на
 * отдельный текст согласия (ч. 1 ст. 9 152-ФЗ) — раньше ссылки не было.
 */
import { RouterLink } from 'vue-router'

defineProps<{ button: string }>()
</script>

<template>
  <p class="consent-note">
    Нажимая «{{ button }}», вы&nbsp;даёте
    <RouterLink to="/consent" target="_blank">согласие на&nbsp;обработку персональных данных</RouterLink>
    в&nbsp;соответствии с&nbsp;<RouterLink to="/privacy" target="_blank">политикой</RouterLink>.
  </p>
</template>

<style scoped lang="scss">
.consent-note {
  margin: $space-3 0 0;
  font-size: $font-size-xs;
  line-height: 1.5;
  color: $color-fg-muted;
  text-align: center;

  a {
    color: inherit;
    text-decoration: underline;

    &:hover { color: $color-brand-600; }
  }
}
</style>
