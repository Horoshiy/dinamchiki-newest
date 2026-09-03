// =============================================================================
// Резервные данные тренеров: используются, только если GraphQL недоступен.
//
// Состав реальный — совпадает с подразделом «Педагогический состав»
// (/sveden/employees) и с data/seed.json в dinamchiki-gql. Расходиться
// эти три источника не должны: иначе при падении бэкенда сайт покажет
// других людей, чем указано в обязательных сведениях.
// =============================================================================
import type { Coach } from './coach.types'
import type { GalleryPhoto, PhotoAspect } from '@/entities/gallery/gallery.types'

/** Палитра плейсхолдеров — та же логика, что в галерее клуба. */
const COACH_PALETTE = ['#1e50d8', '#5180f4', '#143494', '#0d2b6e', '#2563eb', '#0d9488']
const COACH_ASPECTS: ReadonlyArray<PhotoAspect> = ['landscape', 'portrait', 'square', 'square', 'landscape', 'portrait']
const COACH_CAPTIONS = ['На тренировке', 'Разбор игры', 'С командой', 'Награждение', 'Турнир', 'Мастер-класс']

/** Краткая галерея тренера (6 кадров). Реальные url придут с бэкенда. */
function galleryFor(seed: string): ReadonlyArray<GalleryPhoto> {
  return COACH_CAPTIONS.map((caption, i) => ({
    id: `${seed}-cg${i + 1}`,
    albumId: `coach-${seed}`,
    url: `placeholder://coach/${seed}/${i + 1}`,
    caption,
    aspect: COACH_ASPECTS[i % COACH_ASPECTS.length],
    placeholderColor: COACH_PALETTE[(i + seed.length) % COACH_PALETTE.length],
  }))
}

export const coachesMock: ReadonlyArray<Coach> = [
  {
    id: 'roman-manuylo',
    fullName: 'Мануйло Роман Евгеньевич',
    role: 'Тренер-преподаватель',
    description:
      'Ведёт программы «Футбол для детей 3–5 лет» и «Футбол для детей 6–7 лет». ' +
      'Высшее образование, 9 лет работы по специальности.',
    experienceYears: 9,
    specialization: [],
    ageGroups: ['3-5', '6-7'],
    achievements: [
      { title: 'Высшее образование', description: 'профильная подготовка, подтверждённая документами об образовании', iconKey: 'badge' },
      { title: '9 лет работы', description: 'в сфере, соответствующей преподаваемым программам', iconKey: 'star' },
    ],
    teams: [],
    avatarGradient: 'linear-gradient(135deg, #1e50d8 0%, #5180f4 100%)',
    gallery: galleryFor('roman-manuylo'),
  },
  {
    id: 'sergey-ushakov',
    fullName: 'Ушаков Сергей Викторович',
    role: 'Тренер-преподаватель',
    description:
      'Ведёт программы «Футбол для детей 6–7 лет» и «Футбол для детей 8–10 лет». ' +
      'Среднее профессиональное образование, 18 лет работы по специальности.',
    experienceYears: 18,
    specialization: [],
    ageGroups: ['6-7', '8-10'],
    achievements: [
      { title: 'Среднее профессиональное образование', description: 'профильная подготовка, подтверждённая документами об образовании', iconKey: 'badge' },
      { title: '18 лет работы', description: 'в сфере, соответствующей преподаваемым программам', iconKey: 'star' },
    ],
    teams: [],
    avatarGradient: 'linear-gradient(135deg, #143494 0%, #1e50d8 100%)',
    gallery: galleryFor('sergey-ushakov'),
  },
  {
    id: 'dmitry-tretyakov',
    fullName: 'Третьяков Дмитрий Михайлович',
    role: 'Старший тренер-преподаватель, спортивный директор',
    description:
      'Ведёт программы «Футбол для детей 8–10 лет» и «Футбол для детей 11–14 лет». ' +
      'Выпускник КубГУФКСиТ, 22 года работы по специальности.',
    experienceYears: 22,
    specialization: [],
    ageGroups: ['8-10', '11-14'],
    achievements: [
      { title: 'Высшее профильное образование', description: 'КубГУФКСиТ, специальность «Физическая культура и спорт», квалификация «Тренер-преподаватель по футболу»', iconKey: 'badge' },
      { title: '22 года работы', description: 'в сфере, соответствующей преподаваемым программам', iconKey: 'star' },
      { title: 'Спортивный директор клуба', description: 'заместитель руководителя организации', iconKey: 'trophy' },
    ],
    teams: [],
    avatarGradient: 'linear-gradient(135deg, #5180f4 0%, #143494 100%)',
    gallery: galleryFor('dmitry-tretyakov'),
  },
  {
    id: 'andrey-kopylov',
    fullName: 'Копылов Андрей Николаевич',
    role: 'Тренер-преподаватель',
    description:
      'Ведёт программы «Футбол для детей 8–10 лет» и «Футбол для детей 11–14 лет». ' +
      'Среднее профессиональное образование, 15 лет работы по специальности.',
    experienceYears: 15,
    specialization: [],
    ageGroups: ['8-10', '11-14'],
    achievements: [
      { title: 'Среднее профессиональное образование', description: 'профильная подготовка, подтверждённая документами об образовании', iconKey: 'badge' },
      { title: '15 лет работы', description: 'в сфере, соответствующей преподаваемым программам', iconKey: 'star' },
    ],
    teams: [],
    avatarGradient: 'linear-gradient(135deg, #1a45bf 0%, #8aacff 100%)',
    gallery: galleryFor('andrey-kopylov'),
  },
]
