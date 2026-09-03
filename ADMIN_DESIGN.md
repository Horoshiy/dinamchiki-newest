# Админка для flowise.dinamchiki.ru — финальный план

> **Согласовано:**
> 1. Один GraphQL-эндпоинт `apigql.dinamchiki.ru/query` (1а)
> 2. UI на Vue 3 + Element Plus + vuedraggable + TipTap (2б)
> 3. BasicAuth (Caddy) + login по паролю из .env + HMAC-сессия в HttpOnly cookie (3 ок)
> 4. Адрес админки: **`n4j.dinamchiki.ru`** (домен свободен, DNS резолвится на наш сервер, в Caddy не используется)

---

## 1. Что есть сейчас

| Компонент | Стек | Где |
|---|---|---|
| **Фронт (публичный)** | Vue 3 + TS + Apollo + SCSS | `/home/clawd/dinamchiki-newest/`, деплой в `/srv/dynamost-flowise` |
| **Бэкенд (публичный)** | Node 22 + GraphQL Yoga + better-sqlite3 | `/home/clawd/dinamchiki-gql/`, деплой systemd `dinamchiki-gql` на 127.0.0.1:8175 |
| **БД контента** | seed.ts (генерится из `dinamchiki-newest/src/entities/*`) | `/home/clawd/dinamchiki-gql/data/seed.json` |
| **БД заявок** | SQLite WAL | `/home/clawd/dinamchiki-gql/data/leads.db` |
| **Caddy** | flowise.dinamchiki.ru (BasicAuth, docroot `/srv/dynamost-flowise`) | `/etc/caddy/addons/flowise.conf` |
| **Caddy** | apigql.dinamchiki.ru → `127.0.0.1:8175/query` | `/etc/caddy/addons/apigql.conf` |
| **Админка** | _нет_ | папка `dinamchiki-backend-newest/` пустая |

Контракт GraphQL (`dinamchiki-gql/src/schema.graphql`, 344 строки) уже включает всё необходимое:
`teams / coaches / tournaments / players / albums / contactInfo / venues / pageContent / reviews / submitApplication`.
В админке нужно **только добавить мутации** (CRUD + reorder), без ломки существующих типов.

---

## 2. Архитектура

```
                         Caddy (this host)
                         ─────────────────
flowise.dinamchiki.ru          → /srv/dynamost-flowise      (BasicAuth, статика SPA)
n4j.dinamchiki.ru             → /srv/dynamost-admin        (BasicAuth, НОВЫЙ — админка SPA)
apigql.dinamchiki.ru          → 127.0.0.1:8175/query       (GraphQL Yoga, существующий)
                                  ▲
                                  │ единый GraphQL
                          ┌───────┴────────┐
                          │                │
                ┌─────────┴────┐    ┌──────┴────────┐
                │ Публичный    │    │ Админский     │
                │ фронт        │    │ UI            │
                │ (Vue+Apollo) │    │ (Vue+Apollo)  │
                └──────────────┘    └───────────────┘
                                       │
                                       │ login password → HttpOnly cookie
                                       │ cookie → X-Admin-Token при GraphQL-запросе
                                       ▼
                              ┌────────────────────────┐
                              │ Yoga schema extensions │
                              │  - admin-only Mutations│
                              │  - protected by        │
                              │    X-Admin-Token       │
                              └────────────────────────┘
                                       │
                              ┌────────┴───────┐
                              │ seed.ts        │
                              │ leads.db       │
                              └────────────────┘
```

**Ключевые решения:**
- **Не дублируем GraphQL-эндпоинт.** Админка и публичный фронт бьют в один и тот же Yoga-сервер.
- **Разделение доступа** через header `X-Admin-Token`, который проверяет middleware в Yoga. Если токена нет — публичные Query/mutation как обычно, admin-мутации возвращают ошибку `FORBIDDEN`.
- **Токен** = HMAC-подпись `(user_id + expires)` общим секретом из `.env`. Не JWT (overkill), простая подпись.
- **HttpOnly cookie** с этим токеном ставит сам Yoga на `/admin/login`. Фронт админки читает cookie автоматически (SameSite=Lax) и шлёт в `X-Admin-Token` в каждом запросе (через Apollo link).
- **BasicAuth от Caddy** остаётся первым рубежом (не светим админку в мир без пароля).

