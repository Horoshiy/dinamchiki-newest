#!/usr/bin/env node
/* eslint-disable no-console -- CLI-скрипт: печатает ход пререндера */
/**
 * Пререндер: превращает собранную SPA в набор HTML-страниц с готовым текстом.
 *
 * Зачем: Яндекс плохо исполняет JavaScript, и пустой <div id="app"> в HTML
 * он индексирует как пустую страницу. Скрипт открывает каждую страницу
 * в headless Chrome, дожидается данных из GraphQL и сохраняет DOM:
 *
 *   dist/index.html            — главная (готовый HTML)
 *   dist/<путь>/index.html     — остальные страницы
 *   dist/404.html              — страница «не найдено» для честного 404
 *   dist/spa.html              — исходная оболочка SPA: её сервер отдаёт
 *                                для страниц, которых нет в пререндере
 *                                (игроки, турниры, новые группы)
 *
 * Vue монтируется поверх готового HTML как обычно (createApp, не SSR),
 * поэтому в браузере всё работает, как раньше.
 *
 * Страницы открываются по HTTPS на настоящем домене сборки (VITE_SITE_URL,
 * через --host-resolver-rules на локальный сервер с самоподписанным
 * сертификатом). С любого другого адреса API отвечает отказом CORS, и сайт
 * молча подставляет демо-данные из моков — такой снимок скрипт бракует.
 *
 * Запуск после сборки: `npm run build:static` (= build + этот скрипт).
 * Нужны Chrome (CHROME_BIN или chrome-headless-shell из кэша Playwright)
 * и openssl.
 */
import { execFileSync, spawn } from 'node:child_process'
import { createServer } from 'node:https'
import { existsSync, mkdtempSync, readdirSync, readFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { homedir, tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const UA_MARK = 'DinamchikiPrerender' // см. src/shared/lib/metrika.ts
const CONCURRENCY = 4

const env = loadEnv(process.env.MODE || 'production', ROOT, 'VITE_')
const staticRoutes = JSON.parse(readFileSync(join(ROOT, 'vite-plugins/static-routes.json'), 'utf8'))

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN
  const cache = join(homedir(), '.cache/ms-playwright')
  if (existsSync(cache)) {
    const dirs = readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse()
    for (const d of dirs) {
      const bin = join(cache, d, 'chrome-headless-shell-linux64/chrome-headless-shell')
      if (existsSync(bin)) return bin
    }
  }
  throw new Error('Chrome не найден: задайте CHROME_BIN')
}

/** Группы с расписанием и тренеры — у них есть что показать поисковику. */
async function fetchDetailRoutes() {
  const res = await fetch(env.VITE_GRAPHQL_HTTP, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{ teams { id schedule { day } } coaches { id } }' }),
  })
  const { data, errors } = await res.json()
  if (errors?.length) throw new Error(`GraphQL: ${errors[0].message}`)
  return [
    ...data.teams.filter((t) => t.schedule.length > 0).map((t) => ({ path: `/team/${t.id}`, changefreq: 'weekly', priority: '0.7' })),
    ...data.coaches.map((c) => ({ path: `/coach/${c.id}`, changefreq: 'monthly', priority: '0.6' })),
  ]
}

const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' }

function selfSignedCert(host) {
  const dir = mkdtempSync(join(tmpdir(), 'prerender-'))
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
    '-subj', `/CN=${host}`, '-keyout', join(dir, 'key.pem'), '-out', join(dir, 'cert.pem'),
  ], { stdio: 'ignore' })
  const cert = { key: readFileSync(join(dir, 'key.pem')), cert: readFileSync(join(dir, 'cert.pem')) }
  rmSync(dir, { recursive: true })
  return cert
}

/** Статика из dist с SPA-fallback на исходную оболочку. */
function serve(shell, tls) {
  return new Promise((ok) => {
    const server = createServer(tls, (req, res) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      const file = join(DIST, path)
      if (file.startsWith(DIST) && extname(path) && existsSync(file)) {
        res.writeHead(200, { 'content-type': MIME[extname(path)] || 'application/octet-stream' })
        res.end(readFileSync(file))
      } else {
        res.writeHead(200, { 'content-type': 'text/html' })
        res.end(shell)
      }
    })
    server.listen(0, '127.0.0.1', () => ok(server))
  })
}

