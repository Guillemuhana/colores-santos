/*
 * Vercel Function: el cliente acepta y firma una cotización desde /firmar/<slug>.
 * Estampa la firma, nombre, cargo y fecha en el PDF publicado en /cotizacion/<slug>.pdf,
 * guarda la copia firmada en Vercel Blob y la manda por email (Resend) con el PDF adjunto.
 *
 * Env vars (las mismas que usa api/estimate.js):
 *   RESEND_API_KEY        requerida
 *   SIGNED_TO             opcional, a quién avisar (por defecto ESTIMATE_TO o ninitgroup@gmail.com)
 *   ESTIMATE_FROM         opcional, remitente
 *   SITE_URL              opcional, por defecto https://colores-santos.vercel.app
 *   BLOB_READ_WRITE_TOKEN para guardar la copia firmada (ya está si el Blob store está conectado)
 */
import { PDFDocument, PDFName, StandardFonts, rgb } from 'pdf-lib'
import { put } from '@vercel/blob'

const TO = (process.env.SIGNED_TO || process.env.ESTIMATE_TO || 'ninitgroup@gmail.com').split(',').map((s) => s.trim()).filter(Boolean)
const FROM = process.env.ESTIMATE_FROM || 'Colores Santos <onboarding@resend.dev>'
const SITE = (process.env.SITE_URL || 'https://colores-santos.vercel.app').replace(/\/$/, '')

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const clip = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
// Las fuentes estándar del PDF solo aceptan caracteres latinos (WinAnsi)
const latin = (s) => s.normalize('NFC').replace(/[^\x20-\x7E -ÿ]/g, (c) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7E]/g, ''))