---

## 3. Что добавляем в `dinamchiki-gql` (минимально-инвазивно)

### 3.1 Расширение `schema.graphql`

```graphql
# ─── Аутентификация админки ────────────────────────────────────────────────

input AdminLoginInput {
  password: String!
}

type AdminSession {
  token: String!
  expiresAt: DateTime!
}

# ─── Аудит ─────────────────────────────────────────────────────────────────

type AuditLogEntry {
  id: ID!
  actor: String!
  action: String!
  entityType: String!
  entityId: String
  payloadJson: String
  createdAt: DateTime!
}

# ─── Новые мутации (CRUD + reorder) ───────────────────────────────────────

input TeamInput {
  id: ID
  name: String!
  ageGroup: String!
  ageLabel: String!
  description: String!
  playersCount: Int!
  color: String!
  coachId: ID!
  schedule: [ScheduleSlotInput!]!
}

input ScheduleSlotInput {
  day: String!
  time: String!
  venue: String!
}

input CoachInput {
  id: ID
  fullName: String!
  role: String!
  description: String!
  experienceYears: Int!
  specialization: [String!]!
  ageGroups: [String!]!
  avatarGradient: String!
  achievements: [CoachAchievementInput!]!
}

input CoachAchievementInput {
  title: String!
  description: String!
  iconKey: String!
}

input TournamentInput {
  id: ID
  name: String!
  description: String!
  ageGroup: String
  status: String!
  startDate: DateTime!
  endDate: DateTime!
  venue: String!
  prizeFund: String!
  teams: [TournamentTeamInput!]!
  matches: [TournamentMatchInput!]!
}

input TournamentTeamInput {
  id: ID
  name: String!
  shortName: String!
  isOurTeam: Boolean!
  color: String!
}

input TournamentMatchInput {
  id: ID
  kind: String!
  date: DateTime!
  homeTeamId: ID!
  awayTeamId: ID!
  scoreHome: Int
  scoreAway: Int
  venue: String!
}

input StandingInput {
  teamId: ID!
  played: Int!
  wins: Int!
  draws: Int!
  losses: Int!
  goalsFor: Int!
  goalsAgainst: Int!
  position: Int!
  points: Int!
}

input PlayerInput {
  id: ID
  fullName: String!
  age: Int!
  jerseyNumber: Int!
  position: String!
  bio: String!
  avatarGradient: String!
  teamId: ID!
  coachId: ID!
  stats: PlayerStatsInput!
}

input PlayerStatsInput {
  matchesPlayed: Int!
  goals: Int!
  assists: Int!
  minutesPlayed: Int!
  yellowCards: Int!
  redCards: Int!
}

input GalleryAlbumInput {
  id: ID
  title: String!
  description: String!
  category: String!
  date: DateTime!
  venue: String!
  coverPhotoId: ID
  photos: [GalleryPhotoInput!]!
}

input GalleryPhotoInput {
  id: ID
  albumId: ID!
  url: String!
  caption: String
  aspect: String!
  placeholderColor: String!
}

input ContactInfoInput {
  phone: String!
  phoneFormatted: String!
  whatsapp: String!
  telegram: String!
  email: String!
  legalAddress: String!
  inn: String
  socials: SocialsInput!
}

input SocialsInput {
  vk: String
  youtube: String
}

input VenueInput {
  id: ID
  name: String!
  address: String!
  shortAddress: String!
  workingHours: String!
  phone: String
  ageGroups: [String!]!
  mapUrl: String!
  isPrimary: Boolean!
}

input ReviewInput {
  id: ID
  text: String!
  authorName: String!
  authorRelation: String!
  initials: String!
}

input PageContentInput {
  hero: HeroContentInput!
  stats: [StatItemInput!]!
  features: [FeatureItemInput!]!
  programs: [AgeProgramInput!]!
  trainingSteps: [TrainingStepInput!]!
}

input HeroContentInput {
  eyebrow: String!
  titleLead: String!
  titleAccent: String!
  description: String!
}

input StatItemInput {
  id: ID
  value: String!
  label: String!
  caption: String!
  iconKey: String!
}

input FeatureItemInput {
  id: ID
  title: String!
  description: String!
  iconKey: String!
}

input AgeProgramInput {
  id: ID
  ageLabel: String!
  title: String!
  description: String!
  ageGroup: String!
}

input TrainingStepInput {
  id: ID
  title: String!
  description: String!
  iconKey: String!
}

# ─── Reorder (drag-and-drop внутри групп PageContent) ─────────────────────

input ReorderStatsInput { orderedIds: [ID!]! }
input ReorderFeaturesInput { orderedIds: [ID!]! }
input ReorderProgramsInput { orderedIds: [ID!]! }
input ReorderStepsInput { orderedIds: [ID!]! }
input ReorderAlbumsInput { orderedIds: [ID!]! }
input ReorderTeamsInput { orderedIds: [ID!]! }

# ─── Расширение Query ──────────────────────────────────────────────────────

extend type Query {
  adminPing: String!                    # для проверки токена
  auditLog(limit: Int = 50): [AuditLogEntry!]!
  leadsAdmin(limit: Int = 100, offset: Int = 0): [Lead!]!
}

type Lead {
  id: ID!
  childName: String!
  childAge: String!
  parentName: String!
  phone: String!
  email: String
  preferredTime: String
  message: String
  ageGroup: String
  createdAt: DateTime!
}

# ─── Новые мутации ──────────────────────────────────────────────────────────

extend type Mutation {
  adminLogin(input: AdminLoginInput!): AdminSession!
  adminLogout: Boolean!

  # Teams
  upsertTeam(input: TeamInput!): Team!
  deleteTeam(id: ID!): Boolean!
  reorderTeams(input: ReorderTeamsInput!): [Team!]!

  # Coaches
  upsertCoach(input: CoachInput!): Coach!
  deleteCoach(id: ID!): Boolean!

  # Tournaments
  upsertTournament(input: TournamentInput!): Tournament!
  deleteTournament(id: ID!): Boolean!
  upsertStanding(tournamentId: ID!, input: StandingInput!): Tournament!

  # Players
  upsertPlayer(input: PlayerInput!): Player!
  deletePlayer(id: ID!): Boolean!

  # Gallery
  upsertAlbum(input: GalleryAlbumInput!): GalleryAlbum!
  deleteAlbum(id: ID!): Boolean!
  reorderAlbums(input: ReorderAlbumsInput!): [GalleryAlbum!]!

  # Contacts
  updateContactInfo(input: ContactInfoInput!): ContactInfo!
  upsertVenue(input: VenueInput!): Venue!
  deleteVenue(id: ID!): Boolean!

  # PageContent (главная)
  updatePageContent(slug: String!, input: PageContentInput!): PageContent!
  reorderStats(slug: String!, input: ReorderStatsInput!): [StatItem!]!
  reorderFeatures(slug: String!, input: ReorderFeaturesInput!): [FeatureItem!]!
  reorderPrograms(slug: String!, input: ReorderProgramsInput!): [AgeProgram!]!
  reorderSteps(slug: String!, input: ReorderStepsInput!): [TrainingStep!]!

  # Reviews
  upsertReview(input: ReviewInput!): Review!
  deleteReview(id: ID!): Boolean!

  # Audit / Leads
  deleteLead(id: ID!): Boolean!
}
```

