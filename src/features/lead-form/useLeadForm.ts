/**
 * Логика формы заявки на пробную тренировку — одна на обе формы сайта
 * (LeadForm на «Контактах» и HomeCta на главной).
 *
 * Раньше у каждой формы была своя копия: маска, проверка телефона,
 * защита от двойной отправки, перевод фокуса — и правки приходилось
 * повторять дважды (одна форма проверяла номер через validateLeadForm,
 * другая через isPhoneComplete со своим текстом ошибки).
 *
 * Форма собирает только телефон. Согласие на ПДн даётся нажатием кнопки
 * (подпись со ссылкой под ней), как зовут и про ребёнка тренер спросит
 * при звонке.
 */
import { computed, nextTick, ref, useId } from 'vue'
import type { LeadFormErrors } from '@/entities/contact/contact.types'
import { validateLeadForm } from '@/entities/contact/lead.validation'
import { applyPhoneMask, normalizePhone, onPhoneBlur as maskBlur, onPhoneFocus as maskFocus, placePhoneCaret } from '@/shared/lib/phone'
import { useSubmitApplicationMutation } from '@/shared/api/composables'

/**
 * 'unavailable' — сервер заявок не подключён. Отдельное состояние нужно,
 * чтобы не показывать «Заявка отправлена» там, где заявка никуда не ушла.
 */
export type LeadFormStatus = 'idle' | 'submitting' | 'success' | 'error' | 'unavailable'

export interface UseLeadFormOptions {
  /** Пометка для менеджера, откуда пришла заявка. */
  message?: string
}

export function useLeadForm(options: UseLeadFormOptions = {}) {
  const phone = ref('')
  const errors = ref<LeadFormErrors>({})
  const status = ref<LeadFormStatus>('idle')
  const submitError = ref<string | null>(null)
  const leadId = ref<string | null>(null)

  const isSubmitting = computed(() => status.value === 'submitting')
  const phoneErrorId = useId()

  const { submit } = useSubmitApplicationMutation()

  /**
   * Маска ввода: что бы ни набрали — «8 928…», «7928…», «+7 928…» — в поле
   * останется «+7 (928) 320-04-94».
   */
  function onPhoneInput(e: Event) {
    phone.value = applyPhoneMask(e.target as HTMLInputElement)
  }

  /** Фокус: сразу «+7 (» и курсор на месте первой цифры. */
  function onPhoneFocus(e: FocusEvent) {
    phone.value = maskFocus(e.target as HTMLInputElement)
  }

  function onPhoneBlur(e: FocusEvent) {
    phone.value = maskBlur(e.target as HTMLInputElement)
  }

  /** Клик по «+7 (» уводит курсор к месту следующей цифры. */
  function onPhoneClick(e: MouseEvent) {
    placePhoneCaret(e.target as HTMLInputElement)
  }

  /**
   * Форма целиком сменяется результатом, и фокус с кнопки пропадал в никуда:
   * читалка экрана молчала, а с клавиатуры приходилось начинать с начала
   * страницы. Компонент вешает этот ref на заголовок результата (tabindex="-1").
   */
  const resultEl = ref<HTMLElement | null>(null)
  async function focusResult() {
    await nextTick()
    resultEl.value?.focus()
  }

  async function onSubmit() {
    if (isSubmitting.value) return
    // Согласие — само нажатие кнопки.
    const draft = { phone: phone.value, consent: true }
    errors.value = validateLeadForm(draft)
    if (Object.keys(errors.value).length > 0) return

    status.value = 'submitting'
    submitError.value = null
    try {
      // В бэкенд уходит каноничный «+79283200494», а не то, что видно в поле.
      const result = await submit({
        ...draft,
        phone: normalizePhone(draft.phone),
        ...(options.message ? { message: options.message } : {}),
      })
      if (result.ok) {
        status.value = 'success'
        leadId.value = result.leadId ?? null
        phone.value = ''
        void focusResult()
      } else if (result.notDelivered) {
        status.value = 'unavailable'
        void focusResult()
      } else {
        status.value = 'error'
        submitError.value = result.error ?? 'Что-то пошло не так'
      }
    } catch (e) {
      status.value = 'error'
      submitError.value = (e as Error).message
    }
  }

  function reset() {
    phone.value = ''
    errors.value = {}
    status.value = 'idle'
    submitError.value = null
    leadId.value = null
  }

  return {
    phone,
    errors,
    status,
    submitError,
    leadId,
    isSubmitting,
    phoneErrorId,
    resultEl,
    onPhoneInput,
    onPhoneFocus,
    onPhoneBlur,
    onPhoneClick,
    onSubmit,
    reset,
  }
}
