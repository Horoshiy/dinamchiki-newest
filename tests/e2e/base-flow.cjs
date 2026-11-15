/**
 * E2E «Тайной базы»: сквозной прогон вход → миссия → награда → досье и штаб тренера.
 *
 * Раздел закрыт от посторонних, поэтому прогон идёт против собранной SPA с
 * подменённым API (фикстуры зеркалят docs/api/base.yaml). Так проверяется реальная
 * вёрстка и взаимодействия всех экранов без боевых кодов и без записи в базу.
 *
 *   npm run build:beta            # или любая сборка в /srv/dynamost-flowise
 *   node tests/e2e/base-flow.cjs
 *
 * BASE_DIST — каталог сборки (по умолчанию /srv/dynamost-flowise), PORT — 8199.
 * Скриншоты складываются в tests/e2e/__screens__/base.
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const DIST = process.env.BASE_DIST || '/srv/dynamost-flowise'
const PORT = Number(process.env.PORT || 8199)
const ORIGIN = `http://127.0.0.1:${PORT}`
const SHOTS = path.join(__dirname, '__screens__', 'base')
fs.mkdirSync(SHOTS, { recursive: true })

// ─── Статический сервер собранной SPA ──────────────────────────────────────────
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon' }
const server = http.createServer((req, res) => {
  const u = new URL(req.url, ORIGIN)
  let p = decodeURIComponent(u.pathname)
  if (p === '/agent-base' || p.startsWith('/agent-base/')) p = '/spa.html'
  const file = path.join(DIST, p)
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end() }
  fs.readFile(file, (err, buf) => {
    if (err) {
      // Несуществующая статика (favicon и т.п.) — тихий 404, без шума в консоли.
      res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found')
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
    res.end(buf)
  })
})

// ─── Фикстуры API (зеркало base.types.ts) ──────────────────────────────────────
const SLOGAN = 'СТАРайся • ПОДДЕРЖИВАЙ • ИГРАЙ ЧЕСТНО'
const QUESTIONS = [
  { id: 1, template_key: 'mood', kind: 'scale', text: 'Как твой настрой сегодня?', options: ['Очень плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично'], is_required: true, max_len: 0, position: 1 },
  { id: 2, template_key: 'energy', kind: 'scale', text: 'Сколько у тебя энергии?', options: ['Пусто', 'Мало', 'Средне', 'Много', 'Полный заряд'], is_required: true, max_len: 0, position: 2 },
  { id: 3, template_key: 'pain', kind: 'scale', text: 'Что-нибудь болит после тренировки?', options: ['Ничего', 'Чуть-чуть', 'Заметно', 'Сильно', 'Очень сильно'], is_required: true, max_len: 0, position: 3 },
  { id: 4, template_key: 'goal', kind: 'single', text: 'Какая цель на сегодня?', options: ['Быстрее бегать', 'Точнее пасовать', 'Поддерживать команду', 'Играть честно'], is_required: true, max_len: 0, position: 4 },
  { id: 5, template_key: 'dream', kind: 'text', text: 'О чём ты мечтаешь в футболе?', options: [], is_required: false, max_len: 200, position: 5 },
]
const BADGES = [
  { key: 'first_mission', title: 'Первый выход', description: 'Первая миссия выполнена', icon: '🚀', threshold: 1, earned: true },
  { key: 'streak_3', title: 'Серия 3 дня', description: '3 дня подряд', icon: '🔥', threshold: 3, earned: true },
  { key: 'streak_7', title: 'Неделя силы', description: '7 дней подряд', icon: '⚡', threshold: 7, earned: true },
  { key: 'streak_14', title: 'Две недели', description: '14 дней подряд', icon: '🛡️', threshold: 14, earned: false },
  { key: 'streak_30', title: 'Месяц агента', description: '30 дней подряд', icon: '🏆', threshold: 30, earned: false },
  { key: 'xp_100', title: '100 XP', description: 'Набрано 100 XP', icon: '💯', threshold: 100, earned: true },
  { key: 'xp_500', title: '500 XP', description: 'Набрано 500 XP', icon: '🌟', threshold: 500, earned: false },
  { key: 'honest', title: 'Честная игра', description: 'Честно ответил о самочувствии', icon: '🤝', threshold: 1, earned: false },
]
const LADDER = [
  { title: 'Новичок', min_xp: 0, reached: true, current: false },
  { title: 'Разведчик', min_xp: 50, reached: true, current: true },
  { title: 'Агент', min_xp: 150, reached: false, current: false },
  { title: 'Спецагент', min_xp: 300, reached: false, current: false },
  { title: 'Легенда базы', min_xp: 600, reached: false, current: false },
]
const MOTIVATION = 'Каждая тренировка делает тебя сильнее. Сегодня ты на шаг ближе к голу мечты — не сдавайся!'
const JOKE = 'Почему мяч не ходит в школу? Потому что его и так пинают каждый день!'
const QR_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function calendar() {
  const out = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.UTC(2026, 10, 15 - i))
    out.push({ day_key: d.toISOString().slice(0, 10), completed: i !== 2 && i !== 9 })
  }
  return out
}
function me(state) {
  return {
    child_id: 101, codename: state.codename, rank: 'Разведчик', xp: state.submitted ? 120 : 105,
    streak_current: state.submitted ? 4 : 3, streak_best: 7, completed_today: state.submitted,
    needs_attention_today: state.attention, sound_on: true,
    rank_progress: { current: 'Разведчик', next_title: 'Агент', next_min_xp: 150, to_next: state.submitted ? 30 : 45, maxed: false },
    badges: BADGES, slogan: SLOGAN,
  }
}
function mission(state) {
  return {
    mission_id: 900, day_key: '2026-11-15', weekday: 0, theme: 'День энергии', slogan: SLOGAN,
    questions: QUESTIONS, completed: state.submitted, draft: [],
    reward: state.submitted ? { motivation: MOTIVATION, joke: JOKE, xp_granted: 15, needs_attention: state.attention, attention_message: state.attention ? 'Расскажи тренеру и родителям, что болит — вместе разберёмся.' : undefined } : undefined,
  }
}
const CHILDREN = [
  { child_id: 101, full_name: 'Артём Соколов', codename: 'Сокол', rank: 'Разведчик', xp: 120, streak_current: 4, completed_today: true, needs_attention_today: false, has_code: true, last_mission_date: '2026-11-15' },
  { child_id: 102, full_name: 'Максим Орлов', codename: 'Орёл', rank: 'Агент', xp: 210, streak_current: 9, completed_today: true, needs_attention_today: true, has_code: true, last_mission_date: '2026-11-15' },
  { child_id: 103, full_name: 'Иван Волков', codename: 'Волк', rank: 'Новичок', xp: 25, streak_current: 1, completed_today: false, needs_attention_today: false, has_code: true, last_mission_date: '2026-11-13' },
  { child_id: 104, full_name: 'Денис Медведев', codename: 'Медведь', rank: 'Разведчик', xp: 80, streak_current: 2, completed_today: false, needs_attention_today: false, has_code: false, last_mission_date: '' },
  { child_id: 105, full_name: 'Кирилл Зайцев', codename: 'Заяц', rank: 'Спецагент', xp: 340, streak_current: 14, completed_today: true, needs_attention_today: false, has_code: true, last_mission_date: '2026-11-15' },
  { child_id: 106, full_name: 'Егор Лисов', codename: 'Лис', rank: 'Новичок', xp: 10, streak_current: 0, completed_today: false, needs_attention_today: false, has_code: false, last_mission_date: '' },
]
function childDetail(id) {
  const c = CHILDREN.find((x) => x.child_id === id) || CHILDREN[0]
  const answers = QUESTIONS.map((q) => ({ template_key: q.template_key, text: q.text, kind: q.kind, value_int: q.kind === 'scale' ? 4 : 0, value_text: q.kind === 'text' ? 'Забить гол в девятку' : q.kind === 'single' ? 'Играть честно' : '', values: [] }))
  return {
    child_id: c.child_id, full_name: c.full_name, codename: c.codename, rank: c.rank, xp: c.xp,
    streak_current: c.streak_current, streak_best: Math.max(c.streak_current, 7), has_code: c.has_code, badges: BADGES,
    submissions: [
      { day_key: '2026-11-15', mood: 4, energy: 4, pain_score: c.needs_attention_today ? 4 : 1, xp_granted: 15, needs_attention: c.needs_attention_today, completed_at: '2026-11-15T08:30:00Z', answers },
      { day_key: '2026-11-14', mood: 5, energy: 3, pain_score: 1, xp_granted: 15, needs_attention: false, completed_at: '2026-11-14T08:10:00Z', answers },
    ],
    notes: [{ id: 1, text: 'Хорошо работает над пасом. Поддержать на тренировке.', created_at: '2026-11-14T17:00:00Z' }],
  }
}
function aggregate(id) {
  if (id === 999) return { team_id: id, insufficient: true, message: 'Мало данных: ответили меньше 3 агентов — среднее выдавало бы конкретного ребёнка.', children_count: 2, responded_count: 1, days: 14, avg_mood: 0, avg_energy: 0, avg_pain: 0, attention_count: 0, daily: [] }
  const daily = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.UTC(2026, 10, 15 - i))
    daily.push({ day_key: d.toISOString().slice(0, 10), avg_mood: 3.6 + (i % 3) * 0.3, avg_energy: 3.4 + (i % 2) * 0.4, avg_pain: 1.2, completed: 4 + (i % 3) })
  }
  return { team_id: id, insufficient: false, children_count: 6, responded_count: 5, days: 14, avg_mood: 3.9, avg_energy: 3.6, avg_pain: 1.3, attention_count: 1, daily }
}

/** Маршрутизатор фикстур. state — состояние конкретной вкладки. */
function handleBase(method, pathname, body, state) {
  const p = pathname.replace(/^\/api\/base\/?/, '')
  const ok = (json) => ({ status: 200, json })
  if (p === 'auth/login' && method === 'POST') {
    const code = String(body?.code || '').replace(/[^A-Z0-9]/gi, '').toUpperCase()
    if (code === 'AAAAAAAAAA') return { status: 401, json: { success: false, error: 'Код не подошёл. Проверь и попробуй снова.' } }
    return ok({ success: true, token: 'child-jwt-token', child_id: 101, codename: state.codename, rank: 'Разведчик' })
  }
  if (p === 'me' && method === 'GET') return ok(me(state))
  if (p === 'me' && method === 'PUT') { if (body?.codename) state.codename = body.codename; return ok(me(state)) }
  if (p === 'mission/today' && method === 'GET') return ok(mission(state))
  if (p === 'mission/today/draft' && method === 'PUT') return ok({ success: true })
  if (p === 'mission/today/answers' && method === 'POST') {
    const pain = (body?.answers || []).find((a) => a.question_id === 3)?.value_int || 0
    state.submitted = true; state.attention = pain >= 3
    return ok({
      already: false, xp_granted: 15, total_xp: 120, streak: 4, streak_best: 7, rank: 'Разведчик',
      new_badges: [BADGES[2]], needs_attention: state.attention, motivation: MOTIVATION, joke: JOKE,
      attention_message: state.attention ? 'Расскажи тренеру и родителям, что болит — вместе разберёмся.' : undefined,
    })
  }
  if (p === 'progress' && method === 'GET') return ok({ xp: state.submitted ? 120 : 105, rank: 'Разведчик', streak_current: state.submitted ? 4 : 3, streak_best: 7, missions_total: 12, rank_ladder: LADDER, badges: BADGES, calendar: calendar() })
  if (p.startsWith('history')) return ok({ success: true, items: [], total: 0, limit: 30, offset: 0 })
  // ─── Тренер ───
  if (p === 'staff/auth/request-code' && method === 'POST') return ok({ success: true })
  if (p === 'staff/auth/verify' && method === 'POST') return ok({ success: true, token: 'staff-jwt-token', user_id: 13, role: 'coach', name: 'Роман Мануйло' })
  if (p.startsWith('staff/overview')) return ok({ success: true, items: CHILDREN, total: CHILDREN.length, limit: 200, offset: 0 })
  if (p.startsWith('staff/attention')) return ok({ success: true, items: [{ child_id: 102, full_name: 'Максим Орлов', day_key: '2026-11-15', pain_score: 4, completed_at: '2026-11-15T08:30:00Z' }], total: 1, limit: 100, offset: 0 })
  const teamM = /^staff\/teams\/(\d+)\/aggregate$/.exec(p)
  if (teamM) return ok(aggregate(Number(teamM[1])))
  const childM = /^staff\/children\/(\d+)(\/code|\/note)?$/.exec(p)
  if (childM) {
    const id = Number(childM[1]); const sub = childM[2]
    if (!sub && method === 'GET') return ok(childDetail(id))
    if (sub === '/code' && method === 'GET') return ok(state.codeExists ? { exists: true, hint: 'ABCD-…-JK', created_at: '2026-11-10T10:00:00Z', last_used_at: '2026-11-15T08:25:00Z', locked: false } : { exists: false, locked: false })
    if (sub === '/code' && method === 'POST') { state.codeExists = true; return ok({ success: true, child_id: id, code: 'ABCD-EFGH-JK', hint: 'ABCD-…-JK', login_url: 'https://dinamchiki.ru/agent-base#code=ABCD-EFGH-JK', qr_png: QR_PNG }) }
    if (sub === '/code' && method === 'DELETE') { state.codeExists = false; return ok({ success: true }) }
    if (sub === '/note' && method === 'POST') return ok({ id: Date.now(), text: body?.text || '', created_at: new Date().toISOString() })
  }
  return { status: 404, json: { error: 'Не найдено.' } }
}

