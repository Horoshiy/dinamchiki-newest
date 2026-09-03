// =============================================================================
// Тип доменной сущности Coach (тренер клуба).
//
// Совместим с будущей GraphQL-схемой (Этап 11).
// До подключения GraphQL данные приходят из моков (./coaches.mocks.ts).
// =============================================================================

import type { ScheduleSlot } from '@/entities/team/team.types'
import type { GalleryPhoto } from '@/entities/gallery/gallery.types'

/** Специализация тренера (позиция на поле). */
export type CoachSpec = 'GK' | 'DEF' | 'MID' | 'FWD'

/**
 * Возрастная группа, с которой работает тренер.
 * Совпадает с образовательными программами по лицензии № 4557.
 */
export type CoachAgeGroup = '3-5' | '6-7' | '8-10' | '11-14' | 'mixed'

/** Достижение / регалия тренера (опционально, на детальной странице). */
export interface CoachAchievement {
  /** Краткий заголовок. */
  title: string
  /** Одно предложение пояснения. */
  description: string
  /** Ключ иконки: 'trophy' | 'badge' | 'star' | 'heart'. */
  iconKey: 'trophy' | 'badge' | 'star' | 'heart'
}

/** Ссылка на команду в карточке тренера (id + имя + возраст). */
export interface CoachTeamRef {
  id: string
  name: string
  ageGroup: string
  ageLabel: string
  schedule: ReadonlyArray<ScheduleSlot>
}

export interface Coach {
  /** ID тренера (slug) */
  id: string
  /** Полное ФИО */
  fullName: string
  /** Роль / должность (например «Главный тренер», «Тренер вратарей») */
  role: string
  /** Цитата-описание для hero-блока (1-2 предложения) */
  description: string
  /** Опыт работы в годах */
  experienceYears: number
  /** Позиции, на которых специализируется тренер */
  specialization: ReadonlyArray<CoachSpec>
  /** Возрастные группы, с которыми работает тренер */
  ageGroups: ReadonlyArray<CoachAgeGroup>
  /** Достижения / регалии (для детальной страницы) */
  achievements: ReadonlyArray<CoachAchievement>
  /** Команды, которые тренер ведёт */
  teams: ReadonlyArray<CoachTeamRef>
  /** Краткая галерея тренера (требование этапа 6 ТЗ) */
  gallery: ReadonlyArray<GalleryPhoto>
  /** Градиент для аватара-плейсхолдера (используется CSS) */
  avatarGradient: string
}

/** Человеко-читаемые лейблы возрастных групп. */
export const COACH_AGE_LABELS: Readonly<Record<CoachAgeGroup, string>> = {
  '3-5': '3–5',
  '6-7': '6–7',
  '8-10': '8–10',
  '11-14': '11–14',
  mixed: 'смешанная',
}

/** Человеко-читаемые лейблы специализаций. */
export const COACH_SPEC_LABELS: Readonly<Record<CoachSpec, string>> = {
  GK: 'Вратари',
  DEF: 'Защитники',
  MID: 'Полузащитники',
  FWD: 'Нападающие',
}
