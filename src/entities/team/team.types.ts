// =============================================================================
// Тип доменной сущности Team (команда клуба).
//
// Совместим с будущей GraphQL-схемой (Этап 11).
// До подключения GraphQL данные приходят из моков (./teams.mocks.ts).
// =============================================================================

export type AgeGroupId = '5-7' | '8-10' | '11-14' | 'mixed'

export interface CoachRef {
  id: string
  name: string
  role: string
}

export interface ScheduleSlot {
  /** День недели на русском: Пн, Вт, ... */
  day: string
  /** Время начала, формат HH:mm */
  time: string
  /** Место проведения */
  venue: string
}

export interface Team {
  /** ID команды */
  id: string
  /** Название команды, например "Динамчики U-10" */
  name: string
  /** Возрастная группа (диапазон) */
  ageGroup: AgeGroupId
  /** Человеко-читаемое название возраста, например "8–10 лет" */
  ageLabel: string
  /** Тренер (один основной) */
  coach: CoachRef
  /** Краткое описание программы */
  description: string
  /** Количество игроков в составе */
  playersCount: number
  /** Расписание тренировок */
  schedule: ReadonlyArray<ScheduleSlot>
  /** Цветовая метка команды (hex) для бейджа */
  color: string
}
