import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { appConfig } from '@/app/config/app.config'
import DefaultLayout from '@/shared/ui/layout/DefaultLayout.vue'
import BareLayout from '@/shared/ui/layout/BareLayout.vue'
import { SVEDEN_LEGACY_REDIRECTS } from '@/entities/sveden/sveden.sections'

// Lazy-loaded страницы.
const HomePage        = () => import('@/pages/HomePage.vue')
const TeamsPage       = () => import('@/pages/TeamsPage.vue')
const TeamDetailPage  = () => import('@/pages/TeamDetailPage.vue')
const CoachesPage     = () => import('@/pages/CoachesPage.vue')
const CoachDetailPage = () => import('@/pages/CoachDetailPage.vue')
const TournamentsPage       = () => import('@/pages/TournamentsPage.vue')
const TournamentDetailPage  = () => import('@/pages/TournamentDetailPage.vue')
const PlayerPage      = () => import('@/pages/PlayerPage.vue')
const GalleryPage     = () => import('@/pages/GalleryPage.vue')
const ContactsPage    = () => import('@/pages/ContactsPage.vue')
const NotFoundPage    = () => import('@/pages/NotFoundPage.vue')

// Раздел «Сведения об образовательной организации» — обязательный по ст. 29
// Федерального закона № 273-ФЗ. Грузится отдельными чанками, как и остальное.
const SvedenIndexPage = () => import('@/pages/sveden/SvedenIndexPage.vue')
const SvedenCommon    = () => import('@/pages/sveden/CommonPage.vue')
const SvedenStruct    = () => import('@/pages/sveden/StructPage.vue')
const SvedenDocument  = () => import('@/pages/sveden/DocumentPage.vue')
const SvedenEducation = () => import('@/pages/sveden/EducationPage.vue')
const SvedenManagers  = () => import('@/pages/sveden/ManagersPage.vue')
const SvedenEmployees = () => import('@/pages/sveden/EmployeesPage.vue')
const SvedenObjects   = () => import('@/pages/sveden/ObjectsPage.vue')
const SvedenGrants    = () => import('@/pages/sveden/GrantsPage.vue')
const SvedenPaidEdu   = () => import('@/pages/sveden/PaidEduPage.vue')
const SvedenBudget    = () => import('@/pages/sveden/BudgetPage.vue')
const SvedenVacant    = () => import('@/pages/sveden/VacantPage.vue')
const SvedenInter     = () => import('@/pages/sveden/InterPage.vue')
const SvedenCatering  = () => import('@/pages/sveden/CateringPage.vue')

declare module 'vue-router' {
  interface RouteMeta {
    /** Заголовок страницы для <title>. */
    title?: string
    /** SEO-описание (для meta name="description" и og:description). */
    description?: string
    /** OG-картинка (по умолчанию — обложка клуба). */
    ogImage?: string
    /** Отключает индексацию (noindex, nofollow). */
    noIndex?: boolean
  }
}

