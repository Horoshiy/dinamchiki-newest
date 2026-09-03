// =============================================================================
// Типы сущностей PageContent и Review.
//
// Обе сущности прямо перечислены в ТЗ этапа 11, но раньше отсутствовали:
// контент главной лежал литералами внутри виджетов, из-за чего главная
// не зависела от слоя данных и расходилась с остальными страницами.
//
// Иконки не могут прийти из GraphQL (это Vue-компоненты), поэтому контент
// несёт строковый ключ иконки, а виджет сам мапит ключ → компонент.
// =============================================================================

import type { AgeGroupId } from '@/entities/team/team.types'

/** Ключ иконки. Маппинг ключ → компонент живёт в @/shared/ui/icons/registry. */
export type IconKey =
  | 'trophy'
  | 'users'
  | 'ball'
  | 'award'
  | 'shield'
  | 'calendar'
  | 'star'
  | 'heart'

/** Метрика клуба для блока «Клуб в цифрах». */
export interface StatItem {
  id: string
  value: string
  label: string
  caption: string
  iconKey: IconKey
}

/** Преимущество клуба для блока «Почему выбирают». */
export interface FeatureItem {
  id: string
  title: string
  description: string
  iconKey: IconKey
}

/** Возрастная программа для блока «Возрастные группы». */
export interface AgeProgram {
  id: string
  /** Диапазон для крупной подписи, например «5–7» */
  ageLabel: string
  title: string
  description: string
  /** Куда ведёт «Подробнее» — фильтр на странице команд */
  ageGroup: AgeGroupId
}

/** Шаг тренировки для блока «Как проходят тренировки». */
export interface TrainingStep {
  id: string
  title: string
  description: string
  iconKey: IconKey
}

/** Тексты hero-блока главной. */
export interface HeroContent {
  eyebrow: string
  titleLead: string
  titleAccent: string
  description: string
}

/** Контент главной страницы целиком. */
export interface PageContent {
  hero: HeroContent
  stats: ReadonlyArray<StatItem>
  features: ReadonlyArray<FeatureItem>
  programs: ReadonlyArray<AgeProgram>
  trainingSteps: ReadonlyArray<TrainingStep>
}

/** Отзыв родителя. */
export interface Review {
  id: string
  text: string
  /** Имя автора, например «Анна К.» */
  authorName: string
  /** Кем приходится ребёнку, например «мама Артёма, 9 лет» */
  authorRelation: string
  /** Инициал для аватара-плейсхолдера */
  initials: string
}
