# ДФК «Динамчики» — сайт детского футбольного клуба

Vue 3 + TypeScript + Vite + GraphQL (Apollo) + SCSS.

## Окружения

| Окружение | Фронтенд | GraphQL | Статус |
|---|---|---|---|
| **Бета** (текущее) | `flowise.dinamchiki.ru` | `apigql.dinamchiki.ru/query` | работает, закрыта от индексации |
| **Прод** (позже, через CI/CD) | боевой домен | боевой домен API | имена будут назначены при раскатке |

Бета работает на реальных данных и **принимает заявки** — они сохраняются
в SQLite на сервере (`../dinamchiki-gql`, systemd-юнит `dinamchiki-gql`).

Имена бета-хостов нигде не захардкожены: фронтенд берёт их из env,
бэкенд — из `CORS_ORIGINS`. Смена домена на проде — это правка конфигурации,
а не кода (см. «Переход на прод»).

## Стек

- **Frontend**: Vue 3, TypeScript, Vue Router, Pinia, Vue Apollo (`@vue/apollo-composable`), SCSS
- **Build**: Vite 5
- **Backend**: GraphQL Yoga на `apigql.dinamchiki.ru` — контракт описан в `src/shared/api/graphql/queries.ts`, реализация в `../dinamchiki-gql`

## Структура проекта

```
src/
├── app/                  # bootstrap: конфиг, Apollo-провайдер, глобальные стили
│   ├── config/           # app.config.ts — единственная точка доступа к env
│   ├── providers/        # apollo.ts, apollo-provider.ts
│   └── styles/           # variables.scss (дизайн-токены), global.scss
├── router/index.ts       # роуты + SEO-мета + scrollBehavior с ожиданием якоря
├── pages/                # страницы (1-в-1 с роутами)
├── widgets/              # блоки по доменам: home, team, coach, tournament, player, gallery, contact
├── entities/             # бизнес-сущности: типы + моки
│   ├── team/ coach/ tournament/ player/ gallery/ contact/
│   └── content/          # PageContent + Review — контент главной страницы
└── shared/
    ├── api/
    │   ├── graphql/queries.ts   # фрагменты, запросы, мутация
    │   ├── composables.ts       # useXxxQuery — единственный источник данных для страниц
    │   └── config.ts            # USE_MOCKS_ONLY, GRAPHQL_TIMEOUT_MS
    ├── config/club.ts           # контакты клуба — единый источник правды
    ├── lib/date.ts              # форматирование дат
    └── ui/                      # base/ (BaseButton, UiCard, …), icons/, layout/
```

Правило: **страницы и виджеты не импортируют моки напрямую** — только
composables из `shared/api`. Так переключение на реальный бэкенд не требует
правок в UI.

## Команды

```bash
npm install

npm run dev         # dev-сервер, порт 5173
npm run build       # vue-tsc --noEmit && vite build
npm run build:static  # build + пререндер страниц в готовый HTML (так собирать бету и прод)
npm run preview     # превью прод-сборки, порт 4173
npm run type-check  # только типы
npm run lint        # eslint (flat config, eslint.config.js)
npm run lint:fix

npm run test           # vitest: unit + интеграционные (300 тестов)
npm run test:watch
npm run test:coverage  # отчёт в coverage/
npm run e2e            # дымовой прогон в реальном браузере
npm run verify         # lint + type-check + test + build
```

## Тесты