export async function POST(request) {
  let body
  try { body = await request.json() } catch { return Response.json({ ok: false, error: 'bad_request' }, { status: 400 }) }

  const slug = String(body.slug || '')
  const name = clip(body.name, 120)
  const title = clip(body.title, 120)
  const sig = String(body.signature || '')
  if (!/^[a-z0-9-]{1,100}$/.test(slug) || !name || body.accepted !== true
    || !sig.startsWith('data:image/png;base64,') || sig.length > 800_000) {
    return Response.json({ ok: false, error: 'invalid' }, { status: 422 })
  }
  const key = process.env.RESEND_API_KEY
  if (!key) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 })

  // Datos de la cotización (los escribe cotizaciones/generar.mjs junto al PDF)
  const metaRes = await fetch(`${SITE}/cotizacion/${slug}.json`, { cache: 'no-store' })
  if (!metaRes.ok) return Response.json({ ok: false, error: 'not_found' }, { status: 404 })
  const meta = await metaRes.json()
  const pdfRes = await fetch(`${SITE}${meta.pdf}`, { cache: 'no-store' })
  if (!pdfRes.ok) return Response.json({ ok: false, error: 'not_found' }, { status: 404 })

  const now = new Date()
  const tz = { timeZone: 'America/New_York' }
  const fecha = new Intl.DateTimeFormat(meta.idioma === 'es' ? 'es-ES' : 'en-US', { ...tz, dateStyle: 'long' }).format(now)
  const when = new Intl.DateTimeFormat('en-US', { ...tz, dateStyle: 'medium', timeStyle: 'short' }).format(now) + ' ET'
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'

  // ---------- Estampar la firma en el PDF ----------
  const doc = await PDFDocument.load(await pdfRes.arrayBuffer())
  const page = doc.getPage(meta.pagina)
  // La copia firmada ya no lleva campos rellenables ni enlaces: queda fija
  for (const p of doc.getPages()) p.node.delete(PDFName.of('Annots'))
  doc.catalog.delete(PDFName.of('AcroForm'))
  const { firma, nombre, cargo, fecha: rFecha } = meta.campos

  // tapa el texto guía "Sign here" del casillero
  page.drawRectangle({ x: firma.x + 2, y: firma.y + 2, width: firma.width - 4, height: firma.height - 4, color: rgb(0.988, 0.996, 0.992) })
  const png = await doc.embedPng(Buffer.from(sig.split(',')[1], 'base64'))
  const s = Math.min((firma.width - 16) / png.width, (firma.height - 10) / png.height)
  page.drawImage(png, { x: firma.x + 10, y: firma.y + 5, width: png.width * s, height: png.height * s })

  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const small = await doc.embedFont(StandardFonts.Helvetica)
  const ink = rgb(0.05, 0.08, 0.07)
  const write = (r, txt) => page.drawText(latin(txt), { x: r.x + 8, y: r.y + r.height / 2 - 3.5, size: 10, font, color: ink, maxWidth: r.width - 16 })
  write(nombre, name)
  if (title) write(cargo, title)
  write(rFecha, fecha)
  const gray = rgb(0.36, 0.42, 0.4)
  page.drawText(latin(`Signed electronically at ${SITE.replace(/^https?:\/\//, '')}/firmar/${slug}`), { x: rFecha.x, y: rFecha.y - 11, size: 6.2, font: small, color: gray })
  page.drawText(latin(`${when} · IP ${ip}`), { x: rFecha.x, y: rFecha.y - 19, size: 6.2, font: small, color: gray })
  const signed = await doc.save()

  // ---------- Guardar copia firmada ----------
  let url = null
  try {
    const blob = await put(`signed/${slug}-signed.pdf`, Buffer.from(signed), { access: 'public', contentType: 'application/pdf', addRandomSuffix: true })
    url = blob.url
  } catch (err) {
    console.error('Blob error', err)
  }

  // ---------- Email de aviso ----------
  const subject = `Proposal accepted: ${meta.cliente} · ${money(meta.total)}`
  const row = (k, v) => `<tr><td style="padding:7px 0;color:#6b7a76;font-size:13px;width:150px">${k}</td><td style="padding:7px 0;color:#0d1412;font-size:14px;font-weight:700">${v}</td></tr>`
  const html = `<!doctype html><html><body style="margin:0;background:#e6f2ee;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e6f2ee"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden">
  <tr><td style="background:#0b3a32;padding:26px 30px">
    <img src="${SITE}/img/brand/email-logo.png" width="170" alt="Colores Santos" style="display:block;width:170px;height:auto;border:0">
    <div style="margin-top:20px;display:inline-block;padding:6px 13px;border-radius:999px;background:#1fd8a6;color:#072822;font-size:11px;font-weight:800;letter-spacing:2px">&#10003; PROPOSAL SIGNED</div>
    <div style="color:#fff;font-size:26px;font-weight:800;margin-top:10px;line-height:1.2">${esc(meta.cliente)}</div>
    <div style="color:#b5d6cd;font-size:14px;margin-top:6px">${esc(meta.proyecto)} · ${esc(meta.direccion || '')}</div>
  </td></tr>
  <tr><td style="height:5px;background:#1fd8a6;font-size:0">&nbsp;</td></tr>
  <tr><td style="padding:24px 30px 6px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Total', money(meta.total))}
      ${meta.deposito ? row('Deposit due', money(meta.deposito)) : ''}
      ${row('Signed by', esc(name) + (title ? ` · ${esc(title)}` : ''))}
      ${row('Date', esc(when))}
      ${row('IP address', esc(ip))}
    </table>
  </td></tr>
  <tr><td style="padding:16px 30px 28px">
    ${url ? `<a href="${esc(url)}" target="_blank" style="display:inline-block;padding:14px 26px;border-radius:12px;background:#0b3a32;color:#fff;font-size:15px;font-weight:800;text-decoration:none">Open signed proposal (PDF) &rarr;</a>` : ''}
    <div style="color:#6b7a76;font-size:13px;margin-top:14px">The signed PDF is attached to this email.</div>
  </td></tr>
</table></td></tr></table></body></html>`

  const attach = signed.length < 28 * 1024 * 1024
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM, to: TO, subject, html,
      text: `${subject}\nSigned by: ${name}${title ? ` (${title})` : ''}\nDate: ${when}\nIP: ${ip}\n${url ? `PDF: ${url}` : ''}`,
      ...(attach ? { attachments: [{ filename: `${slug}-signed.pdf`, content: Buffer.from(signed).toString('base64') }] } : {}),
    }),
  })
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text())
    return Response.json({ ok: false, error: 'send_failed' }, { status: 502 })
  }
  return Response.json({ ok: true, url })
}
