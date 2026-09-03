// =============================================================================
// Типы доменной сущности Player (игрок клуба).
//
// Совместимы с будущей GraphQL-схемой (Этап 11).
// До подключения GraphQL данные приходят из моков (./players.mocks.ts).
// =============================================================================

/** Позиция на поле. */
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD'

/** Статистика игрока за сезон/турнир. */
export interface PlayerStats {
  /** Матчей сыграно */
  matchesPlayed: number
  /** Голов забито */
  goals: number
  /** Голевых передач */
  assists: number
  /** Минут на поле */
  minutesPlayed: number
  /** Жёлтых карточек */
  yellowCards: number
  /** Красных карточек */
  redCards: number
}

/** Фотография в галерее игрока. */
export interface PlayerPhoto {
  id: string
  /** URL изображения (для моков — путь к плейсхолдеру) */
  url: string
  /** Подпись к фото (опционально) */
  caption?: string
  /** Соотношение сторон: 'square' | 'portrait' | 'landscape' */
  aspect: 'square' | 'portrait' | 'landscape'
}

/** Достижение игрока. */
export interface PlayerAchievement {
  id: string
  title: string
  description: string
  /** Год */
  year: number
  iconKey: 'trophy' | 'badge' | 'star' | 'award' | 'heart'
}

/** Ссылка на команду игрока. */
export interface PlayerTeamRef {
  id: string
  name: string
  ageLabel: string
  color: string
}

/** Ссылка на тренера игрока. */
export interface PlayerCoachRef {
  id: string
  fullName: string
  role: string
}

export interface Player {
  id: string
  /** Полное имя */
  fullName: string
  /** Возраст (лет) */
  age: number
  /** Игровой номер */
  jerseyNumber: number
  /** Позиция */
  position: PlayerPosition
  /** Краткая биография (1-2 предложения) */
  bio: string
  /** Градиент аватара-плейсхолдера */
  avatarGradient: string
  /** Команда, в которой играет */
  team: PlayerTeamRef
  /** Тренер */
  coach: PlayerCoachRef
  /** Статистика */
  stats: PlayerStats
  /** Фотогалерея */
  gallery: ReadonlyArray<PlayerPhoto>
  /** Достижения */
  achievements: ReadonlyArray<PlayerAchievement>
}

/** Локализованные лейблы позиций. */
export const POSITION_LABELS: Readonly<Record<PlayerPosition, string>> = {
  GK: 'Вратарь',
  DEF: 'Защитник',
  MID: 'Полузащитник',
  FWD: 'Нападающий',
}

/** Полные лейблы позиций (множественное число — для подписей). */
export const POSITION_LABELS_PLURAL: Readonly<Record<PlayerPosition, string>> = {
  GK: 'Вратари',
  DEF: 'Защитники',
  MID: 'Полузащитники',
  FWD: 'Нападающие',
}
