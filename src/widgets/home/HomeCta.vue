<script setup lang="ts">
/**
 * Финальный CTA главной: форма заявки на пробную тренировку + контактный блок.
 *
 * По мокапу (скрин 8):
 *   - Слева: форма с одним полем (телефон) + submit
 *   - Справа: 3 карточки контактов (телефон, WhatsApp, Telegram)
 *   - Внизу справа: трофей/щит с надписью
 */
import { computed } from 'vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import ConsentNote from '@/widgets/contact/ConsentNote.vue'
import DirectContacts from '@/widgets/contact/DirectContacts.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconTrophy from '@/shared/ui/icons/IconTrophy.vue'
import { useClubContacts } from '@/entities/contact/useClubContacts'
import { useLeadForm } from '@/features/lead-form/useLeadForm'
import { CHANNEL_ICONS } from '@/widgets/contact/channel-icons'

// Контакты — из базы, единым источником с шапкой и «Контактами».
// Почта в этом блоке не нужна: здесь — способы связаться быстро.
const { channels } = useClubContacts()
const ctaChannels = computed(() => channels.value.filter((c) => c.id !== 'email'))

// Логика общая с формой на «Контактах»; пометка — для менеджера в воронке.
const {
  phone,
  errors,
  status,
  submitError,
  isSubmitting,
  phoneErrorId,
  resultEl,
  onPhoneInput,
  onPhoneFocus,
  onPhoneBlur,
  onPhoneClick,
  onSubmit,
  reset,
} = useLeadForm({ message: 'Заявка с главной страницы' })
</script>

<template>
  <section class="cta">
    <div class="container">
      <div class="cta__inner">
        <!-- Левая колонка — форма -->
        <div class="cta__form-wrap">
          <p class="cta__eyebrow">Запишитесь сегодня</p>
          <h2 class="cta__title">
            Запишите ребёнка<br />
            <span class="cta__title-accent">на бесплатную пробную</span>
          </h2>
          <p class="cta__lead">
            Оставьте телефон — тренер перезвонит, подберёт группу
            и&nbsp;удобное время. Первая тренировка бесплатная
            и&nbsp;ни&nbsp;к&nbsp;чему не&nbsp;обязывает.
          </p>

          <form v-if="status !== 'success' && status !== 'unavailable'" class="form" @submit.prevent="onSubmit">
            <div class="form__field">
              <label for="lead-phone">Телефон</label>
              <input
                id="lead-phone"
                :value="phone"
                type="tel"
                inputmode="tel"
                placeholder="+7 (___) ___-__-__"
                required
                autocomplete="tel"
                :aria-invalid="errors.phone ? 'true' : undefined"
                :aria-describedby="errors.phone ? phoneErrorId : undefined"
                @input="onPhoneInput"
                @focus="onPhoneFocus"
                @blur="onPhoneBlur"
                @click="onPhoneClick"
              />
            </div>
            <BaseButton
              type="submit"
              size="lg"
              variant="solid"
              block
              :icon-left="IconCalendar"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Отправляем…' : 'Записаться на тренировку' }}
            </BaseButton>
            <p v-if="errors.phone" :id="phoneErrorId" class="form__server-error" role="alert">{{ errors.phone }}</p>
            <p v-else-if="status === 'error' && submitError" class="form__server-error" role="alert">{{ submitError }}</p>
            <ConsentNote button="Записаться на тренировку" />
          </form>

          <div v-else-if="status === 'success'" ref="resultEl" class="form-success" role="status" tabindex="-1">
            <p class="form-success__title">Спасибо! Заявка отправлена.</p>
            <p class="form-success__text">Тренер перезвонит вам по&nbsp;указанному номеру.</p>
          </div>

          <div v-else ref="resultEl" class="form-unavailable" role="status" tabindex="-1">
            <p class="form-unavailable__title">Онлайн-заявка пока не работает</p>
            <p class="form-unavailable__text">
              Приём заявок с сайта ещё подключается, поэтому форма не отправит
              ваше сообщение. Напишите или позвоните нам — ответим в тот же день.
            </p>
            <DirectContacts class="form-unavailable__direct" />
            <BaseButton variant="outline" @click="reset">Вернуться к форме</BaseButton>
          </div>
        </div>

        <!-- Правая колонка — контакты -->
        <aside class="cta__contacts">
          <p class="cta__eyebrow">Или свяжитесь напрямую</p>
          <h3 class="cta__contacts-title">Наши контакты</h3>

          <ul class="contacts">
            <li v-for="c in ctaChannels" :key="c.id" class="contact">
              <span class="contact__icon" :class="`contact__icon--${c.id}`">
                <component :is="CHANNEL_ICONS[c.id]" :size="22" color="#ffffff" />
              </span>
              <div class="contact__body">
                <p class="contact__label">{{ c.label }}</p>
                <a
                  :href="c.href"
                  class="contact__value"
                  v-bind="c.external ? { target: '_blank', rel: 'noopener' } : {}"
                >{{ c.value }}</a>
              </div>
            </li>
          </ul>

          <div class="cta__trophy" aria-hidden="true">
            <IconTrophy :size="40" color="#ffffff" />
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta {
  padding: $space-16 0 $space-20;
  background:
    radial-gradient(circle at 90% 90%, rgba(81, 128, 244, 0.10) 0%, transparent 50%),
    $color-bg-soft;
}

