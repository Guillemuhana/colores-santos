// Genera el PDF de una cotización a partir de un JSON de cliente.
//   npm run cotizar -- cotizaciones/clientes/ejemplo.json
// Sale en cotizaciones/pdf/<numero>_<cliente>.pdf (y un .html al lado para previsualizar).
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { BUSINESS, SITE_URL } from '../src/config.js'
import { render, calcular } from './plantilla.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const arg = process.argv[2]
if (!arg) {
  console.error('Uso: npm run cotizar -- cotizaciones/clientes/<cliente>.json')
  process.exit(1)
}
const data = JSON.parse(readFileSync(resolve(arg), 'utf8'))

// Fotos del anexo: rutas relativas a cotizaciones/ -> base64 embebido
for (const gr of data.anexo?.grupos || []) for (const f of gr.fotos || []) {
  if (!f.src.startsWith('data:')) f.src = `data:image/jpeg;base64,${readFileSync(join(here, f.src)).toString('base64')}`
}

if (data.portada?.foto && !data.portada.foto.startsWith('data:')) data.portada.foto = `data:image/${data.portada.foto.endsWith('.png') ? 'png' : 'jpeg'};base64,${readFileSync(join(here, data.portada.foto)).toString('base64')}`

const b64 = (f, mime) => `data:${mime};base64,${readFileSync(join(here, '..', 'public', 'img', 'brand', f)).toString('base64')}`
const img = { roller: b64('roller-icon.webp', 'image/webp'), stroke: b64('stroke.webp', 'image/webp') }
// Datos de la empresa desde src/config.js; el JSON puede pisar alguno con "empresa": { ... }
const empresa = { ...BUSINESS, web: SITE_URL.replace(/^https?:\/\//, ''), ...(data.empresa || {}) }

const slug = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')
// El link sale del nombre del cliente (o del campo "link" del JSON si querés otro).
const link = slug(data.link || data.cliente?.nombre || 'cliente').toLowerCase()
const previewDir = join(here, 'pdf')
const publicDir = join(here, '..', 'public', 'cotizacion')
mkdirSync(previewDir, { recursive: true })
mkdirSync(publicDir, { recursive: true })
const htmlPath = join(previewDir, link + '.html')
const pdfPath = join(publicDir, link + '.pdf')
writeFileSync(htmlPath, render(data, img, empresa))

const browsers = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
]
const browser = browsers.find(existsSync)
if (!browser) {
  console.error('No encontré Edge ni Chrome. Abrí el HTML y usá Imprimir → Guardar como PDF:\n' + htmlPath)
  process.exit(1)
}
const profile = mkdtempSync(join(tmpdir(), 'cs-pdf-'))
try {
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=10000', `--user-data-dir=${profile}`, `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: 'ignore' })
} finally {
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }) } catch {}
}

// Adjuntos: PDFs que se agregan al final (ej. certificado de seguro). Rutas relativas a cotizaciones/
if (data.adjuntos?.length) {
  const { PDFDocument } = await import('pdf-lib')
  const doc = await PDFDocument.load(readFileSync(pdfPath))
  for (const a of data.adjuntos) {
    const src = await PDFDocument.load(readFileSync(join(here, a)))
    for (const p of await doc.copyPages(src, src.getPageIndices())) doc.addPage(p)
  }
  writeFileSync(pdfPath, await doc.save())
  console.log(`  + adjuntos: ${data.adjuntos.join(', ')}`)
}

const { total } = calcular(data)
console.log(`✔ PDF listo: ${pdfPath}\n  Link (después de publicar): ${SITE_URL}/cotizacion/${link}.pdf\n  Total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}`)
