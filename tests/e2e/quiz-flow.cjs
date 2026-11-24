/**
 * E2E квиза «Подтрибунки»: запись → недели → вопросы → итоги → рейтинг.
 *
 * Как и base-flow.cjs, прогон идёт против собранной SPA с подменённым API
 * (фикстуры зеркалят docs/api/base.yaml, раздел quiz) — реальная вёрстка и
 * взаимодействия без боевых кодов и без записи в базу.
 *
 *   npm run build                 # dist/
 *   node tests/e2e/quiz-flow.cjs
 *
 * BASE_DIST — каталог сборки (по умолчанию ./dist), PORT — 8299.
 * Скриншоты: tests/e2e/__screens__/quiz.
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const DIST = process.env.BASE_DIST || path.join(__dirname, '..', '..', 'dist')
const PORT = Number(process.env.PORT || 8299)
const ORIGIN = `http://127.0.0.1:${PORT}`
const SHOTS = path.join(__dirname, '__screens__', 'quiz')
fs.mkdirSync(SHOTS, { recursive: true })

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon' }
const server = http.createServer((req, res) => {
  const u = new URL(req.url, ORIGIN)
  let p = decodeURIComponent(u.pathname)
  if (p === '/podtribunka' || p.startsWith('/podtribunka/')) p = '/index.html'
  const file = path.join(DIST, p)
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end() }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found') }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
    res.end(buf)
  })
})

// ─── Фикстуры квиза (зеркало QuizState и др. из base.types.ts) ────────────────
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const QS = [
  { pos: 0, question_id: 91, text: 'Сколько игроков одной команды на поле?', options: ['9', '11', '13'], has_image: false, total: 3 },
  { pos: 1, question_id: 92, text: 'Какой цвет у карточки удаления?', options: ['Жёлтая', 'Красная', 'Зелёная'], has_image: true, total: 3 },
  { pos: 2, question_id: 93, text: 'Как называется удар через себя?', options: ['Бисиклета', 'Паненка', 'Рабона'], has_image: false, total: 3 },
]
const CORRECT = 1
const EXPLAIN = 'Правильный ответ объясняется коротко и по делу.'
const BOARD = {
  k2: { category: 'k2', title: '7–8 лет', current_week: 9, weeks: 40, season_over: false, total: 23, items: [
    { place: 1, name: 'БУЦЫКИНА Полина', points: 87, is_me: false },
    { place: 2, name: 'СЕНЬКИН Арсений', points: 82.5, is_me: false },
    { place: 3, name: 'Соколов Артём', points: 3, is_me: true },
  ], me: null },
  k3: { category: 'k3', title: '9–11 лет', current_week: 9, weeks: 40, season_over: false, total: 23, items: [
    { place: 1, name: 'БУЦЫКИНА Полина', points: 87, is_me: false },
    { place: 2, name: 'РУДИК Данил', points: 82, is_me: false },
  ], me: { place: 12, name: 'Соколов Артём', points: 3, is_me: true } },
}

function newState(joined) {
  return {
    joined, pos: 0, correct: 0, finished: false, started: false,
    pending: false, conflictOnce: false, points: 3,
  }
}
function participant(s) {
  return {
    id: 10, category: 'k2', category_title: '7–8 лет', points: s.points,
    place: s.finished && s.correct === 3 ? 1 : 3, place_total: 23,
    pending_category: s.pending ? 'k3' : undefined, pending_from_week: s.pending ? 10 : undefined,
    category_locked: s.started,
  }
}
function quizState(s) {
  return {
    season: { id: 1, name: 'Сезон 2026/27', weeks: 40, current_week: 9, playable_from: 1, playable_to: 9, frozen: false, over: false },
    participant: s.joined ? participant(s) : null,
    join: s.joined ? null : { allowed: [
      { code: 'k2', title: '7–8 лет', recommended: true },
      { code: 'k3', title: '9–11 лет', recommended: false },
    ], needs_dob: false, not_published: false },
    weeks: s.joined ? [
      { week: 9, status: s.finished ? 'finished' : s.started ? 'in_progress' : 'open', pos: s.pos, correct: s.correct, total: 3 },
      { week: 8, status: 'finished', pos: 3, correct: 2, total: 3 },
    ] : [],
    offer: null,
  }
}
function offer(s) {
  return { direction: 'up', target_category: 'k3', target_title: '9–11 лет', from_week: 10, points_now: s.points, points_after: s.points * 0.75 }
}
function weekResult(s) {
  return { week: 9, correct: s.correct, total: 3, points: s.points, place: s.correct === 3 ? 1 : 3, place_total: 23, xp_granted: s.correct === 3 ? 20 : 15, offer: s.correct === 3 ? offer(s) : null }
}
function review8() {
  return {
    week: 8, finished: true, correct: 2, total: 3,
    items: QS.map((q, i) => ({
      pos: i, question_id: q.question_id + 100, text: q.text, options: q.options, has_image: false,
      answered: true, chosen_idx: i === 1 ? 0 : CORRECT, correct_idx: CORRECT, is_correct: i !== 1,
      explanation: EXPLAIN, option_note: i === 1 ? 'Этот вариант неверен, потому что...' : '',
    })),
    result: { week: 8, correct: 2, total: 3, points: 3, place: 3, place_total: 23, xp_granted: 15, offer: null },
  }
}

function handleQuiz(method, pathname, body, s) {
  const p = pathname.replace(/^\/api\/base\/?/, '')
  const ok = (json) => ({ status: 200, json })
  if (p === 'auth/login' && method === 'POST') return ok({ success: true, token: 'child-jwt-token', child_id: 101, codename: 'Сокол', rank: 'Игрок' })
  if (p === 'me' && method === 'GET') return ok({ child_id: 101, codename: 'Сокол', rank: 'Игрок', xp: 105, streak_current: 3, streak_best: 7, completed_today: false, needs_attention_today: false, checkin_open: true, sound_on: true, rank_progress: { current: 'Игрок', maxed: false, to_next: 195 }, badges: [], slogan: '' })
  if (p === 'mission/today' && method === 'GET') return ok({ mission_id: 900, day_key: '2026-11-24', weekday: 2, theme: 'День энергии', slogan: '', questions: [], completed: false, checkin_open: true })
  if (p === 'quiz/state' && method === 'GET') return ok(quizState(s))
  if (p === 'quiz/join' && method === 'POST') {
    if (body?.category !== 'k2' && !body?.confirm) return { status: 400, json: { success: false, error: 'Подтвердите выбор', code: 'needs_confirm' } }
    s.joined = true
    return ok(participant(s))
  }
  const startM = /^quiz\/weeks\/(\d+)\/start$/.exec(p)
  if (startM && method === 'POST') {
    const week = Number(startM[1])
    if (week !== 9) return { status: 409, json: { success: false, error: 'Неделя закрыта', code: 'week_closed' } }
    s.started = true
    if (s.finished) return ok({ attempt_id: 50, week: 9, category: 'k2', category_title: '7–8 лет', pos: 3, total: 3, finished: true, result: weekResult(s) })
    return ok({ attempt_id: 50, week: 9, category: 'k2', category_title: '7–8 лет', pos: s.pos, total: 3, finished: false, question: QS[s.pos] })
  }
  if (p === 'quiz/weeks/8' && method === 'GET') return ok(review8())
  const ansM = /^quiz\/attempts\/(\d+)\/answer$/.exec(p)
  if (ansM && method === 'POST') {
    if (s.conflictOnce) { s.conflictOnce = false; return { status: 409, json: { success: false, error: 'Ответ на этот вопрос уже принят', code: 'already_answered' } } }
    if (body?.pos !== s.pos) return { status: 409, json: { success: false, error: 'Ответ уже принят', code: 'already_answered' } }
    const isCorrect = body?.option_idx === CORRECT
    if (isCorrect) { s.correct++; s.points++ }
    s.pos++
    s.finished = s.pos >= 3
    const out = {
      is_correct: isCorrect, correct_idx: CORRECT, chosen_idx: body?.option_idx ?? 0,
      explanation: EXPLAIN, option_note: isCorrect ? '' : 'Этот вариант неверен, потому что...',
      finished: s.finished, points: s.points, place: s.correct === 3 ? 1 : 3, place_total: 23,
    }
    if (s.finished) out.result = weekResult(s)
    else out.next_question = QS[s.pos]
    if (s.pos === 2 && !s.finished) out.answer_media = { type: 'photo', question_id: QS[1].question_id, kind: 'answer' }
    return ok(out)
  }
  const lbM = /^quiz\/leaderboard/.exec(p)
  if (lbM && method === 'GET') {
    const cat = new URL('http://x/' + p).searchParams.get('category') || 'k1'
    return ok(BOARD[cat] || { category: cat, title: cat, current_week: 9, weeks: 40, season_over: false, total: 0, items: [], me: null })
  }
  if (p === 'quiz/level' && method === 'POST') {
    if (body?.action === 'accept') { s.pending = true; return ok({ accepted: true, category: 'k3', pending_category: 'k3', pending_from_week: 10, points_after: s.points * 0.75 }) }
    return ok({ accepted: false, category: 'k2' })
  }
  const mediaM = /^quiz\/media\/(\d+)/.exec(p)
  if (mediaM && method === 'GET') return { status: 200, raw: PNG, contentType: 'image/png' }
  return { status: 404, json: { success: false, error: 'Не найдено.' } }
}

// ─── Детекторы вёрстки (из base-flow.cjs) ─────────────────────────────────────
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
      if (el.closest('.ab-bg')) return false
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
  // Берём тот playwright, у которого реально скачан браузер.
  for (const p of ['playwright', '/home/clawd/workspace/node_modules/playwright', '/home/clawd/.nvm/versions/node/v22.22.0/lib/node_modules/playwright']) {
    try {
      const pw = require(p)
      if (fs.existsSync(pw.chromium.executablePath())) return pw
    } catch { /* следующий */ }
  }
  throw new Error('playwright с установленным браузером не найден')
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

  async function newPage(vp, joined) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.isMobile, deviceScaleFactor: 1 })
    const state = newState(joined)
    const page = await ctx.newPage()
    page.on('pageerror', (e) => problems.push(`[${vp.name}] pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() !== 'error') return
      // 409 здесь — намеренная проверка конфликта с ботом (UI перечитывает состояние).
      if (/Failed to load resource.*status of (401|404|409)/.test(m.text())) return
      problems.push(`[${vp.name}] console.error: ${m.text()}`)
    })
    await page.route('**/*', (route) => {
      const u = new URL(route.request().url())
      if (u.pathname.startsWith('/api/base/')) {
        let body = null; try { body = route.request().postDataJSON() } catch { /* GET */ }
        const res = handleQuiz(route.request().method(), u.pathname + u.search, body, state)
        if (res.raw) return route.fulfill({ status: res.status, contentType: res.contentType, body: res.raw })
        return route.fulfill({ status: res.status, contentType: 'application/json', body: JSON.stringify(res.json) })
      }
      if (u.origin === ORIGIN) return route.continue()
      return route.fulfill({ status: 200, contentType: u.pathname.endsWith('.js') ? 'application/javascript' : 'text/plain', body: '' })
    })
    await page.addInitScript(() => localStorage.setItem('dinamchiki-base-child-token', 'child-jwt-token'))
    return { ctx, page, state }
  }
  async function check(page, vp, label) {
    await page.waitForTimeout(650)
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
  const expectText = async (page, vp, label, text) => {
    if (!(await page.getByText(text, { exact: false }).first().isVisible().catch(() => false))) {
      problems.push(`[${vp.name}] ${label}: не видно «${text}»`)
    }
  }

  async function playFlow(vp, answers, tag) {
    const { ctx, page, state } = await newPage(vp, true)
    await page.goto(ORIGIN + '/podtribunka/quiz', { waitUntil: 'networkidle' })
    await page.waitForSelector('.quiz-weeks')
    await expectText(page, vp, 'home', 'БУЦЫКИНА Полина')
    await expectText(page, vp, 'home', 'Неделя 9')
    await check(page, vp, 'quiz-home'); await shot(page, vp, 'quiz-home')

    // Рейтинг другой категории
    await page.locator('.quiz-board__cats .ab-chip', { hasText: '9–11' }).click()
    await page.waitForTimeout(300)
    await expectText(page, vp, 'board-k3', 'РУДИК Данил')
    await check(page, vp, 'quiz-board-k3')
    await page.locator('.quiz-board__cats .ab-chip', { hasText: '7–8' }).click()
    await page.waitForTimeout(300)

    // Разбор сыгранной недели
    await page.locator('.quiz-weeks__row', { hasText: 'Неделя 8' }).click()
    await page.waitForSelector('.quiz__review-head')
    await expectText(page, vp, 'review', 'Разбор')
    await expectText(page, vp, 'review', EXPLAIN)
    await check(page, vp, 'quiz-review'); await shot(page, vp, 'quiz-review')
    await clickBtn(page, 'К неделям')
    await page.waitForSelector('.quiz-weeks')

    // Игра: неделя 9
    await page.locator('.quiz-weeks__row', { hasText: 'Неделя 9' }).click()
    await page.waitForSelector('.quiz-q')
    await expectText(page, vp, 'q1', 'Сколько игроков')
    await check(page, vp, 'quiz-q1'); await shot(page, vp, 'quiz-q1')
    for (let i = 0; i < answers.length; i++) {
      await page.locator('.quiz-q__opt').nth(answers[i]).click()
      if (i === answers.length - 1) break // последний ответ сразу открывает итоги
      await page.waitForSelector('.quiz-q__feedback')
      if (i === 0) {
        await expectText(page, vp, 'feedback', answers[i] === 1 ? 'Верно' : 'Не совсем')
        await check(page, vp, 'quiz-feedback'); await shot(page, vp, 'quiz-feedback')
      }
      if (i === 1) {
        // вопрос с коллажем: у вариантов должны быть буквы A–C
        const letters = await page.locator('.quiz-q__letter').count()
        if (letters < 3) problems.push(`[${vp.name}] у вопроса с картинкой нет букв вариантов`)
      }
      if (i < answers.length - 1) {
        await clickBtn(page, 'Следующий вопрос')
        await page.waitForTimeout(250)
      }
    }
    await page.waitForSelector('.quiz-result')
    await expectText(page, vp, 'result', 'Неделя 9 пройдена')
    await expectText(page, vp, 'result', 'XP в Подтрибунке')
    await check(page, vp, 'quiz-result'); await shot(page, vp, 'quiz-result')
    if (state.correct === 3) {
      await page.waitForSelector('.quiz-offer')
      await expectText(page, vp, 'offer', '9–11 лет')
      await check(page, vp, 'quiz-offer'); await shot(page, vp, 'quiz-offer')
      await clickBtn(page, 'Перейти в')
      await page.waitForSelector('.quiz-weeks')
      await expectText(page, vp, 'pending', 'С недели 10')
      await shot(page, vp, 'quiz-pending')
    } else {
      await clickBtn(page, 'К неделям и рейтингу')
      await page.waitForSelector('.quiz-weeks')
    }
    await ctx.close()
  }

  async function joinFlow(vp) {
    const { ctx, page } = await newPage(vp, false)
    await page.goto(ORIGIN + '/podtribunka/quiz', { waitUntil: 'networkidle' })
    await page.waitForSelector('.quiz-join')
    await expectText(page, vp, 'join', 'В какой категории будешь играть')
    await check(page, vp, 'quiz-join'); await shot(page, vp, 'quiz-join')
    // Категория выше возрастной — подтверждение
    await clickBtn(page, '9–11 лет')
    await page.waitForSelector('.ab-alert--warn')
    await check(page, vp, 'quiz-join-confirm')
    await clickBtn(page, 'Выбрать другую')
    await page.waitForSelector('.quiz-join__opts')
    await clickBtn(page, '⭐ 7–8 лет')
    await page.waitForSelector('.quiz-weeks')
    await expectText(page, vp, 'joined', 'Неделя 9')
    await ctx.close()
  }

  async function conflictFlow(vp) {
    const { ctx, page, state } = await newPage(vp, true)
    state.conflictOnce = true
    await page.goto(ORIGIN + '/podtribunka/quiz', { waitUntil: 'networkidle' })
    await page.waitForSelector('.quiz-weeks')
    await page.locator('.quiz-weeks__row', { hasText: 'Неделя 9' }).click()
    await page.waitForSelector('.quiz-q')
    await page.locator('.quiz-q__opt').nth(1).click()
    // 409 already_answered → перечитали состояние, вернулись к неделям
    await page.waitForSelector('.quiz-weeks')
    await expectText(page, vp, 'conflict', 'Неделя 9')
    await ctx.close()
  }

  async function missionLinkFlow(vp) {
    const { ctx, page } = await newPage(vp, true)
    await page.goto(ORIGIN + '/podtribunka/mission', { waitUntil: 'networkidle' })
    await page.waitForSelector('.mission__quiz')
    await expectText(page, vp, 'mission-link', 'Воскресный квиз')
    await check(page, vp, 'mission-quiz-link'); await shot(page, vp, 'mission-quiz-link')
    await page.locator('.mission__quiz').click()
    await page.waitForSelector('.quiz-weeks')
    await ctx.close()
  }

  for (const vp of VIEWPORTS) {
    await playFlow(vp, [1, 0, 1], 'mixed')
    await playFlow(vp, [1, 1, 1], 'perfect')
    await joinFlow(vp)
    await conflictFlow(vp)
    await missionLinkFlow(vp)
  }

  await browser.close()
  server.close()
  if (problems.length) {
    console.error('Проблемы:\n' + problems.join('\n'))
    process.exit(1)
  }
  console.log(`OK: квиз-прогон чистый, скриншоты в ${SHOTS}`)
})().catch((e) => { console.error(e); process.exit(1) })