/**
 * E2E-дымовой тест против собранного приложения.
 *
 * Проверяет то, что нельзя проверить в jsdom: реальную вёрстку на трёх
 * разрешениях, отсутствие переполнений и ошибок в консоли настоящего браузера.
 *
 *   npm run build && npm run preview &
 *   npm run e2e                     # по умолчанию http://127.0.0.1:4173
 *   BASE_URL=https://flowise.dinamchiki.ru BASIC_AUTH=dev:<пароль> npm run e2e
 *
 * Playwright ставится отдельно (npx playwright install chromium) — в
 * devDependencies его нет, чтобы не тянуть браузеры в обычную установку.
 */
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'

/** Бета закрыта basic auth: BASIC_AUTH=логин:пароль. */
const [AUTH_USER, ...AUTH_REST] = (process.env.BASIC_AUTH || '').split(':')
const HTTP_CREDENTIALS = AUTH_USER ? { username: AUTH_USER, password: AUTH_REST.join(':') } : undefined

// id — из реальных данных (группы из CRM, тренеры клуба). Карточки детей
// скрыты в админке, поэтому /player/* здесь нет.
const ROUTES = [
  '/', '/teams', '/team/crm-team-13', '/coaches', '/coach/roman-manuylo',
  '/tournaments', '/tournament/bzsm-2026-final-2018',
  '/gallery', '/contacts', '/privacy', '/consent', '/sveden',
  '/заведомо-несуществующая-страница',
]
const NOT_FOUND_ROUTE = '/заведомо-несуществующая-страница'

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  // iPhone SE 1-го поколения и бюджетные Android: на 320px бургер уезжал за край.
  { name: 'mobile-320', width: 320, height: 640, isMobile: true },
  // Увеличенный размер шрифта в системе — обычная настройка на Android.
  // Заголовки переносятся, блоки растут, и вёрстка ломается там, где при
  // стандартном шрифте всё сходилось впритык.
  { name: 'mobile-крупный-шрифт', width: 360, height: 800, isMobile: true, fontScale: 1.3 },
]

/**
 * Поиск наложений текста.
 *
 * Проверка на горизонтальное переполнение такое не ловит: элементы остаются
 * внутри вьюпорта, но накрывают друг друга. Именно так «Все фото» легла
 * поверх заголовка «Галерея клуба» — страница при этом была «в порядке».
 *
 * Сравниваем прямоугольники видимых текстовых узлов, игнорируя пары,
 * где один является предком другого или где перекрытие декоративное.
 */
async function findOverlaps(page) {
  return page.evaluate(() => {
    /**
     * Элемент невидим, если он вырезан предком с overflow: hidden.
     *
     * Закрытое мобильное меню сделано как max-height: 0 + overflow: hidden.
     * Геометрия ссылок при этом сохраняется, и без этой проверки каждая
     * из них «накладывается» на содержимое страницы под шапкой.
     */
    const clippedByAncestor = (el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return true
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const st = getComputedStyle(p)
        if (st.overflow === 'visible' && st.overflowX === 'visible' && st.overflowY === 'visible') continue
        const pr = p.getBoundingClientRect()
        const visibleW = Math.min(r.right, pr.right) - Math.max(r.left, pr.left)
        const visibleH = Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top)
        if (visibleW <= 1 || visibleH <= 1) return true
      }
      return false
    }

    const SELECTOR = 'h1, h2, h3, h4, p, a, button, span.section-title__eyebrow, li'
    const nodes = Array.from(document.querySelectorAll(SELECTOR)).filter((el) => {
      const st = getComputedStyle(el)
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false
      if (st.pointerEvents === 'none') return false
      if (el.getAttribute('aria-hidden') === 'true') return false
      if (el.closest('[aria-hidden="true"]')) return false
      // Элементы, намеренно лежащие поверх фона (подписи на фото и т.п.).
      if (el.closest('.lightbox, .hero__photo-inner')) return false
      // Липкая панель «Позвонить / WhatsApp» по замыслу лежит поверх
      // прокручиваемого контента; конец страницы освобождает под неё место.
      if (el.closest('.mcb')) return false
      const r = el.getBoundingClientRect()
      if (r.width < 8 || r.height < 8) return false
      if (clippedByAncestor(el)) return false
      // Пустышки без собственного текста не интересны.
      return (el.textContent || '').trim().length > 0
    })

    const label = (el) => {
      const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''
      const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28)
      return `${el.tagName.toLowerCase()}${cls} «${txt}»`
    }

    const out = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        if (a.contains(b) || b.contains(a)) continue

        // Строчный элемент, перенесённый на две строки, описывается
        // прямоугольником во всю ширину абзаца — и «перекрывает» соседнюю
        // ссылку в том же абзаце. Сравниваем по строкам (getClientRects).
        const boxes = (el) =>
          getComputedStyle(el).display === 'inline' ? Array.from(el.getClientRects()) : [el.getBoundingClientRect()]
        let overlapW = 0
        let overlapH = 0
        for (const ra of boxes(a)) {
          for (const rb of boxes(b)) {
            const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
            const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
            if (w > 2 && h > 2 && w * h > overlapW * overlapH) { overlapW = w; overlapH = h }
          }
        }
        if (overlapW <= 2 || overlapH <= 2) continue

        // Порог в абсолютной площади, а не в доле.
        //
        // Сначала здесь стояла доля 0.25 от меньшего элемента — и детектор
        // пропустил ровно тот баг, ради которого писался: кнопка «Все турниры»
        // накрывала заголовок с долей 0.23. Для текста значим сам факт
        // перекрытия, а не его доля: закрытые 300 px² — это несколько
        // нечитаемых символов.
        const area = overlapW * overlapH
        if (area < 300) continue

        out.push(`${label(a)} × ${label(b)}`)
        if (out.length >= 5) return out
      }
    }
    return out
  })
}

