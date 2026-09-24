import type { Plugin } from 'vite'
import staticRoutes from './static-routes.json'

/**
 * Генерация robots.txt и sitemap.xml на этапе сборки.
 *
 * Раньше оба файла лежали статикой в public/ с захардкоженным доменом,
 * не совпадающим с тем, где живёт сборка: бета была открыта для индексации
 * и отдавала sitemap чужого домена. Теперь и адрес, и разрешение на
 * индексацию берутся из env, поэтому смена домена на проде — правка
 * конфигурации, а не кода.
 */

/**
 * Статические маршруты сайта — общий список для sitemap.xml и пререндера
 * (scripts/prerender.mjs). Детальные (:id) добавляет пререндер из API.
 */
const STATIC_ROUTES: ReadonlyArray<{ path: string; changefreq: string; priority: string }> = staticRoutes

export function seoPlugin(env: Record<string, string>): Plugin {
  const siteUrl = (env.VITE_SITE_URL || 'https://dinamchiki.ru').replace(/\/+$/, '')
  const allowIndexing = env.VITE_ALLOW_INDEXING === 'true'

  return {
    name: 'dinamchiki-seo',
    apply: 'build',
    generateBundle() {
      const robots = allowIndexing
        ? ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n')
        : [
            '# Бета-окружение — индексация запрещена.',
            '# Включается через VITE_ALLOW_INDEXING=true в боевой сборке.',
            'User-agent: *',
            'Disallow: /',
            '',
          ].join('\n')

      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })

      // Sitemap имеет смысл только у индексируемой сборки.
      if (allowIndexing) {
        const urls = STATIC_ROUTES.map(
          (r) =>
            `  <url>\n` +
            `    <loc>${siteUrl}${r.path}</loc>\n` +
            `    <changefreq>${r.changefreq}</changefreq>\n` +
            `    <priority>${r.priority}</priority>\n` +
            `  </url>`,
        ).join('\n')

        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source:
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            `${urls}\n` +
            '</urlset>\n',
        })
      }
    },
  }
}
