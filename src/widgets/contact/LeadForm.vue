<script setup lang="ts">
/**
 * Форма заявки на пробную тренировку.
 *
 * Поля:
 *   - Имя ребёнка (обяз.)
 *   - Возраст ребёнка (обяз.)
 *   - Имя родителя (обяз.)
 *   - Телефон (обяз.)
 *   - Email (опц., валидируется если заполнен)
 *   - Удобное время (опц., select)
 *   - Сообщение (опц., textarea)
 *   - Возрастная группа (опц., select)
 *   - Согласие на ПДн (обяз., checkbox)
 *
 * Состояния: idle / submitting / success / error.
 */
import { reactive, ref } from 'vue'
import type { LeadFormDraft, LeadFormErrors } from '@/entities/contact/contact.types'
import { validateLeadForm } from '@/entities/contact/lead.validation'
import { useSubmitApplicationMutation } from '@/shared/api/composables'
import IconSend from '@/shared/ui/icons/IconSend.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import DirectContacts from '@/widgets/contact/DirectContacts.vue'

const ageGroupOptions = [
  { value: '',         label: 'Не выбрано' },
  { value: '5-7',      label: '5–7 лет' },
  { value: '8-10',     label: '8–10 лет' },
  { value: '11-14',    label: '11–14 лет' },
]

const preferredTimeOptions = [
  { value: '',                  label: 'Любое время' },
  { value: 'morning',           label: 'Утро (9:00–12:00)' },
  { value: 'afternoon',         label: 'День (12:00–16:00)' },
  { value: 'evening',           label: 'Вечер (16:00–21:00)' },
  { value: 'weekend',           label: 'Выходные' },
]

const draft = reactive<LeadFormDraft>({
  childName: '',
  childAge: '',
  parentName: '',
  phone: '',
  email: '',
  preferredTime: '',
  message: '',
  ageGroup: '',
  consent: false,
})

const errors = ref<LeadFormErrors>({})
/**
 * 'unavailable' — сервер заявок не подключён. Отдельное состояние нужно,
 * чтобы не показывать «Заявка отправлена» там, где заявка никуда не ушла.
 */
const status = ref<'idle' | 'submitting' | 'success' | 'error' | 'unavailable'>('idle')
const submitError = ref<string | null>(null)
const leadId = ref<string | null>(null)

const { submit: doSubmit } = useSubmitApplicationMutation()

async function onSubmit() {
  // Клиентская валидация
  const v = validateLeadForm(draft)
  errors.value = v
  if (Object.keys(v).length > 0) return

  status.value = 'submitting'
  submitError.value = null
  try {
    const result = await doSubmit(draft)
    if (result.ok) {
      status.value = 'success'
      leadId.value = result.leadId ?? null
    } else if (result.notDelivered) {
      status.value = 'unavailable'
      submitError.value = null
    } else {
      status.value = 'error'
      submitError.value = result.error ?? 'Что-то пошло не так'
    }
  } catch (e) {
    status.value = 'error'
    submitError.value = (e as Error).message
  }
}

function resetForm() {
  draft.childName = ''
  draft.childAge = ''
  draft.parentName = ''
  draft.phone = ''
  draft.email = ''
  draft.preferredTime = ''
  draft.message = ''
  draft.ageGroup = ''
  draft.consent = false
  errors.value = {}
  status.value = 'idle'
  submitError.value = null
  leadId.value = null
}
</script>