.form__server-error {
  margin: $space-3 0 0;
  padding: $space-3 $space-4;
  background: $color-error-bg;
  color: $color-error-fg;
  border-radius: $radius-md;
  font-size: $font-size-sm;
}

.form-unavailable {
  padding: $space-6;
  background: $color-warning-bg;
  border: 1px solid $color-warning;
  border-radius: $radius-lg;

  // Фокус ставится программно, чтобы читалка зачитала результат.
  &:focus { outline: none; }
}

.form-unavailable__title {
  margin: 0 0 $space-2;
  font-family: $font-family-display;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-warning-fg;
}

.form-unavailable__text {
  margin: 0;
  color: $color-fg;
  font-size: $font-size-sm;
  line-height: $line-height-base;
}

.form-unavailable__direct {
  margin: $space-4 0 $space-5;
}

.cta__inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: $space-12;
  align-items: start;

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr;
    gap: $space-10;
  }
}

// ---- Общие текстовые -----------------------------------------------------
.cta__eyebrow {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $color-brand-500;
  margin: 0 0 $space-3;
}

.cta__title {
  font-family: $font-family-display;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: $font-weight-extrabold;
  line-height: 1.1;
  color: $color-fg-strong;
  margin: 0 0 $space-4;
  letter-spacing: -0.02em;
}

.cta__title-accent {
  color: $color-brand-500;
}

.cta__lead {
  font-size: $font-size-md;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0 0 $space-8;
  max-width: 50ch;
}

// ---- Форма ---------------------------------------------------------------
.cta__form-wrap {
  background: $color-white;
  padding: $space-8;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
}

.form {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  label {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $color-fg-strong;
  }

  input,
  select {
    width: 100%;
    padding: $space-3 $space-4;
    font: inherit;
    font-size: $font-size-base;
    color: $color-fg;
    background: $color-white;
    border: 1.5px solid $color-border;
    border-radius: $radius-md;
    transition: border-color $transition-base, box-shadow $transition-base;

    &::placeholder { color: $color-ink-400; }

    &:focus {
      outline: none;
      border-color: $color-brand-500;
      box-shadow: 0 0 0 3px rgba(30, 80, 216, 0.12);
    }
  }

  select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='%231e50d8' d='M6 8L1.5 3.5h9z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: $space-10;
  }
}

.form-success {
  padding: $space-6;
  background: $color-brand-50;
  border-radius: $radius-md;
  border-left: 4px solid $color-brand-500;

  &__title {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-brand-700;
    margin: 0 0 $space-2;
  }

  &__text {
    font-size: $font-size-sm;
    color: $color-brand-700;
    margin: 0;
  }

  // Фокус ставится программно, чтобы читалка зачитала результат.
  &:focus { outline: none; }
}

// ---- Контакты ------------------------------------------------------------
.cta__contacts {
  position: relative;
}

.cta__contacts-title {
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  margin: 0 0 $space-6;
}

.contacts {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contact {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-5;
  background: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: box-shadow $transition-base, transform $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.contact__icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;

  &--phone    { background: linear-gradient(135deg, $color-brand-400 0%, $color-brand-600 100%); }
  &--whatsapp { background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); }
  &--telegram,
  &--max      { background: linear-gradient(135deg, #29b6f6 0%, #0288d1 100%); }
}

.contact__body { display: flex; flex-direction: column; gap: 2px; }

.contact__label {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: $font-weight-semibold;
  margin: 0;
}

.contact__value {
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  text-decoration: none;

  &:hover { color: $color-brand-500; }
}

.cta__trophy {
  position: absolute;
  bottom: -$space-12;
  right: -$space-4;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $color-brand-500 0%, $color-brand-700 100%);
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  transform: rotate(-8deg);

  @media (max-width: $bp-md) {
    display: none;
  }
}
</style>