function dumpDom(chrome, url, resolverRule) {
  return new Promise((ok, fail) => {
    const args = [
      '--headless', '--no-sandbox', '--disable-gpu',
      `--host-resolver-rules=${resolverRule}`, '--ignore-certificate-errors',
      `--user-agent=Mozilla/5.0 (X11; Linux x86_64) Chrome/140 ${UA_MARK}`,
      '--enable-logging=stderr', '--v=0',
      '--virtual-time-budget=15000', '--dump-dom', url,
    ]
    const proc = spawn(chrome, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    let log = ''
    proc.stdout.on('data', (chunk) => { out += chunk })
    proc.stderr.on('data', (chunk) => { log += chunk })
    proc.on('error', fail)
    proc.on('close', (code) => (code === 0 && out ? ok({ html: out, log }) : fail(new Error(`chrome exit ${code} on ${url}`))))
    setTimeout(() => proc.kill('SIGKILL'), 60_000)
  })
}

/** Проверки снимка: страница дорисовалась, а не застряла на загрузке. */
function check(route, html, log) {
  const problems = []
  if (log.includes('mock fallback')) problems.push('API не ответил, на странице демо-данные из моков')
  if (!/<div id="app"[^>]*>\s*<\S/.test(html)) problems.push('пустой #app')
  if (/class="[^"]*skeleton/i.test(html)) problems.push('остался скелетон загрузки')
  if (route.path.startsWith('/team/') && /<title>Команда —/.test(html)) problems.push('заголовок группы не подставился')
  if (route.path.startsWith('/coach/') && /<title>Тренер —/.test(html)) problems.push('заголовок тренера не подставился')
  return problems
}

async function main() {
  const chrome = findChrome()
  const shell = readFileSync(join(DIST, 'index.html'), 'utf8')
  if (!shell.includes('<div id="app"></div>')) {
    throw new Error('dist/index.html уже пререндерен — сначала пересоберите: npm run build')
  }
  writeFileSync(join(DIST, 'spa.html'), shell)

  const detail = await fetchDetailRoutes()
  const routes = [...staticRoutes, ...detail, { path: '/__prerender-404__', notFound: true }]
  const site = new URL(env.VITE_SITE_URL || 'https://dinamchiki.ru')
  const server = await serve(shell, selfSignedCert(site.hostname))
  const resolverRule = `MAP ${site.hostname} 127.0.0.1:${server.address().port}`
  const base = `https://${site.hostname}`

  const failed = []
  let next = 0
  async function worker() {
    while (next < routes.length) {
      const route = routes[next++]
      try {
        const { html: dom, log } = await dumpDom(chrome, base + route.path, resolverRule)
        let html = /^<!DOCTYPE/i.test(dom) ? dom : `<!DOCTYPE html>\n${dom}`
        const problems = check(route, html, log)
        if (problems.length) throw new Error(problems.join(', '))
        // У страницы 404 нет своего адреса — каноникал и og:url ей не нужны.
        if (route.notFound) {
          html = html.replace(/<link rel="canonical"[^>]*>/, '').replace(/<meta property="og:url"[^>]*>/, '')
        }
        const target = route.notFound
          ? join(DIST, '404.html')
          : route.path === '/' ? join(DIST, 'index.html') : join(DIST, route.path, 'index.html')
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, html)
        console.log(`  ✓ ${route.notFound ? '404' : route.path}  ${(html.length / 1024).toFixed(0)} КБ`)
      } catch (e) {
        failed.push(`${route.path}: ${e.message}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  server.close()

  // Sitemap сборка пишет только из статических маршрутов; детальные — отсюда.
  const sitemap = join(DIST, 'sitemap.xml')
  if (existsSync(sitemap) && detail.length) {
    const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '')
    const urls = detail.map((r) =>
      `  <url>\n    <loc>${siteUrl}${r.path}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
    ).join('\n')
    writeFileSync(sitemap, readFileSync(sitemap, 'utf8').replace('</urlset>', `${urls}\n</urlset>`))
  }

  if (failed.length) {
    // Неудачная страница просто не записана: сервер отдаст для неё spa.html.
    console.error(`\nНе пререндерено ${failed.length} из ${routes.length}:\n  ${failed.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`\nГотово: ${routes.length} страниц.`)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
