// Genera el PDF de una cotización a partir de un JSON de cliente.
//   npm run cotizar -- cotizaciones/clientes/ejemplo.json
// Sale en cotizaciones/pdf/<numero>_<cliente>.pdf (y un .html al lado para previsualizar).
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { BUSINESS, SITE_URL } from '../src/config.js'
import { render, calcular, GEO } from './plantilla.mjs'

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
// Firmante fijo de la empresa (el dueño). Su firma sale ya puesta en todas las cotizaciones.
// Para usar la firma real: guardar un PNG con fondo transparente en cotizaciones/firma-nicolas.png
const FIRMANTE = { nombre: 'Nicolás Hercun', cargo: 'Owner', imagen: 'firma-nicolas.png' }
const firmante = { ...FIRMANTE, ...(data.empresa?.firmante || {}) }
firmante.imagen = firmante.imagen && existsSync(join(here, firmante.imagen))
  ? `data:image/png;base64,${readFileSync(join(here, firmante.imagen)).toString('base64')}` : null
const empresa = { ...BUSINESS, web: SITE_URL.replace(/^https?:\/\//, ''), ...(data.empresa || {}), firmante }

const slug = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')
// El link sale del nombre del cliente (o del campo "link" del JSON si querés otro).
const link = slug(data.link || data.cliente?.nombre || 'cliente').toLowerCase()
const previewDir = join(here, 'pdf')
const publicDir = join(here, '..', 'public', 'cotizacion')
mkdirSync(previewDir, { recursive: true })
mkdirSync(publicDir, { recursive: true })
const htmlPath = join(previewDir, link + '.html')
const pdfPath = join(publicDir, link + '.pdf')
// Página web donde el cliente acepta y firma online (public/firmar.html + api/firmar.js)
const firmaUrl = `${SITE_URL}/firmar/${link}`
writeFileSync(htmlPath, render({ ...data, firmaUrl }, img, empresa))

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

// Campos rellenables para el cliente (firma, nombre, cargo, fecha) sobre la última página
// de la propuesta; después se agregan los adjuntos (ej. certificado de seguro), rutas relativas a cotizaciones/
{
  const { PDFDocument, PDFString, rgb } = await import('pdf-lib')
  const doc = await PDFDocument.load(readFileSync(pdfPath))
  const page = doc.getPage(doc.getPageCount() - 1)
  const k = 72 / 25.4
  const rect = ([top, h]) => {
    const yTop = GEO.top + GEO.cardTop + top + 0.6, hh = h - 1.2
    return { x: (GEO.left + GEO.cardLeftClient + 0.7) * k, y: (GEO.pageH - yTop - hh) * k, width: (GEO.cardW - 1.4) * k, height: hh * k }
  }
  const form = doc.getForm()
  // Campo de firma digital (Adobe Reader: clic para firmar; también sirve "Rellenar y firmar")
  const r = rect(GEO.boxes.firma)
  const sig = doc.context.register(doc.context.obj({
    Type: 'Annot', Subtype: 'Widget', FT: 'Sig', T: PDFString.of('Client signature'), F: 4,
    Rect: [r.x, r.y, r.x + r.width, r.y + r.height], P: page.ref,
  }))
  page.node.addAnnot(sig)
  form.acroForm.addField(sig)
  for (const [key, nombre] of [['nombre', 'Client name'], ['cargo', 'Client title'], ['fecha', 'Signature date']]) {
    const f = form.createTextField(nombre)
    f.addToPage(page, { ...rect(GEO.boxes[key]), borderWidth: 0, borderColor: undefined, backgroundColor: undefined, textColor: rgb(0.05, 0.08, 0.07) })
    f.setFontSize(10)
  }
  // Datos para la página de firma online: dónde estampar la firma del cliente, totales, etc.
  const c = calcular(data)
  const dep = data.pagos?.[0]
  writeFileSync(join(publicDir, link + '.json'), JSON.stringify({
    slug: link, pdf: `/cotizacion/${link}.pdf`, idioma: data.idioma === 'en' ? 'en' : 'es',
    titulo: data.tituloDocumento || (data.idioma === 'en' ? 'Estimate' : 'Cotización'),
    cliente: data.cliente?.nombre || '', atencion: data.cliente?.atencion || '',
    proyecto: data.proyecto?.titulo || '', direccion: data.proyecto?.direccion || '',
    fecha: data.fecha, total: c.total,
    deposito: dep ? (dep.monto ?? (c.total * (dep.porcentaje || 0)) / 100) : null,
    puntos: data.aprobacion?.puntos || [],
    pagina: doc.getPageCount() - 1,
    campos: Object.fromEntries(Object.keys(GEO.boxes).map((key) => [key, rect(GEO.boxes[key])])),
  }, null, 2))
  for (const a of data.adjuntos || []) {
    const src = await PDFDocument.load(readFileSync(join(here, a)))
    for (const p of await doc.copyPages(src, src.getPageIndices())) doc.addPage(p)
  }
  writeFileSync(pdfPath, await doc.save())
  if (data.adjuntos?.length) console.log(`  + adjuntos: ${data.adjuntos.join(', ')}`)
}

const { total } = calcular(data)
console.log(`✔ PDF listo: ${pdfPath}\n  Link (después de publicar): ${SITE_URL}/cotizacion/${link}.pdf\n  Firma online: ${firmaUrl}\n  Total:${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}`)