const SITE_NAME = 'ДФК «Динамчики»'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomePage,
        meta: {
          title: 'Главная',
          description: 'Детский футбольный клуб «Динамчики» в Ставрополе — тренировки для детей 4–14 лет, опытные тренеры, регулярные турниры. Запишитесь на бесплатную пробную тренировку.',
          ogImage: '/og/dinamchiki-cover.png',
        },
      },
      {
        path: 'teams',
        name: 'teams',
        component: TeamsPage,
        meta: {
          title: 'Команды',
          description: 'Команды ДФК «Динамчики» по возрастным группам: U-6, U-8, U-10, U-12. Составы, расписание тренировок, тренеры.',
          ogImage: '/og/dinamchiki-teams.png',
        },
      },
      {
        path: 'team/:id',
        name: 'team',
        component: TeamDetailPage,
        meta: {
          title: 'Команда',
          description: 'Профиль команды: возрастная группа, расписание, тренер, статистика матчей.',
        },
        props: true,
      },
      {
        path: 'coaches',
        name: 'coaches',
        component: CoachesPage,
        meta: {
          title: 'Тренеры',
          description: 'Тренерский состав ДФК «Динамчики»: тренеры-преподаватели с профильным образованием и стажем от 9 до 22 лет.',
          ogImage: '/og/dinamchiki-coaches.png',
        },
      },
      {
        path: 'coach/:id',
        name: 'coach',
        component: CoachDetailPage,
        meta: {
          title: 'Тренер',
          description: 'Профиль тренера: специализация, возрастные группы, опыт, достижения.',
        },
        props: true,
      },
      {
        path: 'tournaments',
        name: 'tournaments',
        component: TournamentsPage,
        meta: {
          title: 'Турниры',
          description: 'Текущие и завершённые турниры ДФК «Динамчики»: турнирные таблицы, расписание матчей, результаты.',
          ogImage: '/og/dinamchiki-tournaments.png',
        },
      },
      {
        path: 'tournament/:id',
        name: 'tournament',
        component: TournamentDetailPage,
        meta: {
          title: 'Турнир',
          description: 'Турнирная таблица, расписание матчей и результаты турнира.',
        },
        props: true,
      },
      {
        path: 'player/:id',
        name: 'player',
        component: PlayerPage,
        meta: {
          title: 'Игрок',
          description: 'Профиль игрока ДФК «Динамчики»: статистика, достижения, фото, команда и тренер.',
        },
        props: true,
      },
      {
        path: 'gallery',
        name: 'gallery',
        component: GalleryPage,
        meta: {
          title: 'Галерея',
          description: 'Фотогалерея ДФК «Динамчики»: тренировки, матчи, турниры, клубные события.',
          ogImage: '/og/dinamchiki-gallery.png',
        },
      },
      {
        path: 'contacts',
        name: 'contacts',
        component: ContactsPage,
        meta: {
          title: 'Контакты',
          description: 'Контакты ДФК «Динамчики»: телефоны, мессенджеры, адреса площадок в Ставрополе и Кисловодске. Запись на пробную тренировку.',
          ogImage: '/og/dinamchiki-contacts.png',
        },
      },

      // ---- Сведения об образовательной организации ------------------------
      // Адреса подразделов заданы Методическими рекомендациями Рособрнадзора
      // (Таблица 3.1) — по ним раздел ищет автоматическая проверка, поэтому
      // менять их нельзя. Раздел работает без GraphQL: обязательные сведения
      // не должны зависеть от доступности бэкенда.
      {
        path: 'sveden',
        name: 'sveden',
        component: SvedenIndexPage,
        meta: {
          title: 'Сведения об образовательной организации',
          description: 'Официальные сведения об ООО ДФК «Динамчики»: реквизиты, лицензия, документы, образовательные программы, платные услуги.',
        },
      },
      {
        path: 'sveden/common',
        name: 'sveden-common',
        component: SvedenCommon,
        meta: {
          title: 'Основные сведения',
          description: 'Наименование, дата создания, учредители, адрес, режим работы и лицензия ООО ДФК «Динамчики».',
        },
      },
      {
        path: 'sveden/struct',
        name: 'sveden-struct',
        component: SvedenStruct,
        meta: {
          title: 'Структура и органы управления образовательной организацией',
          description: 'Органы управления, структурные подразделения и филиалы ООО ДФК «Динамчики».',
        },
      },
      {
        path: 'sveden/document',
        name: 'sveden-document',
        component: SvedenDocument,
        meta: {
          title: 'Документы',
          description: 'Устав, правила внутреннего распорядка, локальные акты и отчёт о самообследовании.',
        },
      },
      {
        path: 'sveden/education',
        name: 'sveden-education',
        component: SvedenEducation,
        meta: {
          title: 'Образование',
          description: 'Реализуемые образовательные программы, численность обучающихся, язык образования.',
        },
      },
      {
        path: 'sveden/managers',
        name: 'sveden-managers',
        component: SvedenManagers,
        meta: {
          title: 'Руководство',
          description: 'Руководитель ООО ДФК «Динамчики» и его заместители: должности и контакты.',
        },
      },
      {
        path: 'sveden/employees',
        name: 'sveden-employees',
        component: SvedenEmployees,
        meta: {
          title: 'Педагогический состав',
          description: 'Персональный состав тренеров-преподавателей: образование, квалификация, стаж.',
        },
      },
      {
        path: 'sveden/objects',
        name: 'sveden-objects',
        component: SvedenObjects,
        meta: {
          title: 'Материально-техническое обеспечение и оснащённость образовательного процесса. Доступная среда',
          description: 'Спортивные объекты, инвентарь, средства обучения, доступная среда.',
        },
      },
      {
        path: 'sveden/grants',
        name: 'sveden-grants',
        component: SvedenGrants,
        meta: {
          title: 'Стипендии и меры поддержки обучающихся',
          description: 'Меры поддержки обучающихся, скидки, сведения об общежитии и интернате.',
        },
      },
      {
        path: 'sveden/paid_edu',
        name: 'sveden-paid-edu',
        component: SvedenPaidEdu,
        meta: {
          title: 'Платные образовательные услуги',
          description: 'Стоимость обучения по программам, порядок оказания платных услуг, образец договора.',
        },
      },
      {
        path: 'sveden/budget',
        name: 'sveden-budget',
        component: SvedenBudget,
        meta: {
          title: 'Финансово-хозяйственная деятельность',
          description: 'Объём образовательной деятельности, поступление и расходование средств, план ФХД.',
        },
      },
      {
        path: 'sveden/vacant',
        name: 'sveden-vacant',
        component: SvedenVacant,
        meta: {
          title: 'Вакантные места для приёма (перевода) обучающихся',
          description: 'Свободные места по каждой образовательной программе и порядок зачисления.',
        },
      },
      {
        path: 'sveden/inter',
        name: 'sveden-inter',
        component: SvedenInter,
        meta: {
          title: 'Международное сотрудничество',
          description: 'Договоры с иностранными и международными организациями, иностранные обучающиеся.',
        },
      },
      {
        path: 'sveden/catering',
        name: 'sveden-catering',
        component: SvedenCatering,
        meta: {
          title: 'Организация питания в образовательной организации',
          description: 'Условия питания и охраны здоровья обучающихся ООО ДФК «Динамчики».',
        },
      },

      // Адреса подразделов на действующем сайте отличались от рекомендованных.
      // Редиректы держим, чтобы внешние ссылки и закладки не отдавали 404.
      ...SVEDEN_LEGACY_REDIRECTS.map((r) => ({
        path: r.from.replace(/^\//, ''),
        redirect: r.to,
      })),
    ],
  },
  // 404 — bare layout (без header/footer)
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: BareLayout,
    children: [
      {
        path: '',
        name: 'not-found-page',
        component: NotFoundPage,
        meta: {
          title: '404 — Страница не найдена',
          description: 'Запрашиваемая страница не найдена.',
          noIndex: true,
        },
      },
    ],
  },
]

