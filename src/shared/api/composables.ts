// =============================================================================
// GraphQL composables — единый слой для всех страниц.
//
// Стратегия:
//   - Пытаемся сделать запрос через Apollo Client
//   - Если USE_MOCKS_ONLY = true → сразу возвращаем мок
//   - Иначе если запрос упал (network/timeout/GraphQL errors) → fallback на мок
//   - Возвращаем ref-объект { data, loading, error }, идентичный useQuery
//
// Использование:
//   const { data: teams, loading, error } = useTeamsQuery()
//   // вместо:
//   const teams = ref<Team[] | null>(null)
//   watchEffect(async () => { teams.value = await fetchTeams() })
// =============================================================================

import { computed, ref, watch, type Ref } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import type { DocumentNode } from 'graphql'
import { teamsMock } from '@/entities/team/teams.mocks'
import { coachesMock } from '@/entities/coach/coaches.mocks'
import {
  tournamentsMock,
  getCurrentTournament,
  getUpcomingTournaments,
  getFinishedTournaments,
} from '@/entities/tournament/tournaments.mocks'
import { playersMock } from '@/entities/player/players.mocks'
import { galleryMock, photosOfAlbum } from '@/entities/gallery/gallery.mocks'
import { contactInfoMock, venuesMock } from '@/entities/contact/contacts.mocks'
import { homeContentMock, reviewsMock } from '@/entities/content/content.mocks'
import { USE_MOCKS_ONLY } from './config'
import {
  TEAMS_QUERY,
  TEAM_QUERY,
  COACHES_QUERY,
  COACH_QUERY,
  TOURNAMENTS_QUERY,
  TOURNAMENT_QUERY,
  CURRENT_TOURNAMENT_QUERY,
  UPCOMING_TOURNAMENTS_QUERY,
  FINISHED_TOURNAMENTS_QUERY,
  PLAYERS_QUERY,
  PLAYER_QUERY,
  ALBUMS_QUERY,
  ALBUM_QUERY,
  ALBUM_PHOTOS_QUERY,
  ALL_PHOTOS_QUERY,
  CONTACT_INFO_QUERY,
  VENUES_QUERY,
  HOME_CONTENT_QUERY,
  PAGE_LAYOUT_QUERY,
  REVIEWS_QUERY,
} from './graphql/queries'

/**
 * Вид секции, которую бэкенд отдаёт в `pageLayout.sections[].collection`.
 * Используется фронтом, чтобы выбрать, какой виджет рендерить.
 */
export type PageSectionCollection =
  // Поля из pageContent(slug:"home") — есть в homeContentMock
  | 'hero'
  | 'stats'
  | 'features'
  | 'programs'
  | 'trainingSteps'
  // Независимые коллекции (требуют отдельных запросов)
  | 'coaches'
  | 'tournaments'
  | 'albums'
  | 'photos'
  | 'reviews'
  | 'contactInfo'

export interface PageSection {
  order: number
  /** HERO | LIST | GALLERY | CONTACT | TEXT | MEDIA | LINK */
  kind: string
  label: string
  collection: PageSectionCollection | string
  visible: boolean
}

export interface PageLayout {
  route: string
  title: string
  sections: PageSection[]
}

/** Стандартная обёртка: GraphQL запрос + мок-fallback. */
function useGraphQLWithFallback<TResult>(opts: {
  query: DocumentNode
  variables?: () => Record<string, unknown>
  mockFn: () => TResult | Promise<TResult>
}) {
  const data    = ref<TResult | null>(null) as Ref<TResult | null>
  const loading = ref(true)
  const error   = ref<Error | null>(null)

  /**
   * Гонка ответов: если переменные сменились, пока предыдущий mockFn ещё
   * резолвился, устаревший результат не должен затирать свежий.
   */
  let requestId = 0

  function runMock() {
    const id = ++requestId
    loading.value = true
    Promise.resolve(opts.mockFn())
      .then((res) => {
        if (id !== requestId) return
        data.value = res
        error.value = null
        loading.value = false
      })
      .catch((e) => {
        if (id !== requestId) return
        error.value = e as Error
        loading.value = false
      })
  }

  if (USE_MOCKS_ONLY) {
    runMock()
    // Переменные реактивны (id команды, id турнира): при их смене мок надо
    // пересчитать — иначе переключение вкладок/маршрутов не обновляет данные.
    if (opts.variables) {
      watch(() => opts.variables!(), runMock, { deep: true })
    }
  } else {
    // Пытаемся GraphQL, при ошибке — мок
    const { onResult, onError, loading: gqlLoading } = useQuery<TResult>(
      opts.query,
      () => opts.variables?.() ?? {},
      { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
    )

    onResult((result) => {
      if (result.data) {
        data.value = result.data as TResult
        loading.value = false
      }
    })

    onError((err) => {
      // Мок-fallback при ошибке. Флаг на window — чтобы e2e отличал
      // «данные с бэкенда» от «бэкенд лёг, показываем запасные моки»:
      // визуально это неразличимо, а разница принципиальная.
      console.warn('[GraphQL → mock fallback]', err.message)
      ;(window as unknown as { __gqlFellBack?: boolean }).__gqlFellBack = true
      runMock()
    })

    watch(gqlLoading, (v) => { loading.value = v })
  }

  return { data, loading, error }
}

// =============================================================================
// Конкретные composables для каждого домена
// =============================================================================

export function useTeamsQuery() {
  return useGraphQLWithFallback({
    query: TEAMS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return { teams: teamsMock }
    },
  })
}

export function useTeamQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: TEAM_QUERY,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { team: teamsMock.find((t) => t.id === id.value) ?? null }
    },
  })
}

export function useCoachesQuery() {
  return useGraphQLWithFallback({
    query: COACHES_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return { coaches: coachesMock }
    },
  })
}

