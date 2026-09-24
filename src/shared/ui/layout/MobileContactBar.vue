<script setup lang="ts">
/**
 * Липкая панель связи внизу экрана — только на телефонах.
 *
 * Зачем: большинство родителей смотрят сайт с телефона, и единственным
 * путём связаться была форма из восьми полей внизу «Контактов».
 * Позвонить или написать в WhatsApp — два действия, которые люди делают
 * охотнее, чем заполняют анкету.
 *
 * Панель не показывается на самой странице «Контакты»: там телефон,
 * мессенджеры и форма и так на экране, и панель только перекрывала бы их.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useClubContacts } from '@/entities/contact/useClubContacts'
import IconPhone from '@/shared/ui/icons/IconPhone.vue'
import IconWhatsApp from '@/shared/ui/icons/IconWhatsApp.vue'

const route = useRoute()
const { phoneHref, whatsappHref } = useClubContacts()

const visible = computed(() => route.path !== '/contacts')
</script>

<template>
  <div v-if="visible" class="mcb">
    <a :href="phoneHref" class="mcb__btn mcb__btn--call">
      <IconPhone :size="18" />
      Позвонить
    </a>
    <a :href="whatsappHref" target="_blank" rel="noopener" class="mcb__btn mcb__btn--wa">
      <IconWhatsApp :size="18" />
      WhatsApp
    </a>
  </div>
</template>

<style scoped lang="scss">
.mcb {
  display: none;
}

@media (max-width: $bp-md) {
  .mcb {
    position: fixed;
    left: 0;
    right: 0;
    // Учитываем «шторку» iPhone, иначе кнопки уезжают под системную полосу.
    bottom: 0;
    z-index: 60;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-2;
    padding: $space-3 $space-4 calc(#{$space-3} + env(safe-area-inset-bottom));
    background: $color-white;
    border-top: 1px solid $color-border;
    box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.08);
  }
}

.mcb__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  min-height: 48px;
  border-radius: $radius-md;
  font-weight: $font-weight-semibold;
  font-size: $font-size-sm;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid $color-brand-600;
    outline-offset: 2px;
  }
}

.mcb__btn--call {
  background: $color-brand-500;
  color: $color-white;
}

.mcb__btn--wa {
  background: $color-brand-50;
  color: $color-brand-600;
  border: 1px solid $color-brand-100;
}
</style>
