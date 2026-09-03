// =============================================================================
// Mock-данные команд. До подключения GraphQL (Этап 11).
// Структура 1-в-1 с будущим ответом teams query.
// =============================================================================
import type { Team } from './team.types'

export const teamsMock: ReadonlyArray<Team> = [
  {
    id: 'u8-blue',
    name: 'Динамчики U-8',
    ageGroup: '5-7',
    ageLabel: '5–7 лет',
    coach: { id: 'maria',  name: 'Мария Петрова',   role: 'Тренер младших' },
    description: 'Первое знакомство с футболом через игру. Базовая координация, простые упражнения с мячом, мини-матчи.',
    playersCount: 14,
    schedule: [
      { day: 'Пн', time: '17:00', venue: 'Манеж «Динамо»' },
      { day: 'Ср', time: '17:00', venue: 'Манеж «Динамо»' },
      { day: 'Сб', time: '11:00', venue: 'Стадион «Динамо»' },
    ],
    color: '#1e50d8',
  },
  {
    id: 'u8-white',
    name: 'Динамчики U-8 White',
    ageGroup: '5-7',
    ageLabel: '5–7 лет',
    coach: { id: 'elena', name: 'Елена Смирнова', role: 'Тренер' },
    description: 'Вторая команда возраста U-8. Игровая практика, первые турниры внутри клуба.',
    playersCount: 12,
    schedule: [
      { day: 'Вт', time: '17:00', venue: 'Манеж «Динамо»' },
      { day: 'Чт', time: '17:00', venue: 'Манеж «Динамо»' },
      { day: 'Сб', time: '12:00', venue: 'Стадион «Динамо»' },
    ],
    color: '#5180f4',
  },
  {
    id: 'u10-blue',
    name: 'Динамчики U-10',
    ageGroup: '8-10',
    ageLabel: '8–10 лет',
    coach: { id: 'alexey', name: 'Алексей Иванов', role: 'Главный тренер' },
    description: 'Техника владения мячом, простые тактические схемы, первые выездные турниры.',
    playersCount: 16,
    schedule: [
      { day: 'Пн', time: '18:30', venue: 'Стадион «Динамо»' },
      { day: 'Ср', time: '18:30', venue: 'Стадион «Динамо»' },
      { day: 'Пт', time: '18:30', venue: 'Манеж «Динамо»' },
    ],
    color: '#1e50d8',
  },
  {
    id: 'u10-white',
    name: 'Динамчики U-10 White',
    ageGroup: '8-10',
    ageLabel: '8–10 лет',
    coach: { id: 'sergey', name: 'Сергей Кузнецов', role: 'Тренер' },
    description: 'Тренировочная группа U-10 с упором на индивидуальную технику и командную игру.',
    playersCount: 15,
    schedule: [
      { day: 'Вт', time: '18:30', venue: 'Стадион «Динамо»' },
      { day: 'Чт', time: '18:30', venue: 'Стадион «Динамо»' },
      { day: 'Сб', time: '13:00', venue: 'Стадион «Динамо»' },
    ],
    color: '#5180f4',
  },
  {
    id: 'u12-blue',
    name: 'Динамчики U-12',
    ageGroup: '11-14',
    ageLabel: '11–14 лет',
    coach: { id: 'alexey', name: 'Алексей Иванов', role: 'Главный тренер' },
    description: 'Основной состав U-12. Участие в городских и региональных турнирах, серьёзная подготовка.',
    playersCount: 18,
    schedule: [
      { day: 'Пн', time: '19:30', venue: 'Стадион «Динамо»' },
      { day: 'Ср', time: '19:30', venue: 'Стадион «Динамо»' },
      { day: 'Пт', time: '19:30', venue: 'Стадион «Динамо»' },
    ],
    color: '#143494',
  },
  {
    id: 'u12-academy',
    name: 'Динамчики U-12 Academy',
    ageGroup: '11-14',
    ageLabel: '11–14 лет',
    coach: { id: 'dmitry', name: 'Дмитрий Соколов', role: 'Тренер вратарей' },
    description: 'Академический состав U-12 с углублённой подготовкой. Тренировки 4 раза в неделю.',
    playersCount: 16,
    schedule: [
      { day: 'Пн', time: '17:30', venue: 'Манеж «Динамо»' },
      { day: 'Вт', time: '17:30', venue: 'Манеж «Динамо»' },
      { day: 'Чт', time: '17:30', venue: 'Манеж «Динамо»' },
      { day: 'Сб', time: '14:00', venue: 'Стадион «Динамо»' },
    ],
    color: '#0d2b6e',
  },
]
