// Клиентская валидация формы заявки.
// Живёт в сущности, а не в api-слое: к транспорту отношения не имеет.

import type { LeadFormDraft, LeadFormErrors } from './contact.types'
import { isPhoneComplete } from '@/shared/lib/phone'

/** Возвращает ошибки полей. Пустой объект = форма валидна. */
export function validateLeadForm(draft: LeadFormDraft): LeadFormErrors {
  const errors: LeadFormErrors = {}
  if (!draft.phone.trim())      errors.phone      = 'Укажите телефон'
  else if (!isPhoneComplete(draft.phone)) errors.phone = 'Введите номер полностью: +7 и 10 цифр'
  if (!draft.consent)           errors.consent    = 'Нужно согласие на обработку данных'
  return errors
}
