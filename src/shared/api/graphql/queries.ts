// =============================================================================
// GraphQL queries для dynamost-newest.
//
// недоступен (TLS internal error / 404). Queries написаны под спецификацию
// Этапа 11 и будут работать, когда бэкенд будет развёрнут.
//
// Стратегия на Этапе 11:
//   - Каждый useQuery в странице сначала пробует запрос к бэкенду
//   - При ошибке (network/CORS/500/unsupported field) — fallback на мок
//   - В консоли dev-tools пишется предупреждение «Using fallback mock data»
//
// Чтобы переключить фронт полностью на реальный бэкенд без моков —
// раскомментируйте USE_MOCKS = false в shared/api/config.ts.
// =============================================================================

import gql from 'graphql-tag'

// =============================================================================
// Fragments — переиспользуемые куски схемы
// =============================================================================

export const COACH_REF_FRAGMENT = gql`
  fragment CoachRefFields on CoachRef {
    id
    name
    role
  }
`

export const SCHEDULE_SLOT_FRAGMENT = gql`
  fragment ScheduleSlotFields on ScheduleSlot {
    day
    time
    venue
  }
`

export const TEAM_FIELDS = gql`
  ${SCHEDULE_SLOT_FRAGMENT}
  fragment TeamFields on Team {
    id
    name
    ageGroup
    ageLabel
    description
    playersCount
    color
    coach { ...CoachRefFields }
    schedule { ...ScheduleSlotFields }
  }
`

export const COACH_FIELDS = gql`
  fragment CoachFields on Coach {
    id
    fullName
    role
    description
    experienceYears
    specialization
    ageGroups
    avatarGradient
    achievements {
      title
      description
      iconKey
    }
    teams {
      id
      name
      ageGroup
      ageLabel
      schedule { ...ScheduleSlotFields }
    }
    gallery {
      id
      albumId
      url
      caption
      aspect
      placeholderColor
    }
  }
  ${SCHEDULE_SLOT_FRAGMENT}
`

export const TOURNAMENT_TEAM_FRAGMENT = gql`
  fragment TournamentTeamFields on TournamentTeam {
    id
    name
    shortName
    isOurTeam
    color
  }
`

export const TOURNAMENT_MATCH_FRAGMENT = gql`
  fragment TournamentMatchFields on TournamentMatch {
    id
    kind
    date
    homeTeamId
    awayTeamId
    score { home away }
    venue
  }
`

export const STANDING_FRAGMENT = gql`
  fragment StandingFields on Standing {
    teamId
    played
    wins
    draws
    losses
    goalsFor
    goalsAgainst
    goalDifference
    points
    position
  }
`

export const TOURNAMENT_FIELDS = gql`
  ${TOURNAMENT_TEAM_FRAGMENT}
  ${TOURNAMENT_MATCH_FRAGMENT}
  ${STANDING_FRAGMENT}
  fragment TournamentFields on Tournament {
    id
    name
    description
    ageGroup
    status
    startDate
    endDate
    venue
    prizeFund
    teamsCount
    teams { ...TournamentTeamFields }
    matches { ...TournamentMatchFields }
    standings { ...StandingFields }
  }
`

export const PLAYER_FIELDS = gql`
  fragment PlayerPhotoFields on PlayerPhoto {
    id
    url
    caption
    aspect
  }
  fragment PlayerAchievementFields on PlayerAchievement {
    id
    title
    description
    year
    iconKey
  }
  fragment PlayerFields on Player {
    id
    fullName
    age
    jerseyNumber
    position
    bio
    avatarGradient
    team { id name ageLabel color }
    coach { id fullName role }
    stats {
      matchesPlayed goals assists minutesPlayed yellowCards redCards
    }
    gallery { ...PlayerPhotoFields }
    achievements { ...PlayerAchievementFields }
  }
`

export const ALBUM_FIELDS = gql`
  fragment GalleryPhotoFields on GalleryPhoto {
    id
    albumId
    url
    caption
    aspect
    placeholderColor
  }
  fragment AlbumFields on GalleryAlbum {
    id
    title
    description
    category
    date
    venue
    photosCount
    coverPhotoId
    photos { ...GalleryPhotoFields }
  }
`

export const VENUE_FIELDS = gql`
  fragment VenueFields on Venue {
    id
    name
    address
    shortAddress
    workingHours
    phone
    ageGroups
    mapUrl
    isPrimary
  }
`

// =============================================================================
// Queries
// =============================================================================

export const TEAMS_QUERY = gql`
  query Teams {
    teams { ...TeamFields }
  }
  ${TEAM_FIELDS}
  ${COACH_REF_FRAGMENT}
`

export const TEAM_QUERY = gql`
  query Team($id: ID!) {
    team(id: $id) { ...TeamFields }
  }
  ${TEAM_FIELDS}
  ${COACH_REF_FRAGMENT}
`

export const COACHES_QUERY = gql`
  query Coaches {
    coaches { ...CoachFields }
  }
  ${COACH_FIELDS}
`

export const COACH_QUERY = gql`
  query Coach($id: ID!) {
    coach(id: $id) { ...CoachFields }
  }
  ${COACH_FIELDS}
`