```
tests/
├── setup.ts            # общая настройка среды (happy-dom + Apollo)
├── graphql-harness.ts  # тестовый Apollo поверх НАСТОЯЩЕЙ схемы бэкенда
├── unit/               # чистая логика и отдельные компоненты
│   ├── date.test.ts                 форматирование дат
│   ├── lead-validation.test.ts      валидация формы заявки
│   ├── club-config.test.ts          единый источник контактов
│   ├── icon-registry.test.ts        маппинг iconKey → компонент
│   ├── mocks-integrity.test.ts      ссылочная целостность моков
│   ├── seo-plugin.test.ts           генерация robots.txt и sitemap.xml
│   ├── apollo-provider.test.ts      таймаут GraphQL-запроса
│   ├── BaseButton.test.ts           варианты, состояния, href у ссылок
│   ├── base-components.test.ts      FilterChips, Breadcrumbs, StatCard, UiCard…
│   └── LightboxModal.test.ts        клавиатура, focus-trap, блокировка скролла
├── integration/        # слой данных + компоненты + роутер вместе
│   ├── composables.test.ts          контракт слоя данных, честность мутации
│   ├── forms.test.ts                обе формы не имитируют отправку
│   ├── home-widgets.test.ts         главная рендерится из данных
│   ├── pages.test.ts                детальные страницы, составы, галерея тренера
│   ├── list-pages.test.ts           списки и фильтры
│   ├── header.test.ts               меню, подсветка раздела, бургер
│   ├── layouts.test.ts              layout, состав главной, 404
│   └── router-seo.test.ts           маршруты, мета-теги, прокрутка к якорю
└── e2e/smoke.cjs       # реальный браузер: 11 маршрутов × 3 разрешения
```

Тесты ходят через Apollo — тем же путём, что и прод. Транспорт — in-process
схема из `../dinamchiki-gql/src/schema.graphql`, поэтому сеть не нужна,
а контракт проверяется настоящий: запрос, не соответствующий схеме бэкенда,
валит тест.
E2E-прогон работает против собранного приложения и требует playwright
(`npm i -D playwright && npx playwright install chromium`); по умолчанию
целится в `http://127.0.0.1:4173`, домен переопределяется через `BASE_URL`.

Часть тестов — регрессионные, на уже исправленные дефекты: они помечены
комментарием с описанием исходного бага, чтобы правка не откатилась молча.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `VITE_GRAPHQL_HTTP` / `VITE_GRAPHQL_WS` | адрес GraphQL |
| `VITE_APP_TITLE` | заголовок по умолчанию |
| `VITE_SITE_URL` | канонический адрес сборки — из него строятся `canonical`, `og:url` и `sitemap.xml` |
| `VITE_ALLOW_INDEXING` | `true` разрешает индексацию. **На стенде обязательно `false`** |
| `VITE_CLUB_PHONE` | телефон для JSON-LD; должен совпадать с `src/shared/config/club.ts` |
| `VITE_YM_ID` | номер счётчика Яндекс.Метрики (31195281). **На стенде не задавать** |

Шаблоны: `.env.example` (бета) и `.env.production.example` (прод).

`robots.txt` и `sitemap.xml` **генерируются при сборке** плагином
`vite-plugins/seo.ts` из этих переменных. Статических копий в `public/` нет —
раньше они были захардкожены на чужой домен и открывали стенд для индексации.

## Режим данных

`src/shared/api/config.ts`:

```ts
export const USE_MOCKS_ONLY = false   // текущее значение — идём в бэкенд
```

При недоступности бэкенда фронт автоматически падает на локальные моки и
ставит `window.__gqlFellBack = true` — по этому флагу e2e отличает
«данные с бэкенда» от «бэкенд лёг, показываем запасные». Визуально это
неразличимо, а разница принципиальная.

`USE_MOCKS_ONLY = true` имеет смысл только для работы без сети.

Новый домен бэкенда меняется через `VITE_GRAPHQL_HTTP` / `VITE_GRAPHQL_WS`
и **должен быть добавлен в белый список CORS** на бэкенде (`CORS_ORIGINS`).

## Контакты клуба

Телефон, Telegram, WhatsApp и email лежат в `src/shared/config/club.ts`
и используются в шапке, подвале, форме и блоке прямых контактов.
Флаг `IS_DEMO_CONTACTS` помечает, что значения ещё демонстрационные.
JSON-LD в `index.html` берёт телефон из `VITE_CLUB_PHONE` — держать в
соответствии с `club.ts`.

## Пререндер

