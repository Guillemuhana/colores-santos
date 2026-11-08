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
 *   SITE_URL         optional, defaults to https://colores-santos.vercel.app
 */

const TO = (process.env.ESTIMATE_TO || 'ninitgroup@gmail.com').split(',').map((s) => s.trim()).filter(Boolean)
const FROM = process.env.ESTIMATE_FROM || 'Colores Santos <onboarding@resend.dev>'
const SITE = process.env.SITE_URL || 'https://colores-santos.vercel.app'
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

/* ------------------------------------------------------------------ */
/* Email template: table-based + inline styles so it renders the same  */
/* in Gmail, Outlook and Apple Mail.                                   */
/* ------------------------------------------------------------------ */
function html(d, when) {
  const brand = '#1fd8a6'
  const brandDark = '#0c8566'
  const forest = '#0b3a32'
  const forestDeep = '#072822'
  const ink = '#0d1412'
  const muted = '#6b7a76'
  const font = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
  const first = d.name.split(/\s+/)[0]
  const initials = d.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  const tel = digits(d.phone)
  const subject = encodeURIComponent('Your personalized painting estimate | Colores Santos')
  const replyBody = encodeURIComponent(`Hi ${first},\n\nThank you for contacting Colores Santos! Here is your personalized estimate for ${d.services.join(', ') || 'your project'}, including the itemized quote and before & after images.\n\n`)
  const greet = encodeURIComponent(`Hi ${d.name}! This is Colores Santos about your painting estimate request.`)
  const replyHref = `mailto:${esc(d.email)}?subject=${subject}&body=${replyBody}`
  const preheader = `${d.city || d.type} · ${d.services.slice(0, 2).join(', ') || d.type}${d.photos.length ? ` · ${d.photos.length} photos` : ''}`

  const label = (t) => `<div style="font-family:${font};font-size:11px;letter-spacing:2.5px;font-weight:800;color:${brandDark};text-transform:uppercase;margin:0 0 12px">${t}</div>`
  const section = (title, inner, pad = '28px 32px 0') => `<tr><td style="padding:${pad}">${label(title)}${inner}</td></tr>`

  const stat = (value, name) => `<td width="33.33%" style="padding:0 5px"><div style="background:#124a40;border:1px solid #1d5c50;border-radius:14px;padding:14px 8px;text-align:center">
    <div style="font-family:${font};font-size:22px;font-weight:800;color:#ffffff;line-height:1.15">${value}</div>
    <div style="font-family:${font};font-size:10px;letter-spacing:1.5px;color:#9cc9bd;text-transform:uppercase;margin-top:4px">${name}</div></div></td>`

  const action = (href, text, bg, color, border = bg) => `<td style="padding:0 5px" width="33.33%"><a href="${href}" target="_blank" style="display:block;text-align:center;padding:14px 6px;border-radius:12px;background:${bg};border:1px solid ${border};color:${color};font-family:${font};font-size:14px;font-weight:800;text-decoration:none">${text}</a></td>`

  const field = (name, value) => `<td width="50%" style="padding:6px;vertical-align:top"><div style="background:#f6faf9;border:1px solid #e3ebe8;border-radius:12px;padding:12px 14px">
    <div style="font-family:${font};font-size:10px;letter-spacing:1.5px;color:${muted};text-transform:uppercase">${name}</div>
    <div style="font-family:${font};font-size:15px;font-weight:700;color:${ink};margin-top:3px;word-break:break-word">${value || '<span style="color:#a3b1ad;font-weight:500">Not provided</span>'}</div></div></td>`

  const pills = d.services.length
    ? d.services.map((x) => `<span style="display:inline-block;margin:0 8px 8px 0;padding:9px 14px;border-radius:999px;background:#e9fbf5;border:1px solid #96ebd2;color:${brandDark};font-family:${font};font-size:13px;font-weight:700">&#10003;&nbsp; ${esc(x)}</span>`).join('')
    : `<span style="font-family:${font};color:${muted};font-size:14px">Not specified</span>`

  const img = (u, i, h) => `<a href="${esc(u)}" target="_blank" style="text-decoration:none;display:block"><img src="${esc(u)}" alt="Photo ${i + 1}" width="100%" height="${h}" style="display:block;width:100%;height:${h}px;object-fit:cover;border-radius:14px;border:0"></a>
    <div style="font-family:${font};font-size:12px;color:${muted};padding:6px 2px 0">Photo ${i + 1} &nbsp;·&nbsp; <a href="${esc(u)}" target="_blank" style="color:${brandDark};font-weight:700;text-decoration:none">View full size &rarr;</a></div>`

  let gallery = `<div style="font-family:${font};color:${muted};font-size:14px;background:#f6faf9;border:1px dashed #cfdcd8;border-radius:14px;padding:18px;text-align:center">No photos attached</div>`
  if (d.photos.length) {
    const [lead, ...rest] = d.photos
    gallery = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:0 5px 12px">${img(lead, 0, 300)}</td></tr></table>`
    if (rest.length) {
      let rows = ''
      for (let i = 0; i < rest.length; i += 2) {
        rows += `<tr><td width="50%" style="padding:0 5px 12px;vertical-align:top">${img(rest[i], i + 1, 170)}</td><td width="50%" style="padding:0 5px 12px;vertical-align:top">${rest[i + 1] ? img(rest[i + 1], i + 2, 170) : ''}</td></tr>`
      }
      gallery += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`
    }
  }
  const failed = d.failedPhotos
    ? `<div style="margin:4px 5px 0;padding:10px 14px;border-radius:10px;background:#fff7ed;border:1px solid #fed7aa;font-family:${font};font-size:13px;color:#9a3412">&#9888; ${d.failedPhotos} photo(s) could not upload. The client may send them by WhatsApp.</div>`
    : ''

  const step = (n, title, desc) => `<tr><td width="42" style="vertical-align:top;padding:0 0 14px"><div style="width:30px;height:30px;line-height:30px;border-radius:50%;background:${brand};color:${forestDeep};text-align:center;font-family:${font};font-weight:800;font-size:14px">${n}</div></td>
    <td style="vertical-align:top;padding:4px 0 14px;font-family:${font}"><div style="font-size:15px;font-weight:700;color:${ink}">${title}</div><div style="font-size:13px;color:${muted};margin-top:2px;line-height:1.5">${desc}</div></td></tr>`

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>New estimate request</title></head>
<body style="margin:0;padding:0;background:#e6f2ee;-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e6f2ee"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(7,40,34,.18)">

  <!-- HERO -->
  <tr><td bgcolor="${forest}" style="background:${forest};background-image:linear-gradient(135deg,#124a40 0%,${forest} 45%,${forestDeep} 100%);padding:28px 32px 26px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle"><a href="${SITE}" target="_blank"><img src="${SITE}/img/brand/email-logo.png" width="190" alt="Colores Santos Painting &amp; Finishes" style="display:block;width:190px;height:auto;border:0"></a></td>
      <td align="right" style="vertical-align:middle"><span style="display:inline-block;padding:7px 14px;border-radius:999px;background:${brand};color:${forestDeep};font-family:${font};font-size:11px;font-weight:800;letter-spacing:2px">NEW LEAD</span></td>
    </tr></table>
    <div style="height:1px;line-height:1px;font-size:0;background:#1d5c50;margin:22px 0">&nbsp;</div>
    <div style="font-family:${font};font-size:12px;letter-spacing:2.5px;font-weight:800;color:${brand}">ESTIMATE REQUEST</div>
    <div style="font-family:${font};font-size:30px;line-height:1.15;font-weight:800;color:#ffffff;margin-top:6px">${esc(d.name)}</div>
    <div style="font-family:${font};font-size:14px;color:#b5d6cd;margin-top:8px">&#128205; ${esc(d.city || 'Area not specified')} &nbsp;&nbsp;·&nbsp;&nbsp; &#128339; ${esc(when)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr>
      ${stat(d.services.length || '–', d.services.length === 1 ? 'Service' : 'Services')}
      ${stat(d.photos.length, d.photos.length === 1 ? 'Photo' : 'Photos')}
      ${stat(`<span style="font-size:15px">${esc(d.type || 'Residential')}</span>`, 'Property')}
    </tr></table>
  </td></tr>
  <tr><td height="5" style="height:5px;background:${brand};background-image:linear-gradient(90deg,${brandDark},${brand},#5ddfba);font-size:0;line-height:0">&nbsp;</td></tr>

  <!-- QUICK ACTIONS -->
  <tr><td style="padding:24px 27px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    ${action(replyHref, '&#9993;&nbsp; Reply', brand, forestDeep)}
    ${action(`https://wa.me/${waNumber(d.phone)}?text=${greet}`, 'WhatsApp', '#25D366', '#ffffff')}
    ${action(`tel:${esc(tel)}`, '&#9742;&nbsp; Call', '#ffffff', ink, '#d5e0dc')}
  </tr></table></td></tr>

  <!-- CLIENT -->
  ${section('Client', `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px"><tr>
      <td width="66" style="vertical-align:middle"><div style="width:52px;height:52px;line-height:52px;border-radius:50%;background:${forest};color:${brand};text-align:center;font-family:${font};font-weight:800;font-size:19px">${esc(initials)}</div></td>
      <td style="vertical-align:middle;font-family:${font}"><div style="font-size:18px;font-weight:800;color:${ink}">${esc(d.name)}</div><div style="font-size:13px;color:${muted};margin-top:2px">Wants the personalized estimate by email</div></td>
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${field('Phone', `<a href="tel:${esc(tel)}" style="color:${ink};text-decoration:none">${esc(d.phone)}</a>`)}
      ${field('Email', `<a href="mailto:${esc(d.email)}" style="color:${brandDark};text-decoration:none">${esc(d.email)}</a>`)}
    </tr><tr>
      ${field('City / Area', esc(d.city))}
      ${field('Property type', esc(d.type))}
    </tr></table>`, '28px 26px 0')}

  <!-- SERVICES -->
  ${section('Services requested', pills, '22px 32px 0')}

  <!-- DETAILS -->
  ${section('Project details', `<div style="border-left:4px solid ${brand};background:#f6faf9;border-radius:0 14px 14px 0;padding:16px 18px;font-family:${font};font-size:15px;line-height:1.65;color:${ink};white-space:pre-wrap">${d.message ? esc(d.message) : `<span style="color:${muted}">No details provided.</span>`}</div>`, '20px 32px 0')}

  <!-- PHOTOS -->
  ${section(`Photos &nbsp;<span style="color:${muted};letter-spacing:0">(${d.photos.length})</span>`, gallery + failed, '26px 27px 0')}

  <!-- NEXT STEPS -->
  <tr><td style="padding:26px 32px 0"><div style="background:#f0fbf7;border:1px solid #c9f5e6;border-radius:18px;padding:22px 22px 8px">
    ${label('Next steps')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${step(1, 'Review the photos &amp; details', 'Contact the client if you need measurements or a site visit.')}
      ${step(2, 'Prepare the itemized quote', 'Scope, materials, timeline and price.')}
      ${step(3, 'Send before &amp; after images', `Email the personalized estimate to <b style="color:${ink}">${esc(d.email)}</b>.`)}
    </table>
  </div></td></tr>

  <!-- CTA -->
  <tr><td align="center" style="padding:26px 32px 32px">
    <a href="${replyHref}" target="_blank" style="display:inline-block;padding:16px 30px;border-radius:14px;background:${forest};color:#ffffff;font-family:${font};font-size:15px;font-weight:800;text-decoration:none">Send personalized estimate &rarr;</a>
  </td></tr>

  <!-- FOOTER -->
  <tr><td bgcolor="${forestDeep}" style="background:${forestDeep};padding:20px 32px;font-family:${font};font-size:12px;color:#8fb3a9;line-height:1.6">
    <b style="color:#ffffff">Colores Santos</b> · Painting &amp; Finishes · Miami, FL<br>
    Sent automatically from the estimate form at <a href="${SITE}/contact" target="_blank" style="color:${brand};text-decoration:none">${SITE.replace(/^https?:\/\//, '')}</a>
  </td></tr>
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