/**
 * Поиск текста, прилипшего к краю карточки.
 *
 * Ни проверка переполнения, ни проверка наложений такое не ловят: элемент
 * внутри вьюпорта и ничего не перекрывает, просто буквы упираются в границу
 * плитки. Именно так «Смотреть все фото» касалось края синей плитки.
 *
 * Ориентируемся на скруглённые контейнеры: карточка, плитка или кнопка со
 * скруглением практически всегда обязана иметь внутренний отступ.
 */
async function findTouchingEdges(page) {
  return page.evaluate(() => {
    const MIN_GAP = 4

    /** Ближайший предок-«карточка»: со скруглением и заметным размером. */
    const cardAncestor = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const st = getComputedStyle(p)
        const radius = parseFloat(st.borderTopLeftRadius) || 0
        const r = p.getBoundingClientRect()
        if (radius >= 6 && r.width >= 60 && r.height >= 40) return p
      }
      return null
    }

    const out = []
    const nodes = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, a, li, strong'))
    for (const el of nodes) {
      const st = getComputedStyle(el)
      if (st.display === 'none' || st.visibility === 'hidden') continue
      if (el.getAttribute('aria-hidden') === 'true' || el.closest('[aria-hidden="true"]')) continue
      // Интересует сам текстовый узел, а не обёртки вокруг него.
      const text = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .join('')
      if (text.length < 2) continue

      const card = cardAncestor(el)
      if (!card) continue
      // У самого элемента есть внутренний отступ — значит, зазор задан им.
      const own = getComputedStyle(el)
      if ((parseFloat(own.paddingLeft) || 0) >= MIN_GAP) continue

      const r = el.getBoundingClientRect()
      const c = card.getBoundingClientRect()
      const cs = getComputedStyle(card)
      const padL = parseFloat(cs.paddingLeft) || 0
      const padR = parseFloat(cs.paddingRight) || 0
      const left = r.left - (c.left + padL)
      const right = (c.right - padR) - r.right
      if (left < -MIN_GAP || right < -MIN_GAP) continue // выходит за карточку — это другая проверка

      if (Math.abs(left) < MIN_GAP && Math.abs(right) < MIN_GAP && padL < MIN_GAP && padR < MIN_GAP) {
        const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''
        out.push(`${el.tagName.toLowerCase()}${cls} «${text.slice(0, 26)}» вплотную к краю`)
        if (out.length >= 5) return out
      }
    }
    return out
  })
}

/**
 * Поиск текста, обрезанного собственным контейнером.
 *
 * Ловит случаи вроде подписи под фото, у которой не хватает высоты:
 * визуально текст «съеден», но переполнения страницы нет.
 */
