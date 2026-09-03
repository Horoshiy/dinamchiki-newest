// Клиентская валидация формы заявки.
// Живёт в сущности, а не в api-слое: к транспорту отношения не имеет.

import type { LeadFormDraft, LeadFormErrors } from './contact.types'

/** Возвращает ошибки полей. Пустой объект = форма валидна. */
export function validateLeadForm(draft: LeadFormDraft): LeadFormErrors {
  const errors: LeadFormErrors = {}
  if (!draft.childName.trim())  errors.childName  = 'Укажите имя ребёнка'
  if (!draft.childAge.trim())   errors.childAge   = 'Укажите возраст'
  if (!draft.parentName.trim()) errors.parentName = 'Укажите ваше имя'
  if (!draft.phone.trim())      errors.phone      = 'Укажите телефон'
  else if (!/^[\d\s+()-]{6,}$/.test(draft.phone)) errors.phone = 'Телефон выглядит странно'
  if (draft.email && !/^.+@.+\..+$/.test(draft.email)) errors.email = 'Email выглядит странно'
  if (!draft.consent)           errors.consent    = 'Нужно согласие на обработку данных'
  return errors
}