export const TOURNAMENTS_QUERY = gql`
  query Tournaments {
    tournaments { ...TournamentFields }
  }
  ${TOURNAMENT_FIELDS}
`

export const TOURNAMENT_QUERY = gql`
  query Tournament($id: ID!) {
    tournament(id: $id) { ...TournamentFields }
  }
  ${TOURNAMENT_FIELDS}
`

export const CURRENT_TOURNAMENT_QUERY = gql`
  query CurrentTournament {
    currentTournament { ...TournamentFields }
  }
  ${TOURNAMENT_FIELDS}
`

export const UPCOMING_TOURNAMENTS_QUERY = gql`
  query UpcomingTournaments {
    upcomingTournaments { ...TournamentFields }
  }
  ${TOURNAMENT_FIELDS}
`

export const FINISHED_TOURNAMENTS_QUERY = gql`
  query FinishedTournaments {
    finishedTournaments { ...TournamentFields }
  }
  ${TOURNAMENT_FIELDS}
`

export const PLAYERS_QUERY = gql`
  query Players($teamId: ID) {
    players(teamId: $teamId) { ...PlayerFields }
  }
  ${PLAYER_FIELDS}
`

export const PLAYER_QUERY = gql`
  query Player($id: ID!) {
    player(id: $id) { ...PlayerFields }
  }
  ${PLAYER_FIELDS}
`

export const ALBUMS_QUERY = gql`
  query Albums {
    albums { ...AlbumFields }
  }
  ${ALBUM_FIELDS}
`

export const ALBUM_QUERY = gql`
  query Album($id: ID!) {
    album(id: $id) { ...AlbumFields }
  }
  ${ALBUM_FIELDS}
`

export const ALBUM_PHOTOS_QUERY = gql`
  query AlbumPhotos($albumId: ID!) {
    albumPhotos(albumId: $albumId) { ...GalleryPhotoFields }
  }
  ${ALBUM_FIELDS}
`

export const ALL_PHOTOS_QUERY = gql`
  query AllPhotos {
    allPhotos { ...GalleryPhotoFields }
  }
  ${ALBUM_FIELDS}
`

export const CONTACT_INFO_QUERY = gql`
  query ContactInfo {
    contactInfo {
      phone
      phoneFormatted
      whatsapp
      telegram
      email
      legalAddress
      inn
      socials { vk youtube }
    }
  }
`

export const VENUES_QUERY = gql`
  query Venues {
    venues { ...VenueFields }
  }
  ${VENUE_FIELDS}
`

// =============================================================================
// PageContent + Review (контент главной)
// =============================================================================

export const PAGE_CONTENT_FIELDS = gql`
  fragment HeroContentFields on HeroContent {
    eyebrow
    titleLead
    titleAccent
    description
  }

  fragment StatItemFields on StatItem {
    id
    value
    label
    caption
    iconKey
  }

  fragment FeatureItemFields on FeatureItem {
    id
    title
    description
    iconKey
  }

  fragment AgeProgramFields on AgeProgram {
    id
    ageLabel
    title
    description
    ageGroup
  }

  fragment TrainingStepFields on TrainingStep {
    id
    title
    description
    iconKey
  }

  fragment PageContentFields on PageContent {
    hero { ...HeroContentFields }
    stats { ...StatItemFields }
    features { ...FeatureItemFields }
    programs { ...AgeProgramFields }
    trainingSteps { ...TrainingStepFields }
  }
`

export const REVIEW_FIELDS = gql`
  fragment ReviewFields on Review {
    id
    text
    authorName
    authorRelation
    initials
  }
`

export const HOME_CONTENT_QUERY = gql`
  query HomeContent {
    pageContent(slug: "home") { ...PageContentFields }
  }
  ${PAGE_CONTENT_FIELDS}
`

/**
 * Сквозной контракт: порядок секций на странице.
 *
 * Бэкенд возвращает секции, уже отсортированные по `order`. Каждая секция
 * несёт `kind` (HERO/LIST/GALLERY/CONTACT/TEXT/MEDIA/LINK) и `collection` —
 * имя поля в `PageContent` (hero/stats/features/programs/trainingSteps) или
 * отдельная коллекция (albums/photos/coaches/tournaments/reviews).
 *
 * Если layout по маршруту не настроен — `pageLayout` вернёт `null`, и страница
 * должна fallback'нуться на дефолтный порядок (см. FALLBACK_HOME_SECTIONS в
 * composables.ts).
 */
export const PAGE_LAYOUT_QUERY = gql`
  query PageLayout($route: String!) {
    pageLayout(route: $route) {
      route
      title
      sections {
        order
        kind
        label
        collection
        visible
      }
    }
  }
`

export const REVIEWS_QUERY = gql`
  query Reviews {
    reviews { ...ReviewFields }
  }
  ${REVIEW_FIELDS}
`

// =============================================================================
// Mutations
// =============================================================================

export const SUBMIT_APPLICATION_MUTATION = gql`
  mutation SubmitApplication($input: LeadFormInput!) {
    submitApplication(input: $input) {
      ok
      leadId
      error
    }
  }
`
