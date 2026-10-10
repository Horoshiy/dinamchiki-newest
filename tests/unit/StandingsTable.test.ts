import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StandingsTable from '@/widgets/tournament/StandingsTable.vue'
import { getCurrentTournament } from '@/entities/tournament/tournaments.mocks'

/**
 * Компонент принимал только `standings` и рендерил `row.teamName`,
 * `row.goalDiff`, `row.lastFive` — полей, которых у сущности Standing нет.
 * На сайте колонка «Команда» была пустой. Страницы передавали `:teams`,
 * но проп не был объявлен и молча терялся в fallthrough-атрибутах.
 */
const tournament = getCurrentTournament()!

function render(extra: Record<string, unknown> = {}) {
  return mount(StandingsTable, {
    props: {
      standings: tournament.standings,
      teams: tournament.teams,
      ...extra,
    },
  })
}

describe('StandingsTable', () => {
  it('рендерит строку на каждую команду', () => {
    expect(render().findAll('.standings__row')).toHaveLength(tournament.standings.length)
  })

  /** Тот самый дефект: колонка «Команда» была пустой. */
  it('колонка «Команда» заполнена названиями, а не пуста', () => {
    const w = render()
    const names = w.findAll('.standings__team-name').map((n) => n.text())
    expect(names).toHaveLength(tournament.standings.length)
    for (const name of names) {
      expect(name.length, 'название команды пустое').toBeGreaterThan(0)
    }
  })

  it('названия соответствуют участникам турнира', () => {
    const w = render()
    const actual = w.findAll('.standings__team-name').map((n) => n.text())
    const expected = [...tournament.standings]
      .sort((a, b) => a.position - b.position)
      .map((s) => tournament.teams.find((t) => t.id === s.teamId)!.name)
    expect(actual).toEqual(expected)
  })

  it('строки идут в порядке позиций', () => {
    const w = render()
    const positions = w.findAll('.standings__row').map((r) => Number(r.findAll('td')[0].text()))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  /** С 04.09.2026 колонка «Мячи» — забитые-пропущенные, как в протоколах детских лиг. */
  it('мячи показаны как «забито-пропущено»', () => {
    const w = render()
    const first = [...tournament.standings].sort((a, b) => a.position - b.position)[0]
    const goals = w.find('.standings__row td.standings__col-goals').text()
    expect(goals).toBe(`${first.goalsFor}-${first.goalsAgainst}`)
  })

  it('команда клуба подсвечена', () => {
    const w = render()
    const ours = tournament.teams.filter((t) => t.isOurTeam)
    expect(w.findAll('.standings__row--ours')).toHaveLength(ours.length)
  })

  it('без матчей колонка «Форма» скрыта', () => {
    const w = render()
    expect(w.text()).not.toContain('Форма')
    expect(w.findAll('.standings__col-form')).toHaveLength(0)
  })

  it('с матчами колонка «Форма» заполняется результатами', () => {
    const w = render({ matches: tournament.matches })
    expect(w.text()).toContain('Форма')
    const dots = w.findAll('.standings__dot')
    expect(dots.length).toBeGreaterThan(0)
    for (const d of dots) {
      expect(['В', 'Н', 'П']).toContain(d.text())
    }
  })

  it('форма считается по сыгранным матчам команды', () => {
    const w = render({ matches: tournament.matches })
    const leaderRow = w.findAll('.standings__row')[0]
    const played = tournament.matches.filter(
      (m) => m.score !== null &&
        (m.homeTeamId === tournament.standings.find((s) => s.position === 1)!.teamId ||
         m.awayTeamId === tournament.standings.find((s) => s.position === 1)!.teamId),
    ).length
    expect(leaderRow.findAll('.standings__dot')).toHaveLength(Math.min(played, 5))
  })

  it('неизвестная команда показывает идентификатор, а не пустоту', () => {
    const w = mount(StandingsTable, {
      props: {
        standings: [{ ...tournament.standings[0], teamId: 'нет-такой-команды' }],
        teams: [],
      },
    })
    expect(w.find('.standings__team-name').text()).toBe('нет-такой-команды')
  })

  it('пустая таблица объясняет, почему она пуста', () => {
    const w = mount(StandingsTable, { props: { standings: [], teams: [] } })
    expect(w.find('.standings').exists()).toBe(false)
    expect(w.text()).toContain('турнирная таблица появится')
  })
})