Яндекс плохо исполняет JavaScript: у SPA он видит пустой `<div id="app">`.
Поэтому бета и прод собираются `npm run build:static`: после сборки
`scripts/prerender.mjs` открывает каждую страницу в headless Chrome и
сохраняет готовый HTML — `dist/<путь>/index.html`, `dist/404.html` и
исходную оболочку `dist/spa.html` для страниц вне пререндера (игроки,
турниры, новые группы). Список страниц — `vite-plugins/static-routes.json`
плюс группы с расписанием и тренеры из API; они же дописываются в `sitemap.xml`.

- Страницы открываются на домене `VITE_SITE_URL` (локальный HTTPS-сервер
  и `--host-resolver-rules`), иначе API отказывает по CORS и сайт тихо
  показывает моки. Снимок с моками или со скелетоном скрипт бракует.
- Данные в HTML — на момент сборки. Расписание из CRM меняется раз в час,
  поэтому после заметных изменений сайт надо пересобрать; Vue в браузере
  всё равно подтягивает свежие данные.
- Нужны Chrome (`CHROME_BIN` или chrome-headless-shell из кэша Playwright)
  и `openssl`. В Docker-образе их нет — там собирается обычная SPA.

## Деплой

```bash
npm run build:static && sudo rsync -a --delete dist/ /srv/dynamost-flowise/
```

Бета обслуживается **Caddy** (`/etc/caddy/addons/flowise.conf`), статикой из
собранного `dist/` в `/srv/dynamost-flowise`. Эталонный vhost —
`docker/Caddyfile.example`: заголовки безопасности, иммутабельный кеш для
`/assets/*`, `X-Robots-Tag` для беты и **честный 404** на неизвестных
маршрутах вместо SPA-fallback с кодом 200.

Проверка конфига:

```bash
caddy validate --config docker/Caddyfile.example --adapter caddyfile
```

Альтернативная схема — контейнер с nginx (`docker-compose.yml`, `Dockerfile`,
`docker/nginx.conf`, порт 8277). На бете **не используется**; оставлена как
рабочий запасной вариант и как основа для контейнерной раскатки в CI/CD.

### Переход на прод

Кода это не касается — только конфигурации. Чеклист:

1. **Фронтенд** — `.env.production` из `.env.production.example`:
   `VITE_SITE_URL` (боевой домен), `VITE_ALLOW_INDEXING=true`,
   `VITE_GRAPHQL_HTTP` / `VITE_GRAPHQL_WS` (боевой API),
   `VITE_CLUB_PHONE` (реальный телефон).
   Из этих значений собираются `canonical`, `og:url`, `robots.txt`
   и `sitemap.xml` — статических копий нет.
2. **Бэкенд** — добавить боевой домен фронтенда в `CORS_ORIGINS`
   (переменная окружения systemd-юнита). Без этого браузер заблокирует
   запросы с нового домена.
3. **Веб-сервер** — dinamchiki.ru на проде обслуживает nginx: готовый vhost
   `docker/nginx.dinamchiki.ru.conf` (пререндер, честный 404, 301 со старых
   адресов прежнего сайта, блоки `/vkid/` и `/uploads/` из действующего
   конфига). До переезда решить судьбу `/nasledie/<slug>` — эти страницы
   есть только на прежнем сайте.
4. **Сборка** — `npm run build:static`, не `npm run build`.
5. **Контакты** — заменить демо-значения в `src/shared/config/club.ts`
   и снять `IS_DEMO_CONTACTS`.
6. **Проверка** — `npm run verify`, затем
   `BASE_URL=https://<боевой-домен> npm run e2e`.

## Что осталось сделать

- Заменить демо-контакты реальными и снять `IS_DEMO_CONTACTS`
- Реальные фотографии вместо SVG-плейсхолдеров (hero, команды, тренеры, игроки, галерея)
- Настоящая карта Яндекс.Карт в `MapEmbed.vue` вместо декоративной заглушки
- Фирменная монограмма «Динамо» вместо упрощённого щита в `LogoMark.vue`
- Подключить `npm run verify` и `npm run e2e` в CI