export function useCoachQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: COACH_QUERY,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { coach: coachesMock.find((c) => c.id === id.value) ?? null }
    },
  })
}

export function useTournamentsQuery() {
  return useGraphQLWithFallback({
    query: TOURNAMENTS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return { tournaments: tournamentsMock }
    },
  })
}

export function useTournamentQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: TOURNAMENT_QUERY,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { tournament: tournamentsMock.find((t) => t.id === id.value) ?? null }
    },
  })
}

export function useCurrentTournamentQuery() {
  return useGraphQLWithFallback({
    query: CURRENT_TOURNAMENT_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { currentTournament: getCurrentTournament() ?? null }
    },
  })
}

export function useUpcomingTournamentsQuery() {
  return useGraphQLWithFallback({
    query: UPCOMING_TOURNAMENTS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { upcomingTournaments: getUpcomingTournaments() }
    },
  })
}

export function useFinishedTournamentsQuery() {
  return useGraphQLWithFallback({
    query: FINISHED_TOURNAMENTS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { finishedTournaments: getFinishedTournaments() }
    },
  })
}

export function usePlayersQuery(teamId?: Ref<string | null>) {
  return useGraphQLWithFallback({
    query: PLAYERS_QUERY,
    variables: () => (teamId ? { teamId: teamId.value } : {}),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      const id = teamId?.value
      return { players: id ? playersMock.filter((p) => p.team.id === id) : playersMock }
    },
  })
}

export function usePlayerQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: PLAYER_QUERY,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { player: playersMock.find((p) => p.id === id.value) ?? null }
    },
  })
}

export function useAlbumsQuery() {
  return useGraphQLWithFallback({
    query: ALBUMS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return { albums: galleryMock }
    },
  })
}

export function useAlbumQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: ALBUM_QUERY,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { album: galleryMock.find((a) => a.id === id.value) ?? null }
    },
  })
}

export function useAlbumPhotosQuery(albumId: Ref<string>) {
  return useGraphQLWithFallback({
    query: ALBUM_PHOTOS_QUERY,
    variables: () => ({ albumId: albumId.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { albumPhotos: photosOfAlbum(albumId.value) }
    },
  })
}

export function useAllPhotosQuery() {
  return useGraphQLWithFallback({
    query: ALL_PHOTOS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 50))
      return { allPhotos: galleryMock.flatMap((a) => a.photos) }
    },
  })
}

export function useContactInfoQuery() {
  return useGraphQLWithFallback({
    query: CONTACT_INFO_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 50))
      return { contactInfo: contactInfoMock }
    },
  })
}

export function useVenuesQuery() {
  return useGraphQLWithFallback({
    query: VENUES_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 50))
      return { venues: venuesMock }
    },
  })
}

export function useHomeContentQuery() {
  return useGraphQLWithFallback({
    query: HOME_CONTENT_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { pageContent: homeContentMock }
    },
  })
}

/**
 * Сквозной контракт: порядок секций на странице.
 *
 * Бэкенд возвращает секции в `sections[]` уже отсортированными по `order`.
 * Если бэкенд упал / не настроен layout — `data.value` будет `null`, и
 * страница должна использовать дефолтный fallback.
 */
export function usePageLayoutQuery(route: Ref<string> | string) {
  const routeRef = typeof route === 'string' ? ref(route) : route
  return useGraphQLWithFallback<{ pageLayout: PageLayout | null }>({
    query: PAGE_LAYOUT_QUERY,
    variables: () => ({ route: routeRef.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { pageLayout: null }
    },
  })
}

export function useReviewsQuery() {
  return useGraphQLWithFallback({
    query: REVIEWS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { reviews: reviewsMock }
    },
  })
}

/**
 * Мутация submitApplication.
 *
 * Важно: пока бэкенда нет (USE_MOCKS_ONLY), заявка НИКУДА не уходит.
 * Раньше здесь возвращался `{ ok: true, leadId: 'lead-...' }` — форма
 * показывала «Заявка отправлена» и выдуманный номер, то есть врала
 * посетителю. Теперь возвращается notDelivered, а UI обязан показать
 * прямые контакты вместо благодарности.
 */
import { useMutation } from '@vue/apollo-composable'
import { SUBMIT_APPLICATION_MUTATION } from './graphql/queries'
import { validateLeadForm } from '@/entities/contact/lead.validation'
import type { LeadSubmitResult } from '@/entities/contact/contact.types'

export function useSubmitApplicationMutation() {
  const submitting = ref(false)
  const result = ref<LeadSubmitResult | null>(null)

  // useMutation обязан вызываться синхронно в setup-контексте — раньше он
  // вызывался внутри async submit() после await, вне жизненного цикла.
  const { mutate } = useMutation(SUBMIT_APPLICATION_MUTATION)

  async function submit(draft: Parameters<typeof validateLeadForm>[0]): Promise<LeadSubmitResult> {
    submitting.value = true
    result.value = null
    try {
      const errs = validateLeadForm(draft)
      if (Object.keys(errs).length > 0) {
        result.value = { ok: false, error: Object.values(errs)[0] }
        return result.value
      }

      if (USE_MOCKS_ONLY) {
        // Бэкенда нет — честно сообщаем, что заявка не доставлена.
        result.value = {
          ok: false,
          notDelivered: true,
          error: 'Форма пока не подключена к серверу заявок.',
        }
        return result.value
      }

      const r = await mutate({ input: draft })
      result.value = r?.data?.submitApplication ?? { ok: false, error: 'Пустой ответ сервера' }
    } catch (e) {
      result.value = { ok: false, error: (e as Error).message }
    } finally {
      submitting.value = false
    }
    return result.value as LeadSubmitResult
  }

  return { submitting, result, submit }
}
