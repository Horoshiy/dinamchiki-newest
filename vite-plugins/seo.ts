import type { Plugin } from 'vite'

/**
 * Генерация robots.txt и sitemap.xml на этапе сборки.
 *
 * Раньше оба файла лежали статикой в public/ с захардкоженным доменом,
 * не совпадающим с тем, где живёт сборка: бета была открыта для индексации
 * и отдавала sitemap чужого домена. Теперь и адрес, и разрешение на
 * индексацию берутся из env, поэтому смена домена на проде — правка
 * конфигурации, а не кода.
 */

/** Статические маршруты сайта. Детальные (:id) в sitemap не попадают. */
const STATIC_ROUTES: ReadonlyArray<{ path: string; changefreq: string; priority: string }> = [
  { path: '/',            changefreq: 'weekly',  priority: '1.0' },
  { path: '/teams',       changefreq: 'weekly',  priority: '0.9' },
  { path: '/coaches',     changefreq: 'monthly', priority: '0.8' },
  { path: '/tournaments', changefreq: 'weekly',  priority: '0.9' },
  { path: '/gallery',     changefreq: 'weekly',  priority: '0.7' },
  { path: '/contacts',    changefreq: 'monthly', priority: '0.8' },
  // Раздел «Сведения об образовательной организации» — обязательный по ст. 29
  // Федерального закона № 273-ФЗ, в карте сайта должен быть целиком.
  { path: '/sveden',           changefreq: 'monthly', priority: '0.9' },
  { path: '/sveden/common',    changefreq: 'monthly', priority: '0.7' },
  { path: '/sveden/struct',    changefreq: 'monthly', priority: '0.6' },
  { path: '/sveden/document',  changefreq: 'monthly', priority: '0.7' },
  { path: '/sveden/education', changefreq: 'monthly', priority: '0.7' },
  { path: '/sveden/managers',  changefreq: 'monthly', priority: '0.6' },
  { path: '/sveden/employees', changefreq: 'monthly', priority: '0.6' },
  { path: '/sveden/objects',   changefreq: 'monthly', priority: '0.6' },
  { path: '/sveden/grants',    changefreq: 'monthly', priority: '0.6' },
  { path: '/sveden/paid_edu',  changefreq: 'monthly', priority: '0.7' },
  { path: '/sveden/budget',    changefreq: 'yearly',  priority: '0.5' },
  { path: '/sveden/vacant',    changefreq: 'weekly',  priority: '0.7' },
  { path: '/sveden/inter',     changefreq: 'yearly',  priority: '0.5' },
  { path: '/sveden/catering',  changefreq: 'monthly', priority: '0.6' },
]

export function seoPlugin(env: Record<string, string>): Plugin {
  const siteUrl = (env.VITE_SITE_URL || 'https://dynamost.ru').replace(/\/+$/, '')
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
