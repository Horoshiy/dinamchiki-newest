import { describe, it, expect, vi } from 'vitest'
import { seoPlugin } from '../../vite-plugins/seo'

/**
 * robots.txt и sitemap.xml раньше лежали статикой и были захардкожены на
 * чужой домен, из-за чего стенд был открыт для индексации. Теперь их
 * выпускает этот плагин — тесты закрепляют оба режима.
 */
function emit(env: Record<string, string>) {
  const files: Record<string, string> = {}
  const ctx = {
    emitFile: vi.fn((f: { fileName: string; source: string }) => {
      files[f.fileName] = f.source
    }),
  }
  const plugin = seoPlugin(env) as unknown as {
    generateBundle: (this: typeof ctx) => void
  }
  plugin.generateBundle.call(ctx)
  return files
}

describe('vite-plugins/seo', () => {
  it('плагин работает только на сборке', () => {
    expect(seoPlugin({}).apply).toBe('build')
  })

  describe('стенд (индексация запрещена)', () => {
    const files = emit({ VITE_SITE_URL: 'https://flowise.dinamchiki.ru', VITE_ALLOW_INDEXING: 'false' })

    it('robots.txt запрещает обход целиком', () => {
      expect(files['robots.txt']).toContain('Disallow: /')
      expect(files['robots.txt']).not.toContain('Allow: /')
    })

    it('sitemap не выпускается — нечего отдавать поисковику', () => {
      expect(files['sitemap.xml']).toBeUndefined()
    })

    it('robots не ссылается на sitemap', () => {
      expect(files['robots.txt']).not.toContain('Sitemap:')
    })
  })

  describe('прод (индексация разрешена)', () => {
    const files = emit({ VITE_SITE_URL: 'https://dinamchiki.ru', VITE_ALLOW_INDEXING: 'true' })

    it('robots.txt разрешает обход и указывает на sitemap своего домена', () => {
      expect(files['robots.txt']).toContain('Allow: /')
      expect(files['robots.txt']).toContain('Sitemap: https://dinamchiki.ru/sitemap.xml')
    })

    it('sitemap выпускается и содержит все публичные маршруты', () => {
      const xml = files['sitemap.xml']
      expect(xml).toBeDefined()
      for (const path of ['/', '/teams', '/coaches', '/tournaments', '/gallery', '/contacts']) {
        expect(xml).toContain(`<loc>https://dinamchiki.ru${path}</loc>`)
      }
    })

    it('sitemap не содержит детальных маршрутов с параметрами', () => {
      expect(files['sitemap.xml']).not.toContain(':id')
      expect(files['sitemap.xml']).not.toMatch(/<loc>[^<]*\/(team|coach|tournament|player)\//)
    })

    it('sitemap — валидный XML с корректным корнем', () => {
      const xml = files['sitemap.xml']
      expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
      expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
      // число открывающих и закрывающих тегов совпадает
      expect((xml.match(/<url>/g) ?? []).length).toBe((xml.match(/<\/url>/g) ?? []).length)
    })
  })

  it('завершающий слэш в VITE_SITE_URL не даёт двойного слэша', () => {
    const files = emit({ VITE_SITE_URL: 'https://dinamchiki.ru/', VITE_ALLOW_INDEXING: 'true' })
    expect(files['sitemap.xml']).toContain('<loc>https://dinamchiki.ru/</loc>')
    expect(files['sitemap.xml']).not.toContain('dinamchiki.ru//')
  })

  it('без VITE_ALLOW_INDEXING индексация запрещена (безопасное умолчание)', () => {
    const files = emit({ VITE_SITE_URL: 'https://example.com' })
    expect(files['robots.txt']).toContain('Disallow: /')
  })

  it('строка, отличная от "true", не включает индексацию', () => {
    for (const v of ['1', 'yes', 'True', '']) {
      expect(emit({ VITE_ALLOW_INDEXING: v })['robots.txt'], `значение «${v}»`).toContain('Disallow: /')
    }
  })
})
