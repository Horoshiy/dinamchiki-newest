// =============================================================================
// Типы доменной сущности Contact (контакты клуба).
//
// Совместимы с будущей GraphQL-схемой (Этап 11).
// До подключения GraphQL данные приходят из моков (./contacts.mocks.ts).
// =============================================================================

/** Мессенджер. */
export type Messenger = 'whatsapp' | 'telegram' | 'phone' | 'email'

/** Площадка / филиал клуба. */
export interface Venue {
  id: string
  /** Название площадки */
  name: string
  /** Полный адрес */
  address: string
  /** Короткий адрес для отображения на карте */
  shortAddress: string
  /** Расписание работы (текстом) */
  workingHours: string
  /** Телефон площадки (опционально — может быть общим) */
  phone?: string
  /** Какие возрастные группы здесь занимаются */
  ageGroups: ReadonlyArray<string>
  /** Ссылка на Яндекс.Карты (или Google Maps) */
  mapUrl: string
  /** Является ли основной площадкой */
  isPrimary: boolean
  /** Координаты площадки — для карты. */
  lat?: number | null
  lon?: number | null
}

/** Контактная информация клуба. */
export interface ContactInfo {
  /** Главный телефон */
  phone: string
  /** Телефон для отображения (отформатированный) */
  phoneFormatted: string
  /** WhatsApp-номер (обычно тот же, что и phone, но без +) */
  whatsapp: string
  /** Telegram-аккаунт */
  telegram: string
  /** Email */
  email: string
  /** Юридический адрес */
  legalAddress: string
  /** Фактический адрес (может отсутствовать) */
  address?: string
  /** Часы работы офиса — источник правды для «Контактов» и подвала */
  workingHours?: string
  /** ИНН/ОГРН (опционально) */
  inn?: string
  /** Ссылки на соцсети */
  socials: {
    vk?: string
    youtube?: string
    telegram?: string
    /** Мессенджер MAX — второй канал связи наравне с Telegram. */
    max?: string
  }
}

/** Заполненная форма заявки. */
/**
 * Черновик формы заявки. Обе формы сайта собирают только телефон:
 * остальное — как зовут, имя и возраст ребёнка, группу, удобное время —
 * тренер уточняет при звонке.
 */
export interface LeadFormDraft {
  phone: string
  /** Согласие на обработку ПДн */
  consent: boolean
}

/** Ошибки валидации. */
export interface LeadFormErrors {
  phone?: string
  consent?: string
}

/** Ответ на submit заявки. */
export interface LeadSubmitResult {
  ok: boolean
  /** ID заявки (если ok=true) */
  leadId?: string
  /** Текст ошибки (если ok=false) */
  error?: string
  /**
   * true — сервер заявок недоступен, заявка НЕ доставлена.
   * UI обязан показать прямые контакты, а не благодарность.
   */
  notDelivered?: boolean
}
