<script setup lang="ts">
/**
 * Блок контактной информации: телефон, мессенджеры, email, часы работы, юр. адрес.
 *
 * Каждый контакт — крупная кликабельная карточка с иконкой.
 * Под телефоном — сетка в две колонки: мессенджеры и email
 * (email стоит рядом с MAX), ниже юр. адрес рядом с часами работы.
 */
import { computed } from 'vue'
import type { ContactInfo } from '@/entities/contact/contact.types'
import { resolveContacts } from '@/entities/contact/useClubContacts'
import { CHANNEL_ICONS } from '@/widgets/contact/channel-icons'
import IconPhone from '@/shared/ui/icons/IconPhone.vue'
import IconMail from '@/shared/ui/icons/IconMail.vue'
import IconLocation from '@/shared/ui/icons/IconLocation.vue'
import IconClock from '@/shared/ui/icons/IconClock.vue'
import IconArrowRight from '@/shared/ui/icons/IconArrowRight.vue'

const props = defineProps<{ contact: ContactInfo }>()

// В базе ИНН лежит то голым номером, то строкой «ИНН … / ОГРН …».
const innLabel = computed(() => {
  const v = props.contact.inn ?? ''
  return /^ИНН/i.test(v) ? v : `ИНН ${v}`
})

// Ссылки и подписи — той же функцией, что в шапке и подвале.
const contacts = computed(() => resolveContacts(props.contact))
const messengers = computed(() =>
  contacts.value.channels.filter((c) => ['whatsapp', 'telegram', 'max'].includes(c.id)),
)

/**
 * Часы работы приходят из базы одной строкой. Раньше здесь было
 * захардкожено «Пн–Пт 9:00–21:00 / Сб 10:00–18:00», и это расходилось
 * с тем, что стоит в админке.
 */
const workingHours = computed(() => props.contact.workingHours?.trim() || null)

</script>

<template>
  <div class="cinfo">
    <a :href="contacts.phoneHref" class="cinfo__item cinfo__item--primary">
      <div class="cinfo__icon">
        <IconPhone :size="22" />
      </div>
      <div class="cinfo__body">
        <span class="cinfo__label">Телефон</span>
        <strong class="cinfo__value">{{ contacts.phoneDisplay }}</strong>
      </div>
      <IconArrowRight :size="18" class="cinfo__arrow" />
    </a>

    <div class="cinfo__row">
      <a
        v-for="c in messengers"
        :key="c.id"
        :href="c.href"
        target="_blank"
        rel="noopener"
        class="cinfo__item"
      >
        <div class="cinfo__icon" :class="`cinfo__icon--${c.id}`">
          <component :is="CHANNEL_ICONS[c.id]" :size="22" />
        </div>
        <div class="cinfo__body">
          <span class="cinfo__label">{{ c.label }}</span>
          <strong class="cinfo__value">{{ c.value }}</strong>
        </div>
      </a>

      <a :href="contacts.emailHref" class="cinfo__item">
        <div class="cinfo__icon cinfo__icon--mail">
          <IconMail :size="22" />
        </div>
        <div class="cinfo__body">
          <span class="cinfo__label">Email</span>
          <strong class="cinfo__value">{{ contacts.email }}</strong>
        </div>
      </a>
    </div>

    <div class="cinfo__row">
      <div class="cinfo__item cinfo__item--static">
        <div class="cinfo__icon">
          <IconLocation :size="22" />
        </div>
        <div class="cinfo__body">
          <span class="cinfo__label">Юридический адрес</span>
          <strong class="cinfo__value">{{ contact.legalAddress }}</strong>
          <span v-if="contact.inn" class="cinfo__sub">{{ innLabel }}</span>
        </div>
      </div>

      <div v-if="workingHours" class="cinfo__item cinfo__item--static">
        <div class="cinfo__icon">
          <IconClock :size="22" />
        </div>
        <div class="cinfo__body">
          <span class="cinfo__label">Часы работы офиса</span>
          <strong class="cinfo__value">{{ workingHours }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cinfo {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.cinfo__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-3;

  @media (max-width: $bp-sm) {
    grid-template-columns: 1fr;
  }
}

.cinfo__item {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4 $space-5;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  text-decoration: none;
  color: inherit;
  transition: box-shadow $transition-base, transform $transition-base, border-color $transition-base;

  &:hover {
    box-shadow: $shadow-sm;
    transform: translateY(-1px);
    border-color: $color-brand-500;
  }

  &--primary {
    background: linear-gradient(135deg, rgba(30, 80, 216, 0.04) 0%, rgba(81, 128, 244, 0.02) 100%);
    border-color: rgba(30, 80, 216, 0.2);

    .cinfo__icon {
      background: $color-brand-500;
      color: $color-white;
    }
  }

  &--static {
    cursor: default;
    &:hover { transform: none; box-shadow: none; border-color: $color-border; }
  }
}

.cinfo__icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 80, 216, 0.08);
  color: $color-brand-500;
  border-radius: $radius-md;

  &--whatsapp {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }
  &--max {
    background: #6b4eff;
    color: $color-white;
  }

  &--telegram {
    background: rgba(56, 132, 230, 0.1);
    color: #2563eb;
  }
  &--mail {
    background: rgba(234, 88, 12, 0.1);
    color: #ea580c;
  }
}

.cinfo__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.cinfo__label {
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-fg-muted;
  font-weight: $font-weight-semibold;
}

.cinfo__value {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  line-height: 1.2;
}

.cinfo__sub {
  font-size: $font-size-xs;
  color: $color-fg-muted;
}

.cinfo__arrow {
  color: $color-fg-muted;
  flex-shrink: 0;
}
</style>