/** Высота липкой шапки — на неё смещаем скролл к якорю. */
const HEADER_OFFSET = 96

/**
 * Ждём появления элемента якоря в DOM.
 *
 * Страницы грузятся лениво и рендерят контент после ответа слоя данных,
 * поэтому на момент навигации `#lead` ещё не существует и обычный
 * `{ el: to.hash }` молча ничего не делает.
 */
function waitForElement(selector: string, timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const started = performance.now()
    const tick = () => {
      if (document.querySelector(selector)) return resolve(true)
      if (performance.now() - started > timeoutMs) return resolve(false)
      requestAnimationFrame(tick)
    }
    tick()
  })
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  async scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) {
      const found = await waitForElement(to.hash)
      if (found) return { el: to.hash, behavior: 'smooth', top: HEADER_OFFSET }
      return { top: 0 }
    }
    return { top: 0 }
  },
})

/**
 * Обновление <title>, <meta name="description">, og:* и каноникала при смене маршрута.
 */
router.afterEach((to) => {
  const meta = to.meta ?? {}
  const title = typeof meta.title === 'string' ? `${meta.title} — ${SITE_NAME}` : SITE_NAME

  document.title = title

  setMeta('description', meta.description ?? 'Детский футбольный клуб «Динамчики» в Ставрополе — тренировки для детей 4–14 лет.')

  // OG
  setOg('og:title', title)
  setOg('og:description', meta.description ?? 'Детский футбольный клуб «Динамчики» в Ставрополе.')
  setOg('og:image', meta.ogImage ?? '/og/dinamchiki-cover.png')
  // База — канонический домен из env, а не origin текущей вкладки:
  // иначе стенд объявлял каноничными собственные адреса.
  setOg('og:url', `${appConfig.siteUrl}${to.fullPath}`)

  // Twitter
  setMeta('twitter:title', title)
  setMeta('twitter:description', meta.description ?? 'Детский футбольный клуб «Динамчики» в Ставрополе.')
  setMeta('twitter:image', meta.ogImage ?? '/og/dinamchiki-cover.png')

  // Canonical
  setLink('canonical', `${appConfig.siteUrl}${to.fullPath}`)

  // Robots. Неиндексируемая сборка (стенд) закрывается целиком.
  const noIndex = meta.noIndex || !appConfig.allowIndexing
  setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow')
})

function setMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOg(property: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}
