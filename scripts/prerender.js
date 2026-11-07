// Runs after `vite build` + the SSR build: writes one static HTML file per route
// (with its own title/meta/JSON-LD and page content), plus 404.html, sitemap.xml and robots.txt.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssr = path.join(root, 'dist-ssr')

const { render, headTags, PRERENDER_ROUTES } = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href)
const { SITE_URL } = await import(pathToFileURL(path.join(root, 'src', 'config.js')).href)
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const page = async (url) =>
  template
    .replace('<!--seo-->', headTags(url))
    .replace('<div id="root"></div>', `<div id="root">${await render(url)}</div>`)

for (const url of PRERENDER_ROUTES) {
  // "/residential" -> dist/residential.html (served at /residential thanks to cleanUrls)
  const file = url === '/' ? 'index.html' : `${url.slice(1)}.html`
  const out = path.join(dist, file)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, await page(url))
  console.log('prerendered', url)
}
fs.writeFileSync(path.join(dist, '404.html'), await page('/404'))

const today = new Date().toISOString().slice(0, 10)
const prio = (u) => (u === '/' ? '1.0' : u.startsWith('/residential/') ? '0.8' : u === '/contact' ? '0.7' : '0.9')
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PRERENDER_ROUTES.map((u) => `  <url><loc>${SITE_URL}${u === '/' ? '/' : u}</loc><lastmod>${today}</lastmod><priority>${prio(u)}</priority></url>`).join('\n')}
</urlset>
`,
)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
fs.rmSync(ssr, { recursive: true, force: true })
console.log('sitemap.xml + robots.txt written')
