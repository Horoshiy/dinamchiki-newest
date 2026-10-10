// =============================================================================
// Mock-данные игроков: ВЫМЫШЛЕННЫЕ дети — только для тестов и режима
// USE_MOCKS_ONLY. На проде как запасные данные не используются (см.
// shared/api/composables.ts): при сбое API показывается ошибка, а не они.
// Команды и тренеры — настоящие id из teams.mocks / coaches.mocks.
//
// Аватары — градиент + инициалы (без внешнего пакета).
// Галерея — 6 плейсхолдеров на каждый профиль (разные соотношения сторон).
// =============================================================================
import type { Player } from './player.types'

const galleryFor = (seed: string): ReadonlyArray<{ id: string; url: string; caption?: string; aspect: 'square' | 'portrait' | 'landscape' }> => [
  { id: `${seed}-g1`, url: `placeholder://player/${seed}/1`, caption: 'Тренировка',  aspect: 'landscape' },
  { id: `${seed}-g2`, url: `placeholder://player/${seed}/2`, caption: 'Матч',        aspect: 'portrait' },
  { id: `${seed}-g3`, url: `placeholder://player/${seed}/3`, caption: 'Разминка',    aspect: 'square' },
  { id: `${seed}-g4`, url: `placeholder://player/${seed}/4`, caption: 'Праздник',    aspect: 'square' },
  { id: `${seed}-g5`, url: `placeholder://player/${seed}/5`, caption: 'Турнир',      aspect: 'landscape' },
  { id: `${seed}-g6`, url: `placeholder://player/${seed}/6`, caption: 'С командой',  aspect: 'portrait' },
]