// ─── Детекторы вёрстки (из smoke.cjs) ──────────────────────────────────────────
async function findOverlaps(page) {
  return page.evaluate(() => {
    const clippedByAncestor = (el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return true
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const st = getComputedStyle(p)
        if (st.overflow === 'visible' && st.overflowX === 'visible' && st.overflowY === 'visible') continue
        const pr = p.getBoundingClientRect()
        const vw = Math.min(r.right, pr.right) - Math.max(r.left, pr.left)
        const vh = Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top)
        if (vw <= 1 || vh <= 1) return true
      }
      return false
    }
    const nodes = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, a, button, li, span')).filter((el) => {
      const st = getComputedStyle(el)
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false
      if (st.pointerEvents === 'none') return false
      if (el.getAttribute('aria-hidden') === 'true' || el.closest('[aria-hidden="true"]')) return false
      if (el.closest('.reward__confetti, .ab-bg, .mission__actions, .login__radar')) return false
      const r = el.getBoundingClientRect()
      if (r.width < 8 || r.height < 8) return false
      if (clippedByAncestor(el)) return false
      return (el.textContent || '').trim().length > 0
    })
    const label = (el) => `${el.tagName.toLowerCase()} «${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26)}»`
    const out = []
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]
      if (a.contains(b) || b.contains(a)) continue
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect()
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
      if (w > 2 && h > 2 && w * h >= 300) { out.push(`${label(a)} × ${label(b)}`); if (out.length >= 4) return out }
    }
    return out
  })
}
async function findClipped(page) {
  return page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('h1, h2, h3, p, a, button, li')) {
      const st = getComputedStyle(el)
      if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') continue
      if (el.getAttribute('aria-hidden') === 'true' || el.closest('[aria-hidden="true"]')) continue
      if (!(el.textContent || '').trim()) continue
      const cv = (st.overflowY === 'hidden' || st.overflow === 'hidden') && el.scrollHeight - el.clientHeight > 4
      const ch = (st.overflowX === 'hidden' || st.overflow === 'hidden') && st.textOverflow !== 'ellipsis' && el.scrollWidth - el.clientWidth > 4
      if (cv || ch) { out.push(`${el.tagName.toLowerCase()} «${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26)}»`); if (out.length >= 4) return out }
    }
    return out
  })
}
async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

