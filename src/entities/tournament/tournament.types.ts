// =============================================================================
// Типы доменной сущности Tournament (турнир клуба).
//
// Совместимы с будущей GraphQL-схемой (Этап 11).
// До подключения GraphQL данные приходят из моков (./tournaments.mocks.ts).
// =============================================================================

import type { ScheduleSlot } from '@/entities/team/team.types'

/** Статус турнира. */
export type TournamentStatus = 'upcoming' | 'live' | 'finished'

/** Тип матча в турнире. */
export type MatchKind = 'group' | 'quarter' | 'semi' | 'final'

/** Счёт матча. */
export interface MatchScore {
  home: number
  away: number
}

/** Команда-участник турнира (включая гостевые). */
export interface TournamentTeam {
  id: string
  name: string
  /** Сокращение для отображения в таблице (2-3 буквы) */
  shortName: string
  /** true если это команда нашего клуба (для подсветки в таблице) */
  isOurTeam: boolean
  /** hex цвета для бейджа команды */
  color: string
}

/** Матч турнира. */
export interface TournamentMatch {
  id: string
  /** Тип: групповой / плей-офф / финал */
  kind: MatchKind
  /** Дата + время матча в ISO 8601 */
  date: string
  /** ID хозяев (из TournamentTeam.id) */
  homeTeamId: string
  /** ID гостей */
  awayTeamId: string
  /** null если матч ещё не сыгран */
  score: MatchScore | null
  /** Место проведения */
  venue: string
}

/** Строка турнирной таблицы. */
export interface Standing {
  teamId: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  /** Позиция (1..N). Заполняется при сортировке. */
  position: number
}

/** Турнир. */
export interface Tournament {
  id: string
  name: string
  /** Описание в 1-2 предложения */
  description: string
  /** Возрастная группа турнира (если применимо) */
  ageGroup?: string
  /** Статус: upcoming / live / finished */
  status: TournamentStatus
  /** Дата начала (ISO) */
  startDate: string
  /** Дата окончания (ISO) */
  endDate: string
  /** Место проведения */
  venue: string
  /** Призовой фонд (текстом) */
  prizeFund: string
  /** Количество команд-участников */
  teamsCount: number
  /** Участники */
  teams: ReadonlyArray<TournamentTeam>
  /** Все матчи турнира */
  matches: ReadonlyArray<TournamentMatch>
  /** Рассчитанная таблица (на Этапе 11 будет считать бэкенд) */
  standings: ReadonlyArray<Standing>
}

/** Локализованный лейблы статусов. */
export const TOURNAMENT_STATUS_LABELS: Readonly<Record<TournamentStatus, string>> = {
  upcoming: 'Скоро',
  live:     'Идёт сейчас',
  finished: 'Завершён',
}

/** Цвет бейджа статуса. */
export const TOURNAMENT_STATUS_COLORS: Readonly<Record<TournamentStatus, string>> = {
  upcoming: '#5180f4',
  live:     '#16a34a',
  finished: '#5a6478',
}

/** Локализованные лейблы типа матча. */
export const MATCH_KIND_LABELS: Readonly<Record<MatchKind, string>> = {
  group:  'Группа',
  quarter:'1/4 финала',
  semi:   '1/2 финала',
  final:  'Финал',
}

/** Re-export для удобства импорта из виджетов. */
export type { ScheduleSlot }