export const playersMock: ReadonlyArray<Player> = [
  // 1. Вратарь
  {
    id: 'arseniy-zaytsev',
    fullName: 'Арсений Зайцев',
    age: 12,
    jerseyNumber: 1,
    position: 'GK',
    bio: 'Вратарь с пугающе спокойным характером. Лучший по проценту отбитых пенальти в клубе (4 из 5 за сезон).',
    avatarGradient: 'linear-gradient(135deg, #5180f4 0%, #143494 100%)',
    team: { id: 'g6', name: 'Юг 2014-2015', ageLabel: '11–12 лет', color: '#1e50d8' },
    coach: { id: 'dmitry-tretyakov', fullName: 'Третьяков Дмитрий Михайлович', role: 'Старший тренер-преподаватель, спортивный директор' },
    stats: { matchesPlayed: 18, goals: 0, assists: 1, minutesPlayed: 1620, yellowCards: 1, redCards: 0 },
    gallery: galleryFor('arseniy'),
    achievements: [
      { id: 'a1', title: 'Лучший вратарь турнира', description: 'Осенний кубок Ставрополя 2025', year: 2025, iconKey: 'trophy' },
      { id: 'a2', title: '4 отбитых пенальти',       description: 'из 5 в серии пенальти за сезон', year: 2026, iconKey: 'award' },
      { id: 'a3', title: 'Капитан команды',           description: 'с сезона 2025/2026', year: 2025, iconKey: 'star' },
    ],
  },
  // 2. Защитник U-12 Blue
  {
    id: 'kirill-volkov',
    fullName: 'Кирилл Волков',
    age: 12,
    jerseyNumber: 4,
    position: 'DEF',
    bio: 'Центральный защитник. Не пропускает мимо себя никого — лучший в клубе по перехватам.',
    avatarGradient: 'linear-gradient(135deg, #1e50d8 0%, #143494 100%)',
    team: { id: 'g5', name: 'Юг 2014-2015 (2 подгруппа)', ageLabel: '11–12 лет', color: '#1e50d8' },
    coach: { id: 'andrey-kopylov', fullName: 'Копылов Андрей Николаевич', role: 'Тренер-преподаватель' },
    stats: { matchesPlayed: 22, goals: 3, assists: 2, minutesPlayed: 1980, yellowCards: 2, redCards: 0 },
    gallery: galleryFor('kirill'),
    achievements: [
      { id: 'a1', title: 'Лучший защитник сезона', description: 'Весенний кубок 2026', year: 2026, iconKey: 'trophy' },
      { id: 'a2', title: '50+ перехватов',          description: 'за календарный год',  year: 2025, iconKey: 'badge' },
    ],
  },
  // 3. Полузащитник U-10 Blue
  {
    id: 'misha-orlov',
    fullName: 'Миша Орлов',
    age: 10,
    jerseyNumber: 8,
    position: 'MID',
    bio: 'Плеймейкер команды U-10. Видит поле на два хода вперёд, отдаёт передачи с закрытыми глазами.',
    avatarGradient: 'linear-gradient(135deg, #5180f4 0%, #1e50d8 100%)',
    team: { id: 'g10', name: 'Центр 2017-2016', ageLabel: '9–10 лет', color: '#1e50d8' },
    coach: { id: 'andrey-kopylov', fullName: 'Копылов Андрей Николаевич', role: 'Тренер-преподаватель' },
    stats: { matchesPlayed: 20, goals: 12, assists: 14, minutesPlayed: 1780, yellowCards: 1, redCards: 0 },
    gallery: galleryFor('misha'),
    achievements: [
      { id: 'a1', title: 'Лучший игрок турнира', description: 'Осенний кубок Ставрополя 2026', year: 2026, iconKey: 'trophy' },
      { id: 'a2', title: 'MVP сезона 2025',        description: 'по версии родителей команды',  year: 2025, iconKey: 'star' },
      { id: 'a3', title: 'Капитан команды',        description: 'с 9 лет',                      year: 2025, iconKey: 'heart' },
    ],
  },
  // 4. Нападающий U-12 Blue
  {
    id: 'dima-sokolov',
    fullName: 'Дима Соколов',
    age: 13,
    jerseyNumber: 9,
    position: 'FWD',
    bio: 'Лучший бомбардир клуба за последние два сезона. Забивает и правой, и левой, и головой.',
    avatarGradient: 'linear-gradient(135deg, #dc2626 0%, #1e50d8 100%)',
    team: { id: 'g5', name: 'Юг 2014-2015 (2 подгруппа)', ageLabel: '11–12 лет', color: '#1e50d8' },
    coach: { id: 'andrey-kopylov', fullName: 'Копылов Андрей Николаевич', role: 'Тренер-преподаватель' },
    stats: { matchesPlayed: 24, goals: 28, assists: 9, minutesPlayed: 2050, yellowCards: 3, redCards: 0 },
    gallery: galleryFor('dima'),
    achievements: [
      { id: 'a1', title: 'Лучший бомбардир клуба',  description: 'сезоны 2025 и 2026', year: 2026, iconKey: 'trophy' },
      { id: 'a2', title: '28 голов за сезон',       description: 'рекорд клуба',        year: 2026, iconKey: 'award' },
      { id: 'a3', title: 'Приглашение в сборную СК', description: 'региональная команда', year: 2026, iconKey: 'badge' },
    ],
  },
  // 5. Защитник U-10 Blue (молодой)
  {
    id: 'petya-ivanov',
    fullName: 'Петя Иванов',
    age: 9,
    jerseyNumber: 3,
    position: 'DEF',
    bio: 'Самый юный игрок основного состава U-10. Бегает быстрее всех и никогда не сдаётся.',
    avatarGradient: 'linear-gradient(135deg, #143494 0%, #5180f4 100%)',
    team: { id: 'g10', name: 'Центр 2017-2016', ageLabel: '9–10 лет', color: '#1e50d8' },
    coach: { id: 'andrey-kopylov', fullName: 'Копылов Андрей Николаевич', role: 'Тренер-преподаватель' },
    stats: { matchesPlayed: 16, goals: 2, assists: 5, minutesPlayed: 1280, yellowCards: 2, redCards: 0 },
    gallery: galleryFor('petya'),
    achievements: [
      { id: 'a1', title: 'Самый юный дебютант', description: 'дебют в 8 лет', year: 2025, iconKey: 'star' },
      { id: 'a2', title: 'Приз зрительских симпатий', description: 'Осенний кубок 2026', year: 2026, iconKey: 'heart' },
    ],
  },
  // 6. U-8 (младшая группа, чтобы можно было ссылаться с главной)
  {
    id: 'gosha-smirnov',
    fullName: 'Гоша Смирнов',
    age: 7,
    jerseyNumber: 11,
    position: 'FWD',
    bio: 'Нападающий младшей группы. Забил больше всех голов за свою короткую карьеру в клубе — 23 мяча.',
    avatarGradient: 'linear-gradient(135deg, #ca8a04 0%, #1e50d8 100%)',
    team: { id: 'g54', name: 'Центр 2018-2019', ageLabel: '7–8 лет', color: '#1e50d8' },
    coach: { id: 'roman-manuylo', fullName: 'Мануйло Роман Евгеньевич', role: 'Тренер-преподаватель' },
    stats: { matchesPlayed: 14, goals: 23, assists: 7, minutesPlayed: 980, yellowCards: 0, redCards: 0 },
    gallery: galleryFor('gosha'),
    achievements: [
      { id: 'a1', title: 'Лучший бомбардир U-8', description: 'сезон 2025/2026', year: 2026, iconKey: 'trophy' },
      { id: 'a2', title: 'Первое место в конкурсе', description: '"Лучший гол сезона"', year: 2026, iconKey: 'award' },
    ],
  },
]