async function findClipped(page) {
  return page.evaluate(() => {
    const out = []
    const nodes = Array.from(document.querySelectorAll('h1, h2, h3, p, a, button, li'))
    for (const el of nodes) {
      const st = getComputedStyle(el)
      if (st.display === 'none' || st.visibility === 'hidden') continue
      if (st.pointerEvents === 'none') continue
      if (el.getAttribute('aria-hidden') === 'true' || el.closest('[aria-hidden="true"]')) continue
      const text = (el.textContent || '').trim()
      if (!text) continue
      const hiddenY = st.overflowY === 'hidden' || st.overflow === 'hidden'
      const clippedV = hiddenY && el.scrollHeight - el.clientHeight > 4
      const clippedH = (st.overflowX === 'hidden' || st.overflow === 'hidden')
        && st.textOverflow !== 'ellipsis'
        && el.scrollWidth - el.clientWidth > 4
      if (clippedV || clippedH) {
        out.push(`${el.tagName.toLowerCase()} «${text.replace(/\s+/g, ' ').slice(0, 28)}»`)
        if (out.length >= 5) return out
      }
    }
    return out
  })
}

function loadPlaywright() {
  try {
    return require('playwright')
  } catch {
    try {
      return require('/home/clawd/.nvm/versions/node/v22.22.0/lib/node_modules/playwright')
    } catch {
      console.error('Playwright не установлен: npm i -D playwright && npx playwright install chromium')
      process.exit(2)
    }
  }
}

;(async () => {
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch()
  const problems = []

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: !!vp.isMobile,
      hasTouch: !!vp.isMobile,
      httpCredentials: HTTP_CREDENTIALS,
    })
    const page = await ctx.newPage()
    if (vp.fontScale) {
      await page.addInitScript((scale) => {
        document.addEventListener('DOMContentLoaded', () => {
          document.documentElement.style.fontSize = `${16 * scale}px`
        })
      }, vp.fontScale)
    }
    page.on('pageerror', (e) => problems.push(`[${vp.name}] pageerror: ${e.message}`))
    let currentRoute = ''
    page.on('console', (m) => {
      if (m.type() !== 'error') return
      // Честный 404 несуществующей страницы браузер пишет в консоль — это норма.
      if (currentRoute === NOT_FOUND_ROUTE && /status of 404/.test(m.text())) return
      problems.push(`[${vp.name}] console.error: ${m.text()}`)
    })

    for (const route of ROUTES) {
      currentRoute = route
      const resp = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(300)

      const status = resp ? resp.status() : 0
      if (status >= 500) problems.push(`[${vp.name}] ${route}: HTTP ${status}`)

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      if (overflow.scrollWidth > overflow.clientWidth + 1) {
        problems.push(`[${vp.name}] ${route}: горизонтальное переполнение ${overflow.scrollWidth} > ${overflow.clientWidth}`)
      }

      const h1count = await page.$$eval('h1', (els) => els.length)
      if (h1count !== 1) problems.push(`[${vp.name}] ${route}: h1 в количестве ${h1count}, ожидался 1`)

      const linksWithoutHref = await page.$$eval('a', (els) =>
        els.filter((e) => !e.getAttribute('href')).length)
      if (linksWithoutHref > 0) {
        problems.push(`[${vp.name}] ${route}: ссылок без href — ${linksWithoutHref}`)
      }

      for (const o of await findOverlaps(page)) {
        problems.push(`[${vp.name}] ${route}: наложение — ${o}`)
      }

      for (const c of await findClipped(page)) {
        problems.push(`[${vp.name}] ${route}: обрезано — ${c}`)
      }

      for (const t of await findTouchingEdges(page)) {
        problems.push(`[${vp.name}] ${route}: нет отступа — ${t}`)
      }
    }

    // Данные должны приходить с бэкенда, а не из запасных моков.
    if (vp.name === 'desktop') {
      await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(800)
      const fellBack = await page.evaluate(() => window.__gqlFellBack === true)
      if (fellBack) problems.push('[данные] фронт свалился на моки — бэкенд не ответил')

      const stats = await page.$$eval('.stat-card', (els) => els.length)
      if (stats === 0) problems.push('[данные] блок «клуб в цифрах» пуст')

      const rows = await page.$$eval('.standings tbody tr', (els) => els.length)
      if (rows === 0) problems.push('[данные] турнирная таблица на главной пуста')
    }

    console.log(`${vp.name}: пройдено маршрутов ${ROUTES.length}`)
    await ctx.close()
  }

  await browser.close()

  if (problems.length) {
    console.error('\nПроблемы:')
    problems.forEach((p) => console.error('  -', p))
    process.exit(1)
  }
  console.log('\nE2E: замечаний нет')
})().catch((e) => {
  console.error('FATAL:', e.message)
  process.exit(1)
})