function loadPlaywright() {
  try { return require('playwright') } catch { return require('/home/clawd/.nvm/versions/node/v22.22.0/lib/node_modules/playwright') }
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'mobile-320', width: 320, height: 640, isMobile: true },
]

;(async () => {
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r))
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch()
  const problems = []
  let shotN = 0

  async function newPage(vp) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.isMobile, deviceScaleFactor: 1 })
    const state = { submitted: false, attention: false, codename: 'Сокол', codeExists: true }
    const page = await ctx.newPage()
    page.on('pageerror', (e) => problems.push(`[${vp.name}] pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() !== 'error') return
      // Браузер сам пишет в консоль неудачные запросы. 401 здесь — намеренная
      // проверка неверного кода (UI показывает ошибку), 404 — тихая статика.
      if (/Failed to load resource.*status of (401|404)/.test(m.text())) return
      problems.push(`[${vp.name}] console.error: ${m.text()}`)
    })
    await page.route('**/*', (route) => {
      const u = new URL(route.request().url())
      if (u.pathname.startsWith('/api/base/')) {
        let body = null; try { body = route.request().postDataJSON() } catch { /* GET */ }
        const { status, json } = handleBase(route.request().method(), u.pathname, body, state)
        return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) })
      }
      if (u.origin === ORIGIN) return route.continue()
      // Внешние ресурсы (Метрика, GraphQL) не нужны разделу — тихая заглушка.
      return route.fulfill({ status: 200, contentType: u.pathname.endsWith('.js') ? 'application/javascript' : 'text/plain', body: '' })
    })
    return { ctx, page, state }
  }
  async function check(page, vp, label) {
    await page.waitForTimeout(650) // дать entrance-анимациям (ab-rise 560ms) завершиться
    const ov = await overflow(page)
    if (ov > 1) problems.push(`[${vp.name}] ${label}: горизонтальное переполнение +${ov}px`)
    for (const o of await findOverlaps(page)) problems.push(`[${vp.name}] ${label}: наложение — ${o}`)
    for (const c of await findClipped(page)) problems.push(`[${vp.name}] ${label}: обрезано — ${c}`)
  }
  async function shot(page, vp, name) {
    if (vp.name === 'mobile-320') return
    await page.screenshot({ path: path.join(SHOTS, `${String(++shotN).padStart(2, '0')}-${vp.name}-${name}.png`), fullPage: true })
  }
  const clickBtn = (page, text) => page.getByRole('button', { name: text, exact: false }).first().click()

  async function childFlow(vp, painIndex) {
    const { ctx, page } = await newPage(vp)
    const tag = painIndex >= 2 ? 'attention' : 'reward'
    await page.goto(ORIGIN + '/agent-base', { waitUntil: 'networkidle' })
    await page.waitForSelector('.login__title')
    await check(page, vp, 'login'); await shot(page, vp, 'login')
    // Ошибка входа
    await page.fill('#agent-code', 'AAAAAAAAAA')
    await clickBtn(page, 'Войти в базу')
    await page.waitForSelector('.ab-alert--error')
    await check(page, vp, 'login-error')
    // Успешный вход
    await page.fill('#agent-code', 'ABCDEFGHJK')
    await clickBtn(page, 'Войти в базу')
    await page.waitForSelector('.mission__q-text')
    await shot(page, vp, 'mission-mood')
    // q1 настрой
    await check(page, vp, 'mission-mood')
    await page.locator('.mood__opt').nth(3).click()
    await clickBtn(page, 'Дальше')
    // q2 энергия
    await page.waitForSelector('.energy__battery')
    await check(page, vp, 'mission-energy')
    await page.locator('.energy__seg').nth(3).click()
    await clickBtn(page, 'Дальше')
    // q3 боль
    await page.waitForSelector('.pain__scale')
    await page.locator('.pain__opt').nth(painIndex).click()
    await check(page, vp, 'mission-pain')
    await shot(page, vp, 'mission-pain')
    await clickBtn(page, 'Дальше')
    // q4 цель
    await page.waitForSelector('.goal')
    await check(page, vp, 'mission-goal')
    await page.locator('.goal__opt').nth(0).click()
    await clickBtn(page, 'Дальше')
    // q5 мечта
    await page.waitForSelector('.dream__area')
    await page.fill('.dream__area', 'Забить гол в девятку и сыграть на большом стадионе')
    await check(page, vp, 'mission-dream')
    await clickBtn(page, 'Завершить миссию')
    if (painIndex >= 2) {
      await page.waitForSelector('.attention__title')
      await check(page, vp, 'attention'); await shot(page, vp, 'attention')
      await clickBtn(page, 'Понятно, я расскажу')
    }
    await page.waitForSelector('.reward__title')
    await page.waitForTimeout(1100) // конфетти + счётчик XP
    await check(page, vp, tag + '-reward'); await shot(page, vp, 'reward')
    await clickBtn(page, 'В моё досье')
    await page.waitForSelector('.progress__codename')
    await check(page, vp, 'progress'); await shot(page, vp, 'progress')
    // Смена позывного
    await page.click('.progress__edit')
    await page.fill('.progress__edit-row input', 'Ястреб')
    await clickBtn(page, 'OK')
    await page.waitForTimeout(200)
    const cn = await page.textContent('.progress__codename')
    if (!/Ястреб/.test(cn || '')) problems.push(`[${vp.name}] позывной не обновился: «${cn}»`)
    // Повторный заход в тот же день: миссия уже выполнена → отчёт без повторного XP и конфетти
    if (painIndex === 1) {
      await page.getByRole('link', { name: 'Миссия', exact: false }).first().click()
      await page.waitForSelector('.reward__title')
      await page.waitForTimeout(300)
      const head = await page.textContent('.reward__title')
      if (!/уже выполнена/.test(head || '')) problems.push(`[${vp.name}] повторный заход: ожидался отчёт «уже выполнена», получено «${head}»`)
      const conf = await page.locator('.reward__confetti span').count()
      if (conf > 0) problems.push(`[${vp.name}] повторный заход: конфетти не должно сыпаться повторно (${conf})`)
      await check(page, vp, 'mission-reopen'); await shot(page, vp, 'mission-reopen')
      await clickBtn(page, 'В моё досье')
      await page.waitForSelector('.progress__codename')
    }
    await ctx.close()
  }

  async function staffFlow(vp) {
    const { ctx, page } = await newPage(vp)
    await page.goto(ORIGIN + '/agent-base/staff', { waitUntil: 'networkidle' })
    await page.waitForSelector('.staff-login__title')
    await check(page, vp, 'staff-login'); await shot(page, vp, 'staff-login')
    await page.fill('#staff-phone', '+7 900 000-00-00')
    await clickBtn(page, 'Получить код')
    await page.waitForSelector('#staff-code')
    await page.fill('#staff-code', '1234')
    await clickBtn(page, 'Войти в штаб')
    await page.waitForSelector('.staff__title')
    await check(page, vp, 'staff-dashboard'); await shot(page, vp, 'staff-dashboard')
    // Поиск + фильтр + сортировка
    await page.fill('.staff__search', 'Орлов')
    await page.waitForTimeout(150)
    let rows = await page.locator('.staff__row:not(.staff__row--head)').count()
    if (rows !== 1) problems.push(`[${vp.name}] поиск «Орлов» дал ${rows} строк, ожидалась 1`)
    await page.fill('.staff__search', '')
    await page.locator('.staff__select').first().selectOption('attention')
    await page.waitForTimeout(150)
    rows = await page.locator('.staff__row:not(.staff__row--head)').count()
    if (rows !== 1) problems.push(`[${vp.name}] фильтр «внимание» дал ${rows} строк, ожидалась 1`)
    await page.locator('.staff__select').first().selectOption('all')
    await page.locator('.staff__select').nth(1).selectOption('xp')
    // Баннер внимания
    await page.click('.staff__attention-head')
    await page.waitForSelector('.staff__attention-list')
    // Сводка по команде
    await page.fill('.staff__agg-form input', '13')
    await clickBtn(page, 'Показать')
    await page.waitForSelector('.staff__agg-stats')
    await check(page, vp, 'staff-aggregate'); await shot(page, vp, 'staff-aggregate')
    // Мало данных
    await page.fill('.staff__agg-form input', '999')
    await clickBtn(page, 'Показать')
    await page.waitForSelector('.ab-alert--info')
    // Карточка ребёнка
    await page.locator('.staff__row:not(.staff__row--head)').first().click()
    await page.waitForSelector('.child__name')
    await check(page, vp, 'staff-child'); await shot(page, vp, 'staff-child')
    // Выдача кода + QR
    await clickBtn(page, 'код')
    await page.waitForSelector('.child__issued-code')
    await check(page, vp, 'staff-child-code'); await shot(page, vp, 'staff-child-code')
    await clickBtn(page, 'Готово')
    // Раскрыть ответы дня
    await page.locator('.child__sub-head').first().click()
    await page.waitForSelector('.child__answers')
    await check(page, vp, 'staff-child-answers')
    // Заметка
    await page.fill('.child__note-form textarea', 'Отметил боль — поговорить с родителями.')
    await clickBtn(page, 'Добавить')
    await page.waitForTimeout(200)
    const notes = await page.locator('.child__note-list li').count()
    if (notes < 2) problems.push(`[${vp.name}] заметка не добавилась (${notes})`)
    await ctx.close()
  }

  async function qrFlow(vp) {
    const { ctx, page } = await newPage(vp)
    // QR-карточка тренера: вход по #code= без ручного ввода кода
    await page.goto(ORIGIN + '/agent-base#code=ABCDEFGHJK', { waitUntil: 'networkidle' })
    await page.waitForSelector('.mission__q-text')
    await check(page, vp, 'qr-login'); await shot(page, vp, 'qr-login')
    await ctx.close()
  }

  for (const vp of VIEWPORTS) {
    await childFlow(vp, 1)        // боль 2 → обычная награда
    await childFlow(vp, 3)        // боль 4 → экран заботы
    await staffFlow(vp)
    await qrFlow(vp)              // вход по QR-ссылке тренера
    console.log(`${vp.name}: прогон завершён`)
  }

  await browser.close()
  server.close()
  if (problems.length) {
    console.error('\nПроблемы:')
    problems.forEach((p) => console.error('  -', p))
    console.error(`\nСкриншоты: ${SHOTS}`)
    process.exit(1)
  }
  console.log(`\nE2E «Тайная база»: замечаний нет. Скриншоты: ${SHOTS}`)
})().catch((e) => { console.error('FATAL:', e.stack || e.message); server.close(); process.exit(1) })