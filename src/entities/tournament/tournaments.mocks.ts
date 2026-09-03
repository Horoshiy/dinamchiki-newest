// =============================================================================
// Mock-данные турниров. До подключения GraphQL (Этап 11).
// Структура 1-в-1 с будущим ответом tournaments query.
// =============================================================================
import type {
  Tournament,
  TournamentMatch,
  Standing,
} from './tournament.types'

// =============================================================================
// Турнир 1: текущий (live) — Осенний кубок Ставрополя 2026, U-10
// =============================================================================

const autumn2026Teams = [
  { id: 'u10-blue',   name: 'Динамчики U-10',          shortName: 'ДИН', isOurTeam: true,  color: '#1e50d8' },
  { id: 'spartak',    name: 'Спартак Ставрополь U-10', shortName: 'СПК', isOurTeam: false, color: '#dc2626' },
  { id: 'cska',       name: 'ЦСКА Ставрополь U-10',    shortName: 'ЦСК', isOurTeam: false, color: '#0d2b6e' },
  { id: 'krasnodar',  name: 'Краснодар-2009 U-10',     shortName: 'КРД', isOurTeam: false, color: '#16a34a' },
  { id: 'zenit',      name: 'Зенит Ставрополь U-10',   shortName: 'ЗНТ', isOurTeam: false, color: '#2563eb' },
  { id: 'akademiya',  name: 'Академия Кисловодск U-10',shortName: 'АКД', isOurTeam: false, color: '#ca8a04' },
]

const autumn2026Matches: ReadonlyArray<TournamentMatch> = [
  // Сыгранные
  { id: 'a26-m1', kind: 'group', date: '2026-08-20T17:00:00', homeTeamId: 'u10-blue', awayTeamId: 'spartak',   score: { home: 3, away: 1 }, venue: 'Стадион «Динамо»' },
  { id: 'a26-m2', kind: 'group', date: '2026-08-20T18:30:00', homeTeamId: 'cska',     awayTeamId: 'krasnodar', score: { home: 2, away: 2 }, venue: 'Стадион «Динамо»' },
  { id: 'a26-m3', kind: 'group', date: '2026-08-21T17:00:00', homeTeamId: 'zenit',    awayTeamId: 'akademiya', score: { home: 0, away: 1 }, venue: 'Манеж «Динамо»' },
  { id: 'a26-m4', kind: 'group', date: '2026-08-22T17:00:00', homeTeamId: 'u10-blue', awayTeamId: 'cska',      score: { home: 4, away: 0 }, venue: 'Стадион «Динамо»' },
  { id: 'a26-m5', kind: 'group', date: '2026-08-22T18:30:00', homeTeamId: 'spartak',  awayTeamId: 'zenit',     score: { home: 2, away: 2 }, venue: 'Стадион «Динамо»' },
  // Предстоящие (null score)
  { id: 'a26-m6', kind: 'group', date: '2026-08-26T17:00:00', homeTeamId: 'krasnodar', awayTeamId: 'u10-blue', score: null, venue: 'Стадион «Динамо»' },
  { id: 'a26-m7', kind: 'group', date: '2026-08-26T18:30:00', homeTeamId: 'akademiya', awayTeamId: 'spartak',  score: null, venue: 'Стадион «Динамо»' },
  { id: 'a26-m8', kind: 'semi',  date: '2026-08-30T17:00:00', homeTeamId: 'u10-blue', awayTeamId: 'cska',      score: null, venue: 'Стадион «Динамо»' },
  { id: 'a26-m9', kind: 'final', date: '2026-09-02T15:00:00', homeTeamId: 'tbd',      awayTeamId: 'tbd',       score: null, venue: 'Стадион «Динамо»' },
]

// Стандартный расчёт standings: 3 очка победа, 1 — ничья, 0 — поражение.
function computeStandings(
  teams: ReadonlyArray<{ id: string; isOurTeam: boolean; color: string; name: string; shortName: string }>,
  matches: ReadonlyArray<TournamentMatch>,
): ReadonlyArray<Standing> {
  type Row = { teamId: string; played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number }
  const map = new Map<string, Row>()
  for (const t of teams) {
    if (t.id === 'tbd') continue
    map.set(t.id, { teamId: t.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 })
  }
  for (const m of matches) {
    if (!m.score || m.homeTeamId === 'tbd' || m.awayTeamId === 'tbd') continue
    const h = map.get(m.homeTeamId); const a = map.get(m.awayTeamId)
    if (!h || !a) continue
    h.played++; a.played++
    h.goalsFor += m.score.home;     h.goalsAgainst += m.score.away
    a.goalsFor += m.score.away;     a.goalsAgainst += m.score.home
    if (m.score.home > m.score.away) { h.wins++;  a.losses++ }
    else if (m.score.home < m.score.away) { a.wins++;  h.losses++ }
    else { h.draws++; a.draws++ }
  }
  const rows = Array.from(map.values()).map((r) => {
    const points = r.wins * 3 + r.draws
    const goalDifference = r.goalsFor - r.goalsAgainst
    return { ...r, points, goalDifference, position: 0 }
  })
  // сортировка: очки → разница → забитые
  rows.sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points
    if (y.goalDifference !== x.goalDifference) return y.goalDifference - x.goalDifference
    return y.goalsFor - x.goalsFor
  })
  rows.forEach((r, i) => (r.position = i + 1))
  return rows
}

const autumn2026Standings = computeStandings(autumn2026Teams, autumn2026Matches)

const autumn2026: Tournament = {
  id: 'autumn-cup-2026',
  name: 'Осенний кубок Ставрополя 2026',
  description:
    'Главный детский турнир региона среди команд U-10. 6 команд-участниц, групповой этап + плей-офф. Наши парни — действующие чемпионы прошлого сезона.',
  ageGroup: '8–10 лет',
  status: 'live',
  startDate: '2026-08-18',
  endDate: '2026-09-02',
  venue: 'Стадион «Динамо», г. Ставрополь',
  prizeFund: 'Кубок + медали + сертификаты',
  teamsCount: 6,
  teams: autumn2026Teams,
  matches: autumn2026Matches,
  standings: autumn2026Standings,
}

// =============================================================================
// Турнир 2: предстоящий (upcoming) — Зимний кубок 2026, U-12
// =============================================================================

const winter2026Teams = [
  { id: 'u12-blue', name: 'Динамчики U-12', shortName: 'ДИН', isOurTeam: true, color: '#143494' },
  { id: 'rostov',   name: 'Ростов U-12',    shortName: 'РСТ', isOurTeam: false, color: '#f59e0b' },
  { id: 'kuban',    name: 'Кубань U-12',    shortName: 'КБН', isOurTeam: false, color: '#16a34a' },
  { id: 'loko',     name: 'Локомотив U-12', shortName: 'ЛКМ', isOurTeam: false, color: '#dc2626' },
  { id: 'dinamo-m', name: 'Динамо М U-12',  shortName: 'ДНМ', isOurTeam: false, color: '#0d2b6e' },
  { id: 'akhmat',   name: 'Ахмат U-12',     shortName: 'АХМ', isOurTeam: false, color: '#16a34a' },
  { id: 'zenit-s',  name: 'Зенит СПб U-12', shortName: 'ЗНТ', isOurTeam: false, color: '#2563eb' },
  { id: 'sbornaya', name: 'Сборная СКФО',   shortName: 'СКФ', isOurTeam: false, color: '#7c3aed' },
]

const winter2026: Tournament = {
  id: 'winter-cup-2026',
  name: 'Зимний кубок 2026',
  description:
    'Межрегиональный турнир среди команд U-12. 8 сильнейших команд юга России. Подготовка к весеннему первенству.',
  ageGroup: '11–14 лет',
  status: 'upcoming',
  startDate: '2026-12-05',
  endDate: '2026-12-15',
  venue: 'Манеж «Динамо», г. Ставрополь',
  prizeFund: '300 000 �',
  teamsCount: 8,
  teams: winter2026Teams,
  matches: [],
  standings: [],
}

// =============================================================================
// Турнир 3: завершённый (finished) — Весенний кубок 2026, U-10 (МЫ ПОБЕДИЛИ)
// =============================================================================

const spring2026Teams = [
  { id: 'u10-blue',  name: 'Динамчики U-10',          shortName: 'ДИН', isOurTeam: true,  color: '#1e50d8' },
  { id: 'spartak',   name: 'Спартак Ставрополь U-10', shortName: 'СПК', isOurTeam: false, color: '#dc2626' },
  { id: 'cska',      name: 'ЦСКА Ставрополь U-10',    shortName: 'ЦСК', isOurTeam: false, color: '#0d2b6e' },
  { id: 'krasnodar', name: 'Краснодар-2009 U-10',     shortName: 'КРД', isOurTeam: false, color: '#16a34a' },
]

const spring2026Matches: ReadonlyArray<TournamentMatch> = [
  { id: 's26-m1', kind: 'group', date: '2026-04-15T17:00:00', homeTeamId: 'u10-blue', awayTeamId: 'spartak',   score: { home: 2, away: 1 }, venue: 'Стадион «Динамо»' },
  { id: 's26-m2', kind: 'group', date: '2026-04-16T17:00:00', homeTeamId: 'cska',     awayTeamId: 'krasnodar', score: { home: 1, away: 1 }, venue: 'Стадион «Динамо»' },
  { id: 's26-m3', kind: 'semi',  date: '2026-04-20T17:00:00', homeTeamId: 'u10-blue', awayTeamId: 'cska',      score: { home: 3, away: 0 }, venue: 'Стадион «Динамо»' },
  { id: 's26-m4', kind: 'final', date: '2026-04-25T15:00:00', homeTeamId: 'u10-blue', awayTeamId: 'spartak',   score: { home: 2, away: 0 }, venue: 'Стадион «Динамо»' },
]

const spring2026Standings = computeStandings(spring2026Teams, spring2026Matches)

const spring2026: Tournament = {
  id: 'spring-cup-2026',
  name: 'Весенний кубок 2026',
  description: 'Турнир среди команд U-10 Ставропольского края. 4 команды, групповой этап + плей-офф. Динамчики — победители.',
  ageGroup: '8–10 лет',
  status: 'finished',
  startDate: '2026-04-10',
  endDate: '2026-04-25',
  venue: 'Стадион «Динамо», г. Ставрополь',
  prizeFund: 'Кубок + медали',
  teamsCount: 4,
  teams: spring2026Teams,
  matches: spring2026Matches,
  standings: spring2026Standings,
}

// =============================================================================
// Турнир 4: завершённый (архив) — Летний турнир 2025, U-12
// =============================================================================

const summer2025: Tournament = {
  id: 'summer-cup-2025',
  name: 'Летний турнир 2025',
  description: 'Открытый турнир среди U-12. Динамчики взяли серебро.',
  ageGroup: '11–14 лет',
  status: 'finished',
  startDate: '2025-07-10',
  endDate: '2025-07-20',
  venue: 'Манеж «Динамо», г. Ставрополь',
  prizeFund: 'Сертификаты',
  teamsCount: 6,
  teams: [],
  matches: [],
  standings: [],
}

export const tournamentsMock: ReadonlyArray<Tournament> = [
  autumn2026,
  winter2026,
  spring2026,
  summer2025,
]

/** Утилита: текущий (live) турнир — для главной страницы. */
export function getCurrentTournament(): Tournament | undefined {
  return tournamentsMock.find((t) => t.status === 'live')
}

/** Утилита: предстоящие турниры. */
export function getUpcomingTournaments(): ReadonlyArray<Tournament> {
  return tournamentsMock.filter((t) => t.status === 'upcoming')
}

/** Утилита: завершённые турниры (архив). */
export function getFinishedTournaments(): ReadonlyArray<Tournament> {
  return tournamentsMock.filter((t) => t.status === 'finished')
}
