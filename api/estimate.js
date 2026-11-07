/*
 * Vercel Function: receives the estimate form and emails a well-organized
 * request (client info, services, details, photo gallery, quick-reply buttons)
 * to the business through Resend (https://resend.com).
 *
 * Env vars (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY   required
 *   ESTIMATE_TO      optional, defaults to ninitgroup@gmail.com (comma-separated for several)
 *   ESTIMATE_FROM    optional, defaults to "Colores Santos <onboarding@resend.dev>"
 *                    (use an address on your own verified domain once you have one)
 */

const TO = (process.env.ESTIMATE_TO || 'ninitgroup@gmail.com').split(',').map((s) => s.trim()).filter(Boolean)
const FROM = process.env.ESTIMATE_FROM || 'Colores Santos <onboarding@resend.dev>'
const PHOTO_HOST = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/estimates\//i

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const clip = (s, n) => String(s ?? '').trim().slice(0, n)
const digits = (s) => String(s).replace(/\D/g, '')

function clean(body) {
  const d = {
    name: clip(body.name, 120),
    phone: clip(body.phone, 40),
    email: clip(body.email, 160),
    city: clip(body.city, 120),
    type: clip(body.type, 60),
    services: (Array.isArray(body.services) ? body.services : []).map((s) => clip(s, 80)).filter(Boolean).slice(0, 12),
    message: clip(body.message, 4000),
    photos: (Array.isArray(body.photos) ? body.photos : []).filter((u) => typeof u === 'string' && PHOTO_HOST.test(u)).slice(0, 10),
    failedPhotos: Math.max(0, Math.min(10, Number(body.failedPhotos) || 0)),
  }
  if (!d.name || !d.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return null
  return d
}

function waNumber(phone) {
  const n = digits(phone)
  return n.length === 10 ? `1${n}` : n // assume US if 10 digits
}

function html(d, when) {
  const brand = '#1fd8a6'
  const forest = '#0b3a32'
  const row = (label, value) => value
    ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eef2f1;color:#6b7a76;font-size:13px;width:130px;vertical-align:top">${label}</td><td style="padding:10px 0;border-bottom:1px solid #eef2f1;font-size:15px;color:#0d1412;font-weight:600">${value}</td></tr>`
    : ''
  const pills = d.services.length
    ? d.services.map((s) => `<span style="display:inline-block;margin:0 6px 8px 0;padding:7px 12px;border-radius:999px;background:#e9fbf5;border:1px solid #96ebd2;color:#0c8566;font-size:13px;font-weight:700">${esc(s)}</span>`).join('')
    : '<span style="color:#6b7a76;font-size:14px">Not specified</span>'
  const photos = d.photos.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${d.photos.map((u, i) => `${i && i % 2 === 0 ? '</tr><tr>' : ''}<td width="50%" style="padding:5px;vertical-align:top"><a href="${esc(u)}" target="_blank" style="text-decoration:none"><img src="${esc(u)}" alt="Photo ${i + 1}" width="262" style="display:block;width:100%;max-width:262px;height:190px;object-fit:cover;border-radius:12px;border:1px solid #e3ebe8"><span style="display:block;padding-top:5px;font-size:12px;color:#0c8566;font-weight:700">Photo ${i + 1} · open full size ↗</span></a></td>`).join('')}${d.photos.length % 2 ? '<td width="50%"></td>' : ''}</tr></table>`
    : '<p style="margin:0;color:#6b7a76;font-size:14px">No photos attached.</p>'
  const failed = d.failedPhotos ? `<p style="margin:10px 0 0;color:#b45309;font-size:13px">⚠ ${d.failedPhotos} photo(s) could not upload, the client may send them by WhatsApp.</p>` : ''
  const subject = encodeURIComponent(`Your personalized painting estimate, Colores Santos`)
  const greet = encodeURIComponent(`Hi ${d.name}! This is Colores Santos about your painting estimate request.`)
  const btn = (href, label, bg, color) => `<a href="${href}" target="_blank" style="display:inline-block;margin:0 8px 10px 0;padding:12px 18px;border-radius:10px;background:${bg};color:${color};font-weight:800;font-size:14px;text-decoration:none">${label}</a>`

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New estimate request</title></head>
<body style="margin:0;padding:0;background:#eef8f5;font-family:Segoe UI,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef8f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(11,58,50,.12)">
  <tr><td style="background:${forest};padding:26px 28px">
    <div style="font-size:12px;letter-spacing:3px;color:${brand};font-weight:800">COLORES SANTOS · NEW ESTIMATE REQUEST</div>
    <div style="margin-top:8px;font-size:26px;line-height:1.2;color:#ffffff;font-weight:800">${esc(d.name)}</div>
    <div style="margin-top:6px;font-size:14px;color:rgba(255,255,255,.7)">${esc(d.type || 'Residential')}${d.city ? ` · ${esc(d.city)}` : ''} · ${esc(when)}</div>
  </td></tr>
  <tr><td style="height:6px;background:${brand}"></td></tr>

  <tr><td style="padding:24px 28px 6px">
    ${btn(`mailto:${esc(d.email)}?subject=${subject}`, '✉ Reply by email', brand, forest)}
    ${btn(`https://wa.me/${waNumber(d.phone)}?text=${greet}`, 'WhatsApp client', '#25D366', '#ffffff')}
    ${btn(`tel:${esc(digits(d.phone))}`, '☎ Call', '#0d1412', '#ffffff')}
  </td></tr>

  <tr><td style="padding:10px 28px 0">
    <h2 style="margin:0 0 6px;font-size:16px;color:${forest}">Client</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Name', esc(d.name))}
      ${row('Phone', `<a href="tel:${esc(digits(d.phone))}" style="color:#0d1412;text-decoration:none">${esc(d.phone)}</a>`)}
      ${row('Email', `<a href="mailto:${esc(d.email)}" style="color:#0c8566">${esc(d.email)}</a>`)}
      ${row('City / Area', esc(d.city))}
      ${row('Property type', esc(d.type))}
    </table>
  </td></tr>

  <tr><td style="padding:22px 28px 0">
    <h2 style="margin:0 0 10px;font-size:16px;color:${forest}">Services requested</h2>
    ${pills}
  </td></tr>

  <tr><td style="padding:14px 28px 0">
    <h2 style="margin:0 0 10px;font-size:16px;color:${forest}">Project details</h2>
    <div style="padding:14px 16px;border-radius:12px;background:#f6faf9;border:1px solid #e3ebe8;font-size:15px;line-height:1.6;color:#0d1412;white-space:pre-wrap">${d.message ? esc(d.message) : '<span style="color:#6b7a76">No details provided.</span>'}</div>
  </td></tr>

  <tr><td style="padding:22px 23px 0">
    <h2 style="margin:0 0 8px 5px;font-size:16px;color:${forest}">Photos (${d.photos.length})</h2>
    ${photos}
    ${failed}
  </td></tr>

  <tr><td style="padding:24px 28px">
    <div style="padding:14px 16px;border-radius:12px;background:#e9fbf5;border:1px solid #96ebd2;font-size:14px;color:#0c8566;line-height:1.5">
      <b>Next step:</b> send the personalized estimate (itemized quote, before &amp; after images, color advice) to <b>${esc(d.email)}</b>.
    </div>
  </td></tr>
  <tr><td style="padding:16px 28px;background:#f6faf9;border-top:1px solid #eef2f1;font-size:12px;color:#6b7a76">Sent from the estimate form at colores-santos.vercel.app</td></tr>
</table>
</td></tr></table></body></html>`
}

function text(d, when) {
  return [
    `NEW ESTIMATE REQUEST · ${when}`,
    '',
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Email: ${d.email}`,
    d.city && `City / Area: ${d.city}`,
    `Property type: ${d.type}`,
    `Services: ${d.services.join(', ') || 'Not specified'}`,
    '',
    'Project details:',
    d.message || '(none)',
    '',
    `Photos (${d.photos.length}):`,
    ...d.photos.map((u, i) => `${i + 1}. ${u}`),
    d.failedPhotos ? `${d.failedPhotos} photo(s) could not upload.` : '',
  ].filter((l) => l !== false && l !== undefined).join('\n')
}

export async function POST(request) {
  let body
  try { body = await request.json() } catch { return Response.json({ ok: false, error: 'bad_request' }, { status: 400 }) }
  if (body.company) return Response.json({ ok: true }) // honeypot: silently drop bots

  const d = clean(body)
  if (!d) return Response.json({ ok: false, error: 'invalid' }, { status: 422 })

  const key = process.env.RESEND_API_KEY
  if (!key) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 })

  const when = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
  const services = d.services.length ? d.services.slice(0, 3).join(', ') + (d.services.length > 3 ? '…' : '') : d.type
  const subject = `New estimate: ${d.name} · ${services}${d.city ? ` · ${d.city}` : ''}${d.photos.length ? ` · ${d.photos.length} photo${d.photos.length > 1 ? 's' : ''}` : ''}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: TO, reply_to: d.email, subject, html: html(d, when), text: text(d, when) }),
  })
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text())
    return Response.json({ ok: false, error: 'send_failed' }, { status: 502 })
  }
  return Response.json({ ok: true })
}
