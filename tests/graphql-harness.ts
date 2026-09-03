/**
 * Тестовый Apollo-клиент поверх НАСТОЯЩЕЙ схемы бэкенда.
 *
 * Прод после развёртывания apigql.dinamchiki.ru работает в режиме
 * USE_MOCKS_ONLY = false, то есть данные идут через Apollo. Если бы тесты
 * гоняли mock-ветку, они проверяли бы код, которого в проде нет.
 *
 * Поэтому здесь поднимается in-process GraphQL: схема читается из
 * dinamchiki-gql/src/schema.graphql, данные — из тех же сущностей.
 * Любой запрос фронтенда, не соответствующий контракту бэкенда,
 * валит тест — это и есть проверка контракта.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { SchemaLink } from '@apollo/client/link/schema'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { provideApolloClient } from '@vue/apollo-composable'

import { teamsMock } from '@/entities/team/teams.mocks'
import { coachesMock } from '@/entities/coach/coaches.mocks'
import { playersMock } from '@/entities/player/players.mocks'
import { galleryMock } from '@/entities/gallery/gallery.mocks'
import { tournamentsMock } from '@/entities/tournament/tournaments.mocks'
import { contactInfoMock, venuesMock } from '@/entities/contact/contacts.mocks'
import { homeContentMock, reviewsMock } from '@/entities/content/content.mocks'
import { validateLeadForm } from '@/entities/contact/lead.validation'
import type { LeadFormDraft } from '@/entities/contact/contact.types'

const SCHEMA_PATH = process.env.GQL_SCHEMA_PATH
  ?? resolve(process.cwd(), '../dinamchiki-gql/src/schema.graphql')

/** Схема бэкенда обязана быть доступна — иначе контракт нечем проверять. */
export const backendTypeDefs = readFileSync(SCHEMA_PATH, 'utf8')

type Args = Record<string, string | undefined>

function byId<T extends { id: string }>(list: ReadonlyArray<T>, id: string) {
  return list.find((x) => x.id === id) ?? null
}

/** Заявки, принятые в текущем тесте — чтобы проверять мутацию. */
export const submittedLeads: LeadFormDraft[] = []

/**
 * Поведение мутации в тесте.
 *
 * 'ok'          — бэкенд принимает заявку (нормальный прод-режим);
 * 'server-error' — бэкенд ответил ошибкой (проверяем, что UI не врёт об успехе);
 * 'unavailable'  — бэкенда нет (режим до развёртывания).
 */
export type SubmitBehavior = 'ok' | 'server-error' | 'unavailable'
let submitBehavior: SubmitBehavior = 'ok'

export function setSubmitBehavior(mode: SubmitBehavior) {
  submitBehavior = mode
}

export function resetHarness() {
  submittedLeads.length = 0
  submitBehavior = 'ok'
}

const resolvers = {
  Query: {
    teams: () => teamsMock,
    team: (_: unknown, { id }: Args) => byId(teamsMock, id!),
    coaches: () => coachesMock,
    coach: (_: unknown, { id }: Args) => byId(coachesMock, id!),
    tournaments: () => tournamentsMock,
    tournament: (_: unknown, { id }: Args) => byId(tournamentsMock, id!),
    currentTournament: () => tournamentsMock.find((t) => t.status === 'live') ?? null,
    upcomingTournaments: () => tournamentsMock.filter((t) => t.status === 'upcoming'),
    finishedTournaments: () => tournamentsMock.filter((t) => t.status === 'finished'),
    players: (_: unknown, { teamId }: Args) =>
      teamId ? playersMock.filter((p) => p.team.id === teamId) : playersMock,
    player: (_: unknown, { id }: Args) => byId(playersMock, id!),
    albums: () => galleryMock,
    album: (_: unknown, { id }: Args) => byId(galleryMock, id!),
    albumPhotos: (_: unknown, { albumId }: Args) =>
      galleryMock.find((a) => a.id === albumId)?.photos ?? [],
    allPhotos: () => galleryMock.flatMap((a) => a.photos),
    contactInfo: () => contactInfoMock,
    venues: () => venuesMock,
    pageContent: (_: unknown, { slug }: Args) => (slug === 'home' ? homeContentMock : null),
    reviews: () => reviewsMock,
  },
  Mutation: {
    submitApplication: (_: unknown, { input }: { input: LeadFormDraft }) => {
      const errors = validateLeadForm(input)
      const first = Object.values(errors)[0]
      if (first) return { ok: false, leadId: null, error: first }
      if (submitBehavior === 'server-error') {
        return { ok: false, leadId: null, error: 'Не удалось сохранить заявку, попробуйте позвонить' }
      }
      if (submitBehavior === 'unavailable') {
        return { ok: false, leadId: null, error: 'Сервер заявок недоступен' }
      }
      submittedLeads.push(input)
      return { ok: true, leadId: `lead-test-${submittedLeads.length}`, error: null }
    },
  },
}

export const testSchema = makeExecutableSchema({ typeDefs: backendTypeDefs, resolvers })

/** Свежий клиент на каждый тест — иначе кеш переносит данные между тестами. */
export function createTestApolloClient() {
  return new ApolloClient({
    link: new SchemaLink({ schema: testSchema }),
    // addTypename: false в Apollo 3.14 не поддерживается и ломает
    // нормализацию — объекты приходят пустыми.
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
      query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
      mutate: { errorPolicy: 'all' },
    },
  })
}

/** Установить клиента как глобальный — так же, как это делает main.ts. */
export function installTestApolloClient() {
  const client = createTestApolloClient()
  provideApolloClient(client)
  return client
}