### 3.2 Что НЕ ломаем

- Все существующие `Query.teams / coaches / tournaments / players / albums / contactInfo / venues / pageContent / reviews / submitApplication` остаются.
- Существующие `Team / Coach / Tournament / Player / GalleryAlbum / ...` — **не трогаем сигнатуры**, только добавляем input-ы для мутаций.
- `data.ts` (seed loader) — перерабатываем, чтобы seed читался не только на старте, но и при мутациях (через общий `Repository` слой).

### 3.3 Repository layer (новый)

`dinamchiki-gql/src/repository/` — обёртки над `data.ts` и `leads.db`:

```
repository/
├── content.ts    # in-memory + persist в data/content.json (автосейв)
├── leads.ts      # SQLite CRUD
├── audit.ts      # SQLite WAL, append-only лог
└── session.ts    # HMAC sign/verify для cookie
```

`content.json` — новый файл, куда Repository пишет каждое изменение (атомарно через `write + rename`). При старте — читает, если нет — фоллбек на `seed.json`. Это даёт нам **сохраняемость правок**, которой сейчас нет (seed перегенерируется `npm run seed`).

### 3.4 Защита admin-мутаций

В `app.ts` (Yoga config) добавляем:

```ts
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'dev-password-change-me'
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-me-32-chars-min'

// Middleware: проверка X-Admin-Token для всех admin-only мутаций
const ADMIN_MUTATIONS = new Set([
  'upsertTeam', 'deleteTeam', 'reorderTeams',
  'upsertCoach', 'deleteCoach',
  'upsertTournament', 'deleteTournament', 'upsertStanding',
  'upsertPlayer', 'deletePlayer',
  'upsertAlbum', 'deleteAlbum', 'reorderAlbums',
  'updateContactInfo', 'upsertVenue', 'deleteVenue',
  'updatePageContent', 'reorderStats', 'reorderFeatures',
  'reorderPrograms', 'reorderSteps',
  'upsertReview', 'deleteReview',
  'deleteLead', 'adminLogout',
])

useGraphQLAuth((ctx) => {
  const op = ctx.params?.query ? extractMutation(ctx.params.query) : null
  if (op && ADMIN_MUTATIONS.has(op)) {
    const token = ctx.request.headers.get('X-Admin-Token')
    if (!token || !verifySession(token, SESSION_SECRET)) {
      throw new Error('FORBIDDEN: admin token required')
    }
  }
})
```