<template>
  <div class="lform">
    <!-- Success state -->
    <div v-if="status === 'success'" class="lform__state lform__state--success">
      <div class="lform__state-icon">✓</div>
      <h3 class="lform__state-title">Заявка отправлена!</h3>
      <p class="lform__state-desc">
        Спасибо, <strong>{{ draft.childName }}</strong>! Тренер свяжется с вами
        в удобное время. Номер заявки: <code>{{ leadId }}</code>
      </p>
      <BaseButton variant="outline" @click="resetForm">Отправить ещё одну</BaseButton>
    </div>

    <!-- Сервер заявок не подключён: честно говорим и даём прямые контакты -->
    <div v-else-if="status === 'unavailable'" class="lform__state lform__state--unavailable">
      <div class="lform__state-icon">!</div>
      <h3 class="lform__state-title">Онлайн-заявка пока не работает</h3>
      <p class="lform__state-desc">
        Мы ещё подключаем приём заявок с сайта, поэтому эта форма не отправит
        ваше сообщение. Чтобы записаться на пробную тренировку, свяжитесь
        с нами напрямую — ответим в тот же день.
      </p>
      <DirectContacts class="lform__direct" />
      <BaseButton variant="outline" @click="resetForm">Вернуться к форме</BaseButton>
    </div>

    <!-- Form -->
    <form v-else class="lform__form" @submit.prevent="onSubmit">
      <div class="lform__row">
        <label class="lform__field">
          <span class="lform__label">Имя ребёнка <span class="lform__req">*</span></span>
          <input
            v-model="draft.childName"
            type="text"
            class="lform__input"
            :class="{ 'lform__input--error': errors.childName }"
            placeholder="Иван Иванов"
          />
          <span v-if="errors.childName" class="lform__error">{{ errors.childName }}</span>
        </label>

        <label class="lform__field">
          <span class="lform__label">Возраст <span class="lform__req">*</span></span>
          <input
            v-model="draft.childAge"
            type="text"
            class="lform__input"
            :class="{ 'lform__input--error': errors.childAge }"
            placeholder="7 лет"
          />
          <span v-if="errors.childAge" class="lform__error">{{ errors.childAge }}</span>
        </label>
      </div>

      <label class="lform__field">
        <span class="lform__label">Имя родителя <span class="lform__req">*</span></span>
        <input
          v-model="draft.parentName"
          type="text"
          class="lform__input"
          :class="{ 'lform__input--error': errors.parentName }"
          placeholder="Сергей Иванов"
        />
        <span v-if="errors.parentName" class="lform__error">{{ errors.parentName }}</span>
      </label>

      <div class="lform__row">
        <label class="lform__field">
          <span class="lform__label">Телефон <span class="lform__req">*</span></span>
          <input
            v-model="draft.phone"
            type="tel"
            class="lform__input"
            :class="{ 'lform__input--error': errors.phone }"
            placeholder="+7 (___) ___-__-__"
          />
          <span v-if="errors.phone" class="lform__error">{{ errors.phone }}</span>
        </label>

        <label class="lform__field">
          <span class="lform__label">Email</span>
          <input
            v-model="draft.email"
            type="email"
            class="lform__input"
            :class="{ 'lform__input--error': errors.email }"
            placeholder="name@example.com"
          />
          <span v-if="errors.email" class="lform__error">{{ errors.email }}</span>
        </label>
      </div>

      <div class="lform__row">
        <label class="lform__field">
          <span class="lform__label">Возрастная группа</span>
          <select v-model="draft.ageGroup" class="lform__input lform__select">
            <option v-for="o in ageGroupOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>

        <label class="lform__field">
          <span class="lform__label">Удобное время для связи</span>
          <select v-model="draft.preferredTime" class="lform__input lform__select">
            <option v-for="o in preferredTimeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
      </div>

      <label class="lform__field">
        <span class="lform__label">Сообщение (необязательно)</span>
        <textarea
          v-model="draft.message"
          class="lform__input lform__textarea"
          rows="3"
          placeholder="Удобная площадка, пожелания, вопросы..."
        />
      </label>

      <label class="lform__consent" :class="{ 'lform__consent--error': errors.consent }">
        <input v-model="draft.consent" type="checkbox" class="lform__checkbox" />
        <span class="lform__consent-text">
          Согласен на обработку персональных данных в соответствии с
          <a href="#" target="_blank">политикой конфиденциальности</a>
          <span class="lform__req">*</span>
        </span>
      </label>
      <span v-if="errors.consent" class="lform__error">{{ errors.consent }}</span>

      <div v-if="status === 'error' && submitError" class="lform__server-error">
        {{ submitError }}
      </div>

      <div class="lform__actions">
        <BaseButton
          type="submit"
          size="lg"
          variant="solid"
          :icon-right="IconSend"
          :loading="status === 'submitting'"
          block
        >
          {{ status === 'submitting' ? 'Отправляем...' : 'Записаться на пробную' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.lform {
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $space-8;
  box-shadow: $shadow-sm;

  // На узких экранах 32px с каждой стороны съедают пятую часть ширины.
  @media (max-width: $bp-md) {
    padding: $space-5;
    border-radius: $radius-lg;
  }
}

.lform__form {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.lform__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;

  @media (max-width: $bp-md) {
    grid-template-columns: 1fr;
  }
}

.lform__field {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.lform__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;
}

.lform__req {
  color: #dc2626;
  margin-left: 2px;
}

.lform__input {
  appearance: none;
  padding: $space-3 $space-4;
  border: 1.5px solid $color-border;
  border-radius: $radius-md;
  background: $color-white;
  font-family: $font-family-sans;
  font-size: $font-size-sm;
  color: $color-fg-strong;
  transition: border-color $transition-base, box-shadow $transition-base;

  &::placeholder {
    color: $color-fg-muted;
  }

  &:focus {
    outline: none;
    border-color: $color-brand-500;
    box-shadow: 0 0 0 3px rgba(30, 80, 216, 0.15);
  }

  &--error {
    border-color: #dc2626;

    &:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
    }
  }
}

.lform__select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6478' stroke-width='2'%3e%3cpath d='m6 9 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right $space-4 center;
  background-size: 12px;
  padding-right: $space-10;
}

