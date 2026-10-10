// =============================================================================
// GraphQL composables — единый слой для всех страниц.
//
// Стратегия:
//   - Пытаемся сделать запрос через Apollo Client
//   - Если USE_MOCKS_ONLY = true → сразу возвращаем мок
//   - Если запрос упал и данных нет совсем:
//       · справочные данные (контакты, площадки, тексты главной, тренеры) —
//         резервная копия, она совпадает с реальной;
//       · всё остальное (группы, турниры, дети, галерея) — честная ошибка.
//     Раньше мок подставлялся всегда, и при сбое API родители видели
//     выдуманный турнир «Идёт сейчас» и несуществующих детей — те самые
//     записи, которые клуб скрыл в админке.
//   - Частичный ответ (data + errors[]) реальные данные НЕ затирает.
//   - Моки грузятся динамическим import(): в прод-бандл посетителя они
//     попадают отдельным чанком и скачиваются только при сбое.
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
  /**
   * Подставлять мок, если бэкенд недоступен. Только для данных, у которых
   * резервная копия совпадает с реальной (контакты, площадки, тексты, тренеры).
   */
  fallbackToMock?: boolean
  /** Не делать запрос, пока false (например, id ещё не известен). */
  enabled?: () => boolean
}) {
  const data    = ref<TResult | null>(null) as Ref<TResult | null>
  const loading = ref(true)
  const error   = ref<Error | null>(null)

  /**
   * Гонка ответов: если переменные сменились, пока предыдущий mockFn ещё
   * резолвился, устаревший результат не должен затирать свежий — ни мок,
   * ни ответ сервера.
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
    const { onResult, onError, loading: gqlLoading } = useQuery<TResult>(
      opts.query,
      () => opts.variables?.() ?? {},
      () => ({
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
        enabled: opts.enabled?.() ?? true,
      }),
    )

    // Выключенный запрос не ответит никогда — не держим скелетон вечно.
    if (opts.enabled) {
      watch(opts.enabled, (on) => { if (!on) loading.value = false }, { immediate: true })
    }

    onResult((result) => {
      if (result.data) {
        ++requestId
        data.value = result.data as TResult
        error.value = null
        loading.value = false
      }
    })

    onError((err) => {
      if (import.meta.env.DEV) console.warn('[GraphQL]', err.message)
      // Частичный ответ: onResult уже отдал реальные данные — их и оставляем.
      if (data.value != null) return
      if (opts.fallbackToMock) {
        // Флаг на window — чтобы e2e отличал «данные с бэкенда» от
        // «бэкенд лёг, показываем резервную копию».
        ;(window as unknown as { __gqlFellBack?: boolean }).__gqlFellBack = true
        runMock()
        return
      }
      error.value = err
      loading.value = false
    })

    // Снимает loading onResult/onError; здесь — только включение при refetch
    // (сменились переменные), иначе мок-fallback и ошибка гонялись бы с ним.
    watch(gqlLoading, (v) => { if (v) loading.value = true })
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
      return { teams: (await import('@/entities/team/teams.mocks')).teamsMock }
    },
  })
}

export function useTeamQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: TEAM_QUERY,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { team: (await import('@/entities/team/teams.mocks')).teamsMock.find((t) => t.id === id.value) ?? null }
    },
  })
}

export function useCoachesQuery() {
  return useGraphQLWithFallback({
    query: COACHES_QUERY,
    fallbackToMock: true,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return { coaches: (await import('@/entities/coach/coaches.mocks')).coachesMock }
    },
  })
}

export function useCoachQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: COACH_QUERY,
    fallbackToMock: true,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { coach: (await import('@/entities/coach/coaches.mocks')).coachesMock.find((c) => c.id === id.value) ?? null }
    },
  })
}

export function useTournamentsQuery() {
  return useGraphQLWithFallback({
    query: TOURNAMENTS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return { tournaments: (await import('@/entities/tournament/tournaments.mocks')).tournamentsMock }
    },
  })
}

export function useTournamentQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: TOURNAMENT_QUERY,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { tournament: (await import('@/entities/tournament/tournaments.mocks')).tournamentsMock.find((t) => t.id === id.value) ?? null }
    },
  })
}

export function useCurrentTournamentQuery() {
  return useGraphQLWithFallback({
    query: CURRENT_TOURNAMENT_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { currentTournament: (await import('@/entities/tournament/tournaments.mocks')).getCurrentTournament() ?? null }
    },
  })
}

export function useUpcomingTournamentsQuery() {
  return useGraphQLWithFallback({
    query: UPCOMING_TOURNAMENTS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { upcomingTournaments: (await import('@/entities/tournament/tournaments.mocks')).getUpcomingTournaments() }
    },
  })
}

export function useFinishedTournamentsQuery() {
  return useGraphQLWithFallback({
    query: FINISHED_TOURNAMENTS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { finishedTournaments: (await import('@/entities/tournament/tournaments.mocks')).getFinishedTournaments() }
    },
  })
}

export function usePlayersQuery(teamId?: Ref<string | null>) {
  return useGraphQLWithFallback({
    query: PLAYERS_QUERY,
    variables: () => (teamId ? { teamId: teamId.value } : {}),
    // Пустой id (турнир ещё грузится) означал бы players(teamId:"") —
    // запрос всех детей клуба. Ждём настоящий id.
    enabled: teamId ? () => !!teamId.value : undefined,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      const id = teamId?.value
      const { playersMock } = await import('@/entities/player/players.mocks')
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
      return { player: (await import('@/entities/player/players.mocks')).playersMock.find((p) => p.id === id.value) ?? null }
    },
  })
}

export function useAlbumsQuery() {
  return useGraphQLWithFallback({
    query: ALBUMS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return { albums: (await import('@/entities/gallery/gallery.mocks')).galleryMock }
    },
  })
}

export function useAlbumQuery(id: Ref<string>) {
  return useGraphQLWithFallback({
    query: ALBUM_QUERY,
    variables: () => ({ id: id.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { album: (await import('@/entities/gallery/gallery.mocks')).galleryMock.find((a) => a.id === id.value) ?? null }
    },
  })
}

export function useAlbumPhotosQuery(albumId: Ref<string>) {
  return useGraphQLWithFallback({
    query: ALBUM_PHOTOS_QUERY,
    variables: () => ({ albumId: albumId.value }),
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { albumPhotos: (await import('@/entities/gallery/gallery.mocks')).photosOfAlbum(albumId.value) }
    },
  })
}

export function useAllPhotosQuery() {
  return useGraphQLWithFallback({
    query: ALL_PHOTOS_QUERY,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 50))
      return { allPhotos: (await import('@/entities/gallery/gallery.mocks')).galleryMock.flatMap((a) => a.photos) }
    },
  })
}

export function useContactInfoQuery() {
  return useGraphQLWithFallback({
    query: CONTACT_INFO_QUERY,
    fallbackToMock: true,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 50))
      return { contactInfo: (await import('@/entities/contact/contacts.mocks')).contactInfoMock }
    },
  })
}

export function useVenuesQuery() {
  return useGraphQLWithFallback({
    query: VENUES_QUERY,
    fallbackToMock: true,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 50))
      return { venues: (await import('@/entities/contact/contacts.mocks')).venuesMock }
    },
  })
}

export function useHomeContentQuery() {
  return useGraphQLWithFallback({
    query: HOME_CONTENT_QUERY,
    fallbackToMock: true,
    mockFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return { pageContent: (await import('@/entities/content/content.mocks')).homeContentMock }
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
    fallbackToMock: true,
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
      return { reviews: (await import('@/entities/content/content.mocks')).reviewsMock }
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
import type { LeadFormDraft, LeadSubmitResult } from '@/entities/contact/contact.types'

export function useSubmitApplicationMutation() {
  const submitting = ref(false)
  const result = ref<LeadSubmitResult | null>(null)

  // useMutation обязан вызываться синхронно в setup-контексте — раньше он
  // вызывался внутри async submit() после await, вне жизненного цикла.
  const { mutate } = useMutation(SUBMIT_APPLICATION_MUTATION)

  async function submit(draft: LeadFormDraft & { message?: string }): Promise<LeadSubmitResult> {
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