`session.ts`:

```ts
export function signSession(userId: string, secret: string, ttlSec = 7 * 24 * 3600) {
  const exp = Math.floor(Date.now() / 1000) + ttlSec
  const payload = `${userId}.${exp}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifySession(token: string, secret: string): { userId: string; exp: number } | null {
  const [userId, expStr, sig] = token.split('.')
  if (!userId || !expStr || !sig) return null
  const expected = crypto.createHmac('sha256', secret).update(`${userId}.${expStr}`).digest('hex')
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  if (Number(expStr) < Math.floor(Date.now() / 1000)) return null
  return { userId, exp: Number(expStr) }
}
```

`AdminLoginInput.password === ADMIN_PASSWORD` → возвращаем `signSession('admin', SESSION_SECRET)`, ставим `Set-Cookie: admin_session=...; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=...`.

### 3.5 Audit log

`audit.ts` — отдельная SQLite-таблица `audit_log(id, actor, action, entity_type, entity_id, payload_json, created_at)`. Каждая admin-мутация пишет запись в транзакции с самой мутацией. В UI — простая вкладка «История».

---

## 4. Что делаем в `dinamchiki-backend-newest`

```
dinamchiki-backend-newest/
├── package.json                  # vue, vue-router, pinia, @vue/apollo-composable,
│                                 # element-plus, vuedraggable, @tiptap/vue-3, vite
├── vite.config.ts                # base: '/' (Caddy смотрит корень)
├── tsconfig.json
├── index.html
├── public/
├── src/
│   ├── main.ts                   # Element Plus + Apollo + Router + Pinia
│   ├── App.vue
│   ├── router/index.ts           # /login, /dashboard, /teams, /coaches, /tournaments,
│   │                             # /players, /gallery, /contacts, /page-content,
│   │                             # /reviews, /leads, /audit
│   ├── apollo/
│   │   ├── client.ts             # HttpLink на /query + authLink (X-Admin-Token из cookie)
│   │   └── queries.ts            # все admin-мутации + Query
│   ├── shared/
│   │   ├── config.ts             # GRAPHQL_URL = '/query' (same-origin через Caddy)
│   │   └── ui/
│   │       ├── AdminLayout.vue   # левое меню + top-bar
│   │       ├── DataTable.vue     # обёртка над el-table с CRUD-кнопками
│   │       └── FormDrawer.vue    # el-drawer с el-form для редактирования
│   ├── features/
│   │   ├── auth/Login.vue
│   │   ├── teams/TeamsList.vue
│   │   ├── teams/TeamEditor.vue
│   │   ├── coaches/...
│   │   ├── tournaments/TournamentsList.vue
│   │   ├── tournaments/TournamentEditor.vue     # + матчи, standings, drag-and-drop
│   │   ├── players/...
│   │   ├── gallery/AlbumsList.vue               # + vuedraggable для порядка альбомов
│   │   ├── contacts/ContactEditor.vue
│   │   ├── page-content/PageContentEditor.vue   # главная: hero/stats/features/programs/steps
│   │   │                                         # vuedraggable внутри каждой группы
│   │   ├── reviews/ReviewsList.vue
│   │   ├── leads/LeadsList.vue
│   │   └── audit/AuditLog.vue
│   └── stores/
│       └── auth.ts               # Pinia: token + login/logout
└── dist/                         # npm run build → сюда, Caddy отдаёт статикой
```

### 4.1 Ключевые элементы UI

- **PageContentEditor** — главный экран. Карточки по группам (Hero / Stats / Features / Programs / Steps). Внутри каждой группы — `vuedraggable` (Sortable.js под капотом) для reorder. Save → мутация `updatePageContent` + `reorderStats/Features/Programs/Steps`.
- **TournamentEditor** — форма + вложенные списки Teams / Matches / Standings. Каждый reorder через отдельную мутацию.
- **AlbumsList** — drag-and-drop порядка альбомов (cover выбирается в редакторе альбома).
- **TeamsList** — drag-and-drop порядка команд.
- **Login** — простая форма `password → submit → adminLogin`. Token сохраняем в `localStorage` + `document.cookie` (для Apollo link).
- **Logout** — чистим cookie/localStorage, редирект на `/login`.

### 4.2 Apollo authLink

```ts
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    'X-Admin-Token': localStorage.getItem('admin_token') ?? '',
  },
}))
```

Тот же token ставим в `document.cookie` при логине — чтобы Caddy и любые server-side проверки видели его. Но `Apollo` сам шлёт через header — основной канал.

---

## 5. Caddy — дополнение

Создаём `/etc/caddy/addons/flowise-admin.conf`:

```caddy
# Админка flowise.dinamchiki.ru
n4j.dinamchiki.ru {
    encode gzip
    basicauth {
        dev $2a$14$...   # тот же хеш, что у flowise.dinamchiki.ru
    }

    handle /assets/* {
        root * /srv/dynamost-admin
        file_server
    }

    handle {
        root * /srv/dynamost-admin
        try_files {path} /index.html
        file_server

        @html path *.html /
        header @html Cache-Control "no-cache, no-store, must-revalidate"

        @static path *.js *.css *.png *.jpg *.jpeg *.gif *.svg *.woff *.woff2 *.ttf *.eot *.ico *.webp
        header @static Cache-Control "public, max-age=31536000, immutable"
    }
}
```

В `Caddyfile` добавить `import addons/n4j-admin.conf` (имя файла ниже).

Деплой: тот же паттерн, что у `dinamchiki-front`:
1. `npm run build` → `dist/`.
2. SCP на `/srv/dynamost-admin/`.
3. Caddy отдаёт статикой с SPA fallback.

Файл addon'а — `/etc/caddy/addons/n4j-admin.conf`.

Бэк GraphQL **не трогаем** — он уже живёт на `apigql.dinamchiki.ru`, админка бьёт туда же (same-origin или cross-origin с `apigql.dinamchiki.ru` в CORS-whitelist).

---

## 6. Деплой и CI/CD

**Репо:** `Horoshiy/dinamchiki-backend-newest` (новый). Если ты хочешь в монорепо с `dinamchiki-gql` — скажи.

**GitHub Actions workflow** (по аналогии с `dinamchiki-front`):

```yaml
name: CI/CD
on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22" }
      - run: cd backend && npm ci
      - run: cd backend && npm run type-check
      - run: cd backend && npm test -- --reporter=verbose || true
      - uses: appleboy/scp-action@...
        with: { source: "backend", target: "/home/clawd/dinamchiki-gql-new" }
      - uses: appleboy/ssh-action@...
        script: |
          sudo systemctl stop dinamchiki-gql || true
          rm -rf /home/clawd/dinamchiki-gql.bak
          mv /home/clawd/dinamchiki-gql /home/clawd/dinamchiki-gql.bak
          mv /home/clawd/dinamchiki-gql-new /home/clawd/dinamchiki-gql
          sudo systemctl start dinamchiki-gql
          sleep 3
          curl -fsS http://127.0.0.1:8175/healthz | grep '"status":"ok"'

  admin-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22" }
      - run: cd admin-frontend && npm ci
      - run: cd admin-frontend && npm run build
      - uses: appleboy/scp-action@...
        with: { source: "admin-frontend/dist/*", strip_components: 1, target: "/srv/dynamost-admin" }
      - uses: appleboy/ssh-action@...
        script: |
          sudo systemctl reload caddy || sudo systemctl restart caddy
          sleep 2
          curl -fsSI https://n4j.dinamchiki.ru/ | head -1
```

**Деплой — только по твоей команде.** В GH-воркфлоу я буду делать `git push` после твоего «го».

---

## 7. Порядок внедрения

| # | Шаг | Готово когда |
|---|---|---|
| 1 | **Repository layer** в `dinamchiki-gql` (`content.json` + `audit.ts` + `session.ts`) | Тесты зелёные, `data.ts` читает из `content.json` если есть |
| 2 | **Расширение schema** + admin-резолверы (CRUD + reorder) | `npm test` зелёный, e2e через `graphql-request` |
| 3 | **HMAC + middleware защиты admin-мутаций** | Без токена admin-мутации падают, с токеном — проходят |
| 4 | **Audit log + leads admin query** | `auditLog` отдаёт записи, `leadsAdmin` отдаёт заявки |
| 5 | **Деплой backend на прод** (после твоего «го») | `apigql.dinamchiki.ru/healthz` ok, новые мутации доступны |
| 6 | **Каркас админки** (Vite + Vue + Apollo + Element Plus + Pinia + Router) | `npm run dev` показывает страницу логина |
| 7 | **Login + Apollo authLink + auth store** | Логин по паролю работает, токен сохраняется, `adminPing` проходит |
| 8 | **AdminLayout + DataTable + FormDrawer (общие компоненты)** | `/dashboard` показывает пустые таблицы для каждой сущности |
| 9 | **CRUD-страницы** (Teams / Coaches / Players / Albums / Venues / Contacts / Reviews) | Можно создать/редактировать/удалить через UI |
| 10 | **TournamentEditor** (с матчами, standings, drag-and-drop) | Можно редактировать турниры целиком |
| 11 | **PageContentEditor** (hero + stats/features/programs/steps с vuedraggable) | Главная редактируется из админки |
| 12 | **LeadsList + AuditLog** | Видны заявки и история правок |
| 13 | **Caddy + деплой админки на прод** (после «го») | `n4j.dinamchiki.ru` открывается, BasicAuth + логин |
| 14 | **E2E прогон**: правим главную через админку → публичный фронт видит изменения | Smoke test |

**Между 5 и 13 — твоё «го» перед каждым деплоем.**

---

## 8. Что НЕ делаем (out of scope)

- Миграция с SQLite на Postgres — пока не нужно. Когда появится (вероятно, при росте) — Repository layer абстрагирует, миграция будет точечной.
- Мульти-роли (admin / editor / viewer) — один редактор, простой пароль.
- Реалтайм-синхронизация (graphql-ws subscriptions) — публичный фронт на Apollo polling / cache, этого хватает.
- i18n — пока ru-only.
- Загрузка картинок через админку — `GalleryPhoto.url` хранится как URL, файлы грузим по FTP/SFTP отдельно (как сейчас).
- TipTap WYSIWYG для произвольных страниц — пока нет такой сущности; если понадобится — отдельный блок в PageContent.
- Версионирование правок с откатом — audit log хранит все мутации, восстановление через `git revert` для `content.json`.

---

## 9. Открытые вопросы (нужны до старта)

1. ✅ Репозиторий: `Horoshiy/dinamchiki-backend-newest` (отдельный).
2. ✅ Caddy addon `n4j.dinamchiki.ru` (домен свободен, ACME получит сертификат автоматически).
3. **`ADMIN_PASSWORD`** — где брать? Я предлагаю в `.env` `dinamchiki-gql`, в репо не коммитим, на проде — через systemd EnvironmentFile.
4. **Когда стартовать?** Готов начать с шага 1 (Repository layer) — это правки только в `dinamchiki-gql`. Пуш в main не делаю, скажи «го» — сделаю PR / merge.

Жду ответы и/или «го» — после этого начинаю.
