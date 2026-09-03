import { describe, it, expect } from 'vitest'
import { teamsMock } from '@/entities/team/teams.mocks'
import { coachesMock } from '@/entities/coach/coaches.mocks'
import { playersMock } from '@/entities/player/players.mocks'
import { galleryMock } from '@/entities/gallery/gallery.mocks'
import { tournamentsMock } from '@/entities/tournament/tournaments.mocks'
import { contactInfoMock, venuesMock } from '@/entities/contact/contacts.mocks'
import { homeContentMock, reviewsMock } from '@/entities/content/content.mocks'

/**
 * Ссылочная целостность моков.
 *
 * Пока бэкенда нет, моки — единственный источник данных, и разъезд между
 * ними даёт битые ссылки в UI (например, игрок ссылается на несуществующую
 * команду и «Команда игрока» ведёт в 404).
 */

function ids<T extends { id: string }>(list: ReadonlyArray<T>): string[] {
  return list.map((x) => x.id)
}

function expectUniqueIds<T extends { id: string }>(list: ReadonlyArray<T>, label: string) {
  const all = ids(list)
  expect(new Set(all).size, `${label}: id должны быть уникальны, получено ${all.join(', ')}`).toBe(all.length)
}

describe('целостность моков', () => {
  it('во всех коллекциях уникальные id', () => {
    expectUniqueIds(teamsMock, 'teams')
    expectUniqueIds(coachesMock, 'coaches')
    expectUniqueIds(playersMock, 'players')
    expectUniqueIds(galleryMock, 'albums')
    expectUniqueIds(tournamentsMock, 'tournaments')
    expectUniqueIds(venuesMock, 'venues')
    expectUniqueIds(reviewsMock, 'reviews')
  })

  it('коллекции непустые — иначе страницы отрендерят только empty state', () => {
    expect(teamsMock.length).toBeGreaterThan(0)
    expect(coachesMock.length).toBeGreaterThan(0)
    expect(playersMock.length).toBeGreaterThan(0)
    expect(galleryMock.length).toBeGreaterThan(0)
    expect(tournamentsMock.length).toBeGreaterThan(0)
  })

  it('каждый игрок ссылается на существующую команду', () => {
    const teamIds = new Set(ids(teamsMock))
    for (const p of playersMock) {
      expect(teamIds.has(p.team.id), `игрок ${p.id} → команда ${p.team.id} не существует`).toBe(true)
    }
  })

  /**
   * Раньше проверялось, что игрок ссылается на тренера из списка.
   * Сейчас состав тренеров РЕАЛЬНЫЙ (см. /sveden/employees), а игроки —
   * ещё демонстрационные, и связывать выдуманных детей с настоящими
   * людьми нельзя. Проверяем только целостность самой ссылки.
   *
   * Когда клуб передаст реальные составы, вернуть строгую проверку.
   */
  it('у каждого игрока заполнена ссылка на тренера', () => {
    for (const p of playersMock) {
      expect(p.coach.id, `игрок ${p.id} без тренера`).toBeTruthy()
      expect(p.coach.fullName, `игрок ${p.id} без имени тренера`).toBeTruthy()
    }
  })

  it('команды тренера существуют в списке команд', () => {
    const teamIds = new Set(ids(teamsMock))
    for (const c of coachesMock) {
      for (const t of c.teams) {
        expect(teamIds.has(t.id), `тренер ${c.id} → команда ${t.id} не существует`).toBe(true)
      }
    }
  })

  it('у каждого тренера есть галерея (требование этапа 6)', () => {
    for (const c of coachesMock) {
      expect(c.gallery.length, `у тренера ${c.id} пустая галерея`).toBeGreaterThan(0)
    }
  })

  it('фото альбома ссылаются на свой альбом', () => {
    for (const a of galleryMock) {
      for (const p of a.photos) {
        expect(p.albumId, `фото ${p.id} лежит в альбоме ${a.id}, но albumId=${p.albumId}`).toBe(a.id)
      }
    }
  })

  it('photosCount совпадает с реальным числом фото', () => {
    for (const a of galleryMock) {
      expect(a.photos.length, `альбом ${a.id}`).toBe(a.photosCount)
    }
  })

  it('обложка альбома есть среди его фото', () => {
    for (const a of galleryMock) {
      const found = a.photos.some((p) => p.id === a.coverPhotoId)
      expect(found, `альбом ${a.id}: coverPhotoId=${a.coverPhotoId} не найден среди фото`).toBe(true)
    }
  })

  it('строки турнирной таблицы ссылаются на участников турнира', () => {
    for (const t of tournamentsMock) {
      const teamIds = new Set(ids(t.teams))
      for (const s of t.standings) {
        expect(teamIds.has(s.teamId), `турнир ${t.id}: в таблице команда ${s.teamId}, которой нет среди участников`).toBe(true)
      }
    }
  })

  it('матчи ссылаются на участников турнира (кроме плейсхолдера tbd)', () => {
    for (const t of tournamentsMock) {
      const teamIds = new Set(ids(t.teams))
      for (const m of t.matches) {
        for (const side of [m.homeTeamId, m.awayTeamId]) {
          if (side === 'tbd') continue
          expect(teamIds.has(side), `турнир ${t.id}, матч ${m.id}: команда ${side} не участник`).toBe(true)
        }
      }
    }
  })

  it('позиции в таблице образуют последовательность 1..N', () => {
    for (const t of tournamentsMock) {
      if (t.standings.length === 0) continue
      const positions = [...t.standings].map((s) => s.position).sort((a, b) => a - b)
      expect(positions, `турнир ${t.id}`).toEqual(positions.map((_, i) => i + 1))
    }
  })

  it('арифметика таблицы сходится: И = В + Н + П', () => {
    for (const t of tournamentsMock) {
      for (const s of t.standings) {
        expect(s.wins + s.draws + s.losses, `турнир ${t.id}, команда ${s.teamId}`).toBe(s.played)
      }
    }
  })

  it('очки считаются по правилу 3-1-0', () => {
    for (const t of tournamentsMock) {
      for (const s of t.standings) {
        expect(s.points, `турнир ${t.id}, команда ${s.teamId}`).toBe(s.wins * 3 + s.draws)
      }
    }
  })

  it('разница мячей совпадает с забитыми минус пропущенные', () => {
    for (const t of tournamentsMock) {
      for (const s of t.standings) {
        expect(s.goalDifference, `турнир ${t.id}, команда ${s.teamId}`).toBe(s.goalsFor - s.goalsAgainst)
      }
    }
  })

  it('не более одного идущего турнира — иначе главная выберет произвольный', () => {
    const live = tournamentsMock.filter((t) => t.status === 'live')
    expect(live.length).toBeLessThanOrEqual(1)
  })

  it('даты турниров валидны и начало не позже конца', () => {
    for (const t of tournamentsMock) {
      const start = new Date(t.startDate).getTime()
      const end = new Date(t.endDate).getTime()
      expect(Number.isNaN(start), `турнир ${t.id}: битая startDate`).toBe(false)
      expect(Number.isNaN(end), `турнир ${t.id}: битая endDate`).toBe(false)
      expect(start, `турнир ${t.id}: начало позже конца`).toBeLessThanOrEqual(end)
    }
  })

  it('teamsCount совпадает с числом участников, если детализация есть', () => {
    // Архивный турнир может хранить только сводку (teamsCount) без разбора
    // по командам — тогда teams/matches/standings пусты, и страница
    // показывает сообщение вместо половины данных.
    for (const t of tournamentsMock) {
      if (t.teams.length === 0) continue
      expect(t.teams.length, `турнир ${t.id}`).toBe(t.teamsCount)
    }
  })

  it('турнир без списка команд не содержит матчей и таблицы (нет полуданных)', () => {
    for (const t of tournamentsMock) {
      if (t.teams.length > 0) continue
      expect(t.matches.length, `турнир ${t.id}: матчи без списка команд`).toBe(0)
      expect(t.standings.length, `турнир ${t.id}: таблица без списка команд`).toBe(0)
    }
  })

  it('сводный teamsCount всегда положителен', () => {
    for (const t of tournamentsMock) {
      expect(t.teamsCount, `турнир ${t.id}`).toBeGreaterThan(0)
    }
  })

  it('ровно одна основная площадка', () => {
    expect(venuesMock.filter((v) => v.isPrimary).length).toBe(1)
  })

  it('контакты клуба заполнены', () => {
    expect(contactInfoMock.phone).toMatch(/^\+?\d{10,}$/)
    expect(contactInfoMock.email).toContain('@')
    expect(contactInfoMock.telegram.startsWith('@')).toBe(true)
  })

  it('контент главной содержит все блоки', () => {
    expect(homeContentMock.stats.length).toBeGreaterThan(0)
    expect(homeContentMock.features.length).toBeGreaterThan(0)
    expect(homeContentMock.programs.length).toBeGreaterThan(0)
    expect(homeContentMock.trainingSteps.length).toBeGreaterThan(0)
    expect(homeContentMock.hero.titleLead).toBeTruthy()
    expect(homeContentMock.hero.titleAccent).toBeTruthy()
  })

  /**
   * Программы на главной соответствуют лицензии № 4557 (3–5, 6–7, 8–10,
   * 11–14), а команды пока демонстрационные и покрывают не все группы.
   * Требовать совпадения нельзя: это заставило бы подгонять лицензионные
   * программы под выдуманные команды, а не наоборот.
   */
  it('у каждой возрастной программы задана группа', () => {
    for (const p of homeContentMock.programs) {
      expect(p.ageGroup, `программа ${p.id} без группы`).toMatch(/^\d+-\d+$/)
    }
  })
})