.lform__textarea {
  resize: vertical;
  min-height: 80px;
}

.lform__error {
  font-size: $font-size-xs;
  color: #dc2626;
  font-weight: $font-weight-medium;
}

.lform__consent {
  display: flex;
  align-items: flex-start;
  gap: $space-3;
  cursor: pointer;

  &--error {
    .lform__checkbox {
      border-color: #dc2626;
    }
  }
}

.lform__checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 1.5px solid $color-border;
  border-radius: 4px;
  background: $color-white;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  transition: background $transition-base, border-color $transition-base;

  &:checked {
    background: $color-brand-500;
    border-color: $color-brand-500;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 6px;
      width: 5px;
      height: 10px;
      border: solid $color-white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.lform__consent-text {
  font-size: $font-size-sm;
  color: $color-fg;
  line-height: $line-height-base;

  a {
    color: $color-brand-500;
    text-decoration: underline;
  }
}

.lform__server-error {
  padding: $space-3 $space-4;
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
}

.lform__actions {
  margin-top: $space-2;
}

.lform__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-4;
  padding: $space-8;
}

.lform__state-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
  border-radius: 50%;
  font-size: 2rem;
  font-weight: $font-weight-extrabold;
}

.lform__state--unavailable {
  background: $color-warning-bg;
  border-color: $color-warning;

  .lform__state-icon {
    background: $color-warning;
    color: $color-white;
  }
}

.lform__direct {
  margin: $space-4 0 $space-6;
}

.lform__state--success {
  padding: $space-12 $space-6;
}

.lform__state-title {
  font-family: $font-family-display;
  font-size: $font-size-2xl;
  font-weight: $font-weight-extrabold;
  color: $color-fg-strong;
  margin: 0;
}

.lform__state-desc {
  font-size: $font-size-md;
  color: $color-fg;
  line-height: $line-height-base;
  margin: 0;
  max-width: 50ch;

  code {
    display: inline-block;
    padding: 2px $space-2;
    background: $color-bg-soft;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    color: $color-brand-500;
    font-weight: $font-weight-bold;
  }
}
</style>
