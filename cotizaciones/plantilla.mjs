// Plantilla HTML de la cotización / propuesta (se imprime a PDF con generar.mjs).
// Recibe los datos del cliente (JSON), las imágenes de marca en base64 y los datos de la empresa.
// Todos los bloques son opcionales: si un campo no está en el JSON, esa parte no aparece.

const T = {
  es: {
    doc: 'Cotización', num: 'N.º', fecha: 'Fecha', valida: 'Válida hasta',
    cliente: 'Preparada para', atencion: 'Atención', proyecto: 'Proyecto', direccion: 'Dirección',
    precios: 'Detalle de precios', item: 'Descripción', cant: 'Cant.', unidad: 'Unidad', precio: 'Precio unit.', total: 'Importe',
    subtotal: 'Subtotal', descuento: 'Descuento', totalFinal: 'Total',
    alcance: 'Alcance del trabajo', sistema: 'Sistema de recubrimiento', colores: 'Colores',
    cronograma: 'Cronograma y pagos', pagos: 'Forma de pago',
    incluye: 'Incluye', noIncluye: 'No incluye', condiciones: 'Condiciones',
    seguro: 'Seguro', garantia: 'Garantía', noCubre: 'La garantía no cubre', notas: 'Notas', aceptacion: 'Aprobación',
    aceptacionTxt: 'Al firmar, el cliente acepta el alcance, precios y condiciones descritos en esta cotización.',
    firmaCliente: 'Firma del cliente', fechaFirma: 'Fecha',
    gracias: '¡Gracias por confiar en nosotros!', licencia: 'Licenciados y asegurados', pagina: 'Página',
  },
  en: {
    doc: 'Estimate', num: 'No.', fecha: 'Date', valida: 'Valid until',
    cliente: 'Prepared for', atencion: 'Attention', proyecto: 'Project', direccion: 'Address',
    precios: 'Itemized pricing', item: 'Description', cant: 'Qty', unidad: 'Unit', precio: 'Unit price', total: 'Amount',
    subtotal: 'Subtotal', descuento: 'Discount', totalFinal: 'Total',
    alcance: 'Scope of work', sistema: 'Proposed coating system', colores: 'Color identification',
    cronograma: 'Schedule & payment', pagos: 'Payment schedule',
    incluye: 'Included', noIncluye: 'Not included', condiciones: 'Conditions',
    seguro: 'Insurance', garantia: 'Warranty', noCubre: 'This warranty does not cover', notas: 'Notes', aceptacion: 'Approval',
    aceptacionTxt: 'By signing, the client accepts the scope, pricing and terms described in this document.',
    firmaCliente: 'Client signature', fechaFirma: 'Date',
    gracias: 'Thank you for your trust!', licencia: 'Licensed & insured', pagina: 'Page',
  },
}

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
const qty = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)

export function calcular(d) {
  const secciones = (d.secciones || []).map((s) => {
    const items = (s.items || []).map((it) => ({ ...it, cantidad: it.cantidad ?? 1, importe: (it.cantidad ?? 1) * (it.precio || 0) }))
    return { ...s, items, total: items.reduce((a, i) => a + i.importe, 0) }
  })
  const subtotal = secciones.reduce((a, s) => a + s.total, 0)
  let descuento = 0
  if (d.descuento?.valor) descuento = d.descuento.tipo === 'monto' ? d.descuento.valor : (subtotal * d.descuento.valor) / 100
  const base = subtotal - descuento
  const impuesto = d.impuesto?.porcentaje ? (base * d.impuesto.porcentaje) / 100 : 0
  return { secciones, subtotal, descuento, impuesto, total: base + impuesto }
}

function fmtFecha(iso, lang) {
  if (!iso) return ''
  const dt = new Date(iso + 'T12:00:00')
  return dt.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const ICON = {
  check: `<svg viewBox="0 0 12 12"><path d="M3 6.2l2 2 4-4.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
  alert: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5"/><path d="M12 16.6v.1"/></svg>`,
}

export function render(d, img, empresa) {
  const lang = d.idioma === 'en' ? 'en' : 'es'
  const t = { ...T[lang], ...(d.textos || {}) }
  const c = calcular(d)
  const cli = d.cliente || {}
  const pro = d.proyecto || {}
  const vence = d.fecha && d.validezDias
    ? new Date(new Date(d.fecha + 'T12:00:00').getTime() + d.validezDias * 864e5).toISOString().slice(0, 10)
    : null
  const variasSecciones = c.secciones.length > 1
  const conUnidad = c.secciones.some((s) => s.items.some((i) => i.unidad))
  const cols = conUnidad ? 5 : 4

  let n = 0
  const h2 = (titulo) => `<h2 class="sh"><span class="sh-n">${String(++n).padStart(2, '0')}</span>${esc(titulo)}</h2>`
  const lista = (arr, cls) => `<ul class="${cls}">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
  const aviso = (a) => a ? `<div class="aviso"><span class="aviso-i">${ICON.alert}</span><div>${a.titulo ? `<strong>${esc(a.titulo)}</strong> ` : ''}${esc(a.texto || a)}</div></div>` : ''

  const filas = c.secciones.map((s, si) => `<tbody class="grp">
    ${s.titulo ? `<tr class="sec"><td colspan="${cols}"><span class="sec-n">${String(si + 1).padStart(2, '0')}</span>${esc(s.titulo)}${variasSecciones ? `<span class="sec-t">${money(s.total)}</span>` : ''}</td></tr>` : ''}
    ${s.items.map((it) => `
      <tr class="it">
        <td class="desc"><strong>${esc(it.descripcion)}</strong>${it.detalle ? `<span>${esc(it.detalle)}</span>` : ''}</td>
        <td class="num">${qty(it.cantidad)}</td>
        ${conUnidad ? `<td class="u">${esc(it.unidad || '')}</td>` : ''}
        <td class="num">${money(it.precio)}</td>
        <td class="num strong">${money(it.importe)}</td>
      </tr>`).join('')}</tbody>`).join('')

  const pagos = (d.pagos || []).map((p) => {
    const monto = p.monto ?? (c.total * (p.porcentaje || 0)) / 100
    return `<div class="pago"><span class="pago-pc">${p.porcentaje != null ? p.porcentaje + '%' : ''}</span><span class="pago-c"><b>${esc(p.concepto)}</b>${p.detalle ? `<small>${esc(p.detalle)}</small>` : ''}</span><span class="pago-m">${money(monto)}</span></div>`
  }).join('')

  const resumen = (d.resumen || []).map((r, i) => `<div class="kf ${i === 0 ? 'kf-main' : ''}"><span>${esc(r.etiqueta)}</span><b>${esc(r.valor === 'TOTAL' ? money(c.total) : r.valor)}</b>${r.nota ? `<small>${esc(r.nota)}</small>` : ''}</div>`).join('')

  // ---------- secciones numeradas ----------
  const sPrecios = c.secciones.length ? `<section class="sect">
    ${h2(d.titulosSeccion?.precios || t.precios)}
    <table>
      <colgroup><col><col class="c-q">${conUnidad ? '<col class="c-u">' : ''}<col class="c-p"><col class="c-t"></colgroup>
      <thead><tr><th>${t.item}</th><th class="num">${t.cant}</th>${conUnidad ? `<th>${t.unidad}</th>` : ''}<th class="num">${t.precio}</th><th class="num">${t.total}</th></tr></thead>
      ${filas}
    </table>
    <div class="totals-row">
      <div class="tot-note">${d.notaPrecios ? `<p>${esc(d.notaPrecios)}</p>` : ''}</div>
      <div class="totals">
        ${c.descuento || c.impuesto ? `<div class="r"><span>${t.subtotal}</span><span>${money(c.subtotal)}</span></div>` : ''}
        ${c.descuento ? `<div class="r dis"><span>${t.descuento}${d.descuento.concepto ? ' · ' + esc(d.descuento.concepto) : d.descuento.tipo !== 'monto' ? ` (${d.descuento.valor}%)` : ''}</span><span>− ${money(c.descuento)}</span></div>` : ''}
        ${c.impuesto ? `<div class="r"><span>${esc(d.impuesto.nombre || 'Tax')} (${d.impuesto.porcentaje}%)</span><span>${money(c.impuesto)}</span></div>` : ''}
        <div class="grand"><span class="lbl">${esc(d.etiquetaTotal || t.totalFinal)}</span><span class="amt">${money(c.total)}</span></div>
      </div>
    </div>
  </section>` : ''

  const sAlcance = (d.alcance || []).map((a) => `<section class="sect">
    ${h2(a.titulo || t.alcance)}
    ${a.texto ? `<p class="lead">${esc(a.texto)}</p>` : ''}
    ${a.pasos?.length ? `<ol class="steps">${a.pasos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>` : ''}
    ${a.notas?.length ? a.notas.map((x) => `<p class="small">${esc(x)}</p>`).join('') : ''}
    ${a.excluye?.length ? `<div class="excl"><h3>${t.noIncluye}</h3>${lista(a.excluye, 'no')}</div>` : ''}
    ${aviso(a.aviso)}
  </section>`).join('')

  const sSistema = d.sistema ? `<section class="sect">
    ${h2(d.sistema.titulo || t.sistema)}
    <div class="sys">${(d.sistema.productos || []).map((p) => `
      <div class="sys-c">
        <span class="sys-k">${esc(p.uso)}</span>
        <b>${esc(p.producto)}</b>
        ${p.familia ? `<span class="chip">${esc(p.familia)}</span>` : ''}
        ${p.nota ? `<small>${esc(p.nota)}</small>` : ''}
      </div>`).join('')}
    </div>
    ${d.sistema.colores?.length ? `<h3 class="sub">${t.colores}</h3><div class="swatches">${d.sistema.colores.map((x) => `
      <div class="sw"><span class="sw-dot" style="background:${esc(x.muestra || '#ccc')}"></span><div><b>${esc(x.superficie)}</b><small>${esc(x.color)}</small></div></div>`).join('')}</div>` : ''}
    ${d.sistema.nota ? `<p class="small">${esc(d.sistema.nota)}</p>` : ''}
  </section>` : ''

  const sCrono = (d.cronograma?.length || pagos) ? `<section class="sect">
    ${h2(d.titulosSeccion?.cronograma || t.cronograma)}
    <div class="crono">
      ${d.cronograma?.length ? `<div class="tl">${d.cronograma.map((x) => `<div class="tl-i"><span class="tl-d"></span><div><b>${esc(x.etiqueta)}</b><p>${esc(x.texto)}</p></div></div>`).join('')}</div>` : ''}
      ${pagos ? `<div class="pagos"><h3>${t.pagos}</h3>${pagos}</div>` : ''}
    </div>
  </section>` : ''

  const sIncluye = (d.incluye?.length || d.noIncluye?.length) ? `<section class="sect">
    ${h2(d.titulosSeccion?.incluye || t.condiciones)}
    <div class="two">
      ${d.incluye?.length ? `<div><h3 class="sub">${t.incluye}</h3>${lista(d.incluye, 'si')}</div>` : ''}
      ${d.noIncluye?.length ? `<div><h3 class="sub">${t.noIncluye}</h3>${lista(d.noIncluye, 'no')}</div>` : ''}
    </div>
  </section>` : ''

  const sg = d.seguro
  const sSeguro = sg ? `<section class="sect">
    ${h2(sg.titulo || t.seguro)}
    <div class="ins">
      <div class="ins-head">
        <span class="shield">${ICON.shield}</span>
        <div><b>${esc(sg.tipo)}</b><p>${esc(sg.aseguradora)}${sg.poliza ? ` · Policy ${esc(sg.poliza)}` : ''}</p></div>
        ${sg.vigencia ? `<div class="ins-v"><span>${esc(sg.vigenciaEtiqueta || 'Policy period')}</span><b>${esc(sg.vigencia)}</b></div>` : ''}
      </div>
      <div class="ins-lim">${(sg.limites || []).map((l) => `<div><span>${esc(l.etiqueta)}</span><b>${esc(l.monto)}</b></div>`).join('')}</div>
    </div>
    ${sg.nota ? `<p class="small">${esc(sg.nota)}</p>` : ''}
  </section>` : ''

  const g = typeof d.garantia === 'string' ? { texto: d.garantia } : d.garantia
  const sGarantia = g ? `<section class="sect">
    ${h2(g.titulo || t.garantia)}
    <div class="warranty">
      <span class="shield">${ICON.shield}</span>
      <div>
        ${g.destacado ? `<div class="w-big">${esc(g.destacado)}</div>` : ''}
        <p>${esc(g.texto)}</p>
      </div>
    </div>
    ${g.noCubre?.length ? `<div class="excl"><h3>${t.noCubre}</h3>${lista(g.noCubre, 'no cols')}</div>` : ''}
    ${g.nota ? `<p class="small">${esc(g.nota)}</p>` : ''}
  </section>` : ''

  const sNotas = d.notas ? `<section class="sect">${h2(t.notas)}<p class="lead" style="white-space:pre-line">${esc(d.notas)}</p></section>` : ''

  const ap = d.aprobacion || {}
  const firmas = ap.firmas || [`${t.firmaCliente}${cli.nombre ? ' · ' + cli.nombre : ''}`, empresa.name]
  const sAprob = `<section class="sect sign-wrap">
    ${h2(ap.titulo || t.aceptacion)}
    <div class="sign">
      <p>${esc(ap.texto || t.aceptacionTxt)}</p>
      <div class="sig-grid">
        ${firmas.map((f) => `<div class="sig">${esc(f)}</div>`).join('')}
        <div class="sig">${t.fechaFirma}</div>
      </div>
    </div>
  </section>`

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${esc(d.tituloDocumento || t.doc)} ${esc(d.numero || '')} · ${esc(cli.nombre || '')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=block" rel="stylesheet">
<style>
  :root {
    --b50:#e9fbf5; --b100:#c9f5e6; --b200:#96ebd2; --b300:#5ddfba; --b400:#1fd8a6; --b500:#12c193; --b600:#0ea37c; --b700:#0c8566;
    --ink:#0d1412; --f700:#124a40; --f800:#0e3d35; --f900:#0b3a32; --f950:#072822; --mist:#eef8f5; --muted:#5b6b67; --body:#33423e; --line:#dbe7e3;
  }
  @page { size: letter; margin: 14mm 0 16mm;
    @bottom-left { content: "${esc(empresa.name)} · ${esc(empresa.phone)} · ${esc(empresa.email)}"; font: 600 7.5pt 'Plus Jakarta Sans', sans-serif; color: #6f7f7b; padding-left: 16mm; }
    @bottom-right { content: "${esc(cli.corto || cli.nombre || '')}  ·  ${t.pagina} " counter(page) " / " counter(pages); font: 600 7.5pt 'Plus Jakarta Sans', sans-serif; color: #6f7f7b; padding-right: 16mm; }
  }
  @page :first { margin-top: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; color: var(--ink); font-size: 9.3pt; line-height: 1.5;
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  h1, h2, h3, .display { font-family: 'Outfit', sans-serif; letter-spacing: -0.01em; margin: 0; }
  p { margin: 0; }
  .wrap { padding: 0 16mm; }

  /* ---------- Header ---------- */
  .hero { position: relative; background: radial-gradient(120% 140% at 0% 0%, #124a40 0%, #0b3a32 45%, #072822 100%); color: #fff;
    padding: 12mm 16mm 11mm; overflow: hidden; }
  .hero::after { content: ""; position: absolute; inset: 0; opacity: .5; background-image:
    radial-gradient(circle at 20% 30%, rgb(255 255 255 / .05) 0 1.5px, transparent 2.5px), radial-gradient(circle at 70% 60%, rgb(0 0 0 / .12) 0 1.5px, transparent 2.5px);
    background-size: 16px 16px, 21px 21px; }
  .hero-in { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; }
  .stripe { height: 5px; background: linear-gradient(90deg, #0ea37c, #12c193 45%, #1fd8a6 75%, #96ebd2); }

  .logo { display: flex; align-items: center; gap: 10px; }
  .logo img.roller { height: 74px; width: auto; transform: rotate(-8deg); filter: drop-shadow(0 4px 6px rgb(0 0 0 / .35)); }
  .logo-t { display: flex; flex-direction: column; align-items: flex-start; font-family: 'Outfit', sans-serif; }
  .logo-col { font-size: 25px; font-weight: 800; line-height: .92; letter-spacing: -.02em; color: #fff; }
  .logo-san { position: relative; margin-top: 3px; padding: 3px 13px 2px 9px; }
  .logo-san img { position: absolute; left: -8px; top: -5px; width: calc(100% + 24px); height: calc(100% + 12px); object-fit: fill; }
  .logo-san b { position: relative; display: block; font-size: 25px; font-weight: 900; line-height: .95; color: #072822; letter-spacing: -.01em; }
  .logo-tag { margin-top: 7px; font-size: 7.6px; font-weight: 700; letter-spacing: .32em; color: #b8f3e1; opacity: .85; white-space: nowrap; }

  .doc-meta { text-align: right; }
  .doc-kicker { display: inline-block; font: 700 7.3pt 'Plus Jakarta Sans'; letter-spacing: .22em; text-transform: uppercase; color: var(--b300);
    border: 1px solid rgb(93 223 186 / .45); border-radius: 99px; padding: 3px 10px; margin-bottom: 7px; }
  .doc-meta h1 { font-size: 30pt; font-weight: 800; line-height: 1; color: #fff; text-transform: uppercase; letter-spacing: .01em; }
  .doc-meta dl { margin: 9px 0 0; display: grid; grid-template-columns: auto auto; gap: 2px 12px; justify-content: end; font-size: 8.5pt; }
  .doc-meta dt { color: var(--b200); opacity: .85; }
  .doc-meta dd { margin: 0; font-weight: 700; color: #fff; text-align: right; }

  /* ---------- Parties ---------- */
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 8mm; }
  .card { border: 1px solid var(--line); border-radius: 10px; padding: 11px 14px 12px; }
  .card.acc { background: var(--mist); border-color: #cfeee3; }
  .label { font: 700 7pt 'Plus Jakarta Sans'; letter-spacing: .2em; text-transform: uppercase; color: var(--b600); margin-bottom: 5px; }
  .card h3 { font-size: 13pt; font-weight: 700; color: var(--f950); margin-bottom: 3px; line-height: 1.2; }
  .card p { margin: 1px 0; color: var(--body); }
  .card .muted { color: var(--muted); }

  /* ---------- Key facts ---------- */
  .kfs { display: grid; grid-template-columns: 1.25fr 1fr 1fr 1fr; gap: 3mm; margin-top: 5mm; }
  .kf { border: 1px solid var(--line); border-radius: 10px; padding: 9px 12px; display: flex; flex-direction: column; gap: 1px; }
  .kf span { font: 700 6.6pt 'Plus Jakarta Sans'; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
  .kf b { font: 700 12pt 'Outfit'; color: var(--f950); line-height: 1.2; }
  .kf small { font-size: 7.6pt; color: var(--muted); line-height: 1.3; }
  .kf-main { background: linear-gradient(120deg, #072822, #0e3d35 65%, #0c8566); border: 0; }
  .kf-main span { color: var(--b200); } .kf-main b { color: #fff; font-size: 17pt; } .kf-main small { color: var(--b100); }

  /* ---------- Sections ---------- */
  .sect { margin-top: 8mm; }
  .sh { display: flex; align-items: center; gap: 9px; font-size: 13.5pt; font-weight: 700; color: var(--f950); margin-bottom: 9px;
    padding-bottom: 7px; border-bottom: 1px solid var(--line); break-after: avoid; }
  .sh-n { font: 800 8.5pt 'Outfit'; color: #fff; background: linear-gradient(135deg, #12c193, #0c8566); border-radius: 6px; padding: 2px 7px; letter-spacing: .02em; }
  .sub, .pagos h3, .excl h3 { font: 700 7pt 'Plus Jakarta Sans'; letter-spacing: .2em; text-transform: uppercase; color: var(--b600); margin: 0 0 6px; }
  .lead { color: var(--body); }
  .small { color: var(--muted); font-size: 8.4pt; margin-top: 7px; }

  /* steps */
  .steps { list-style: none; counter-reset: st; margin: 9px 0 0; padding: 0; columns: 2; column-gap: 7mm; break-inside: avoid; }
  .steps li { counter-increment: st; position: relative; padding-left: 26px; margin-bottom: 6px; min-height: 20px; color: var(--body); break-inside: avoid; }
  .steps li::before { content: counter(st); position: absolute; left: 0; top: 0; width: 18px; height: 18px; border-radius: 50%;
    background: var(--b50); border: 1px solid var(--b200); color: var(--b700); font: 800 8pt/16px 'Outfit'; text-align: center; }

  .aviso { display: flex; gap: 10px; margin-top: 9px; padding: 10px 13px; border-radius: 10px; background: #fbf8ef; border: 1px solid #efe3bf; color: #4d4326; font-size: 8.6pt; break-inside: avoid; }
  .aviso-i { flex: none; color: #b7891c; margin-top: 1px; }
  .aviso strong { color: #3a3015; }
  .excl { margin-top: 9px; }

  /* ---------- Table ---------- */
  table { width: 100%; border-collapse: separate; border-spacing: 0; }
  thead { display: table-header-group; }
  thead th { background: var(--f950); color: #fff; font: 700 7.2pt 'Plus Jakarta Sans'; letter-spacing: .14em; text-transform: uppercase;
    text-align: left; padding: 8px 10px; white-space: nowrap; }
  thead th.num { text-align: right; }
  tr, tbody.grp { break-inside: avoid; }
  tr.sec td { padding: 13px 10px 6px; font: 700 10.5pt 'Outfit'; color: var(--f950); border-bottom: 2px solid var(--b400); }
  .sec-n { display: inline-block; font-size: 8pt; font-weight: 800; color: var(--b600); background: var(--b50); border-radius: 5px; padding: 1px 6px; margin-right: 8px; vertical-align: 1px; }
  .sec-t { float: right; font-size: 9.5pt; color: var(--f700); }
  tr.it td { padding: 10px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  tbody.grp tr.it:nth-child(even) td { background: #fafdfc; }
  td.desc strong { display: block; font-weight: 600; color: var(--ink); }
  td.desc span { display: block; color: var(--muted); font-size: 8.2pt; margin-top: 1px; }
  td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  td.u { color: var(--muted); white-space: nowrap; }
  td.strong { font-weight: 700; color: var(--f950); }
  col.c-q { width: 8%; } col.c-u { width: 10%; } col.c-p { width: 15%; } col.c-t { width: 16%; }

  .totals-row { display: grid; grid-template-columns: 1fr 78mm; gap: 8mm; margin-top: 5mm; break-inside: avoid; align-items: center; }
  .tot-note p { color: var(--muted); font-size: 8.4pt; }
  .totals { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
  .totals .r { display: flex; justify-content: space-between; padding: 7px 14px; font-variant-numeric: tabular-nums; }
  .totals .r + .r { border-top: 1px solid var(--line); }
  .totals .r span:first-child { color: var(--muted); }
  .totals .r.dis span:last-child { color: var(--b700); font-weight: 600; }
  .totals .grand { background: linear-gradient(110deg, #072822, #0e3d35 60%, #0c8566); color: #fff; padding: 12px 14px; display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
  .grand .lbl { font: 700 7.4pt 'Plus Jakarta Sans'; letter-spacing: .16em; text-transform: uppercase; color: var(--b200); }
  .grand .amt { font: 800 19pt 'Outfit'; letter-spacing: -.01em; white-space: nowrap; }

  /* ---------- Coating system ---------- */
  .sys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
  .sys-c { border: 1px solid var(--line); border-top: 3px solid var(--b500); border-radius: 8px; padding: 9px 11px; display: flex; flex-direction: column; gap: 3px; break-inside: avoid; }
  .sys-k { font: 700 6.8pt 'Plus Jakarta Sans'; letter-spacing: .18em; text-transform: uppercase; color: var(--b600); }
  .sys-c b { font: 700 10pt 'Outfit'; color: var(--f950); line-height: 1.25; }
  .chip { align-self: flex-start; font: 700 7pt 'Plus Jakarta Sans'; color: var(--f700); background: var(--mist); border-radius: 99px; padding: 1px 8px; }
  .sys-c small { color: var(--muted); font-size: 7.8pt; line-height: 1.35; }
  .swatches { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
  .sub { margin-top: 12px; }
  .sw { display: flex; gap: 9px; align-items: center; background: var(--mist); border-radius: 8px; padding: 8px 11px; }
  .sw-dot { flex: none; width: 22px; height: 22px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgb(0 0 0 / .12), 0 1px 2px rgb(0 0 0 / .1); }
  .sw b { display: block; font: 700 9pt 'Outfit'; color: var(--f950); } .sw small { color: var(--muted); font-size: 7.8pt; }

  /* ---------- Schedule & payment ---------- */
  .crono { break-inside: avoid; display: grid; grid-template-columns: 1.1fr 1fr; gap: 9mm; align-items: start; }
  .tl-i { position: relative; display: flex; gap: 11px; padding-bottom: 9px; break-inside: avoid; }
  .tl-i:not(:last-child)::before { content: ""; position: absolute; left: 5px; top: 13px; bottom: -1px; width: 2px; background: var(--b100); }
  .tl-d { flex: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 3px solid var(--b500); margin-top: 3px; }
  .tl-i b { display: block; font: 700 9.6pt 'Outfit'; color: var(--f950); }
  .tl-i p { color: var(--body); font-size: 8.5pt; }
  .pago { display: grid; grid-template-columns: 44px 1fr auto; align-items: center; gap: 9px; padding: 8px 0; border-bottom: 1px dashed var(--line); }
  .pago-pc { font: 800 10pt 'Outfit'; color: var(--f950); background: var(--b50); border-radius: 6px; text-align: center; padding: 3px 0; }
  .pago-c b { display: block; font-weight: 600; color: var(--ink); } .pago-c small { color: var(--muted); font-size: 7.8pt; }
  .pago-m { font: 700 11pt 'Outfit'; color: var(--f950); font-variant-numeric: tabular-nums; }

  /* ---------- Lists ---------- */
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
  ul { margin: 0; padding: 0; list-style: none; }
  ul li { position: relative; padding-left: 17px; margin: 3px 0; color: var(--body); break-inside: avoid; }
  ul.cols { columns: 2; column-gap: 8mm; }
  ul.si li::before { content: ""; position: absolute; left: 0; top: 3.5px; width: 11px; height: 11px; border-radius: 50%; background: var(--b500)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 6.2l2 2 4-4.4' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/9px no-repeat; }
  ul.no li::before { content: ""; position: absolute; left: 2px; top: 8px; width: 7px; height: 2px; border-radius: 2px; background: #9aa5a2; }

  /* ---------- Warranty ---------- */
  .warranty { display: flex; gap: 13px; align-items: flex-start; background: var(--mist); border-radius: 10px; padding: 12px 15px; break-inside: avoid; }
  .shield { flex: none; width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, #12c193, #0c8566); display: grid; place-items: center; }
  .w-big { font: 700 11pt 'Outfit'; color: var(--f950); margin-bottom: 2px; }
  .warranty p { color: var(--body); }

  /* ---------- Insurance ---------- */
  .ins { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; break-inside: avoid; }
  .ins-head { display: flex; align-items: center; gap: 12px; padding: 11px 15px; background: var(--mist); }
  .ins-head > div:nth-child(2) { flex: 1; }
  .ins-head b { font: 700 11pt 'Outfit'; color: var(--f950); } .ins-head p { color: var(--muted); font-size: 8.4pt; }
  .ins-v { text-align: right; } .ins-v span { display: block; font: 700 6.6pt 'Plus Jakarta Sans'; letter-spacing: .18em; text-transform: uppercase; color: var(--b600); }
  .ins-v b { font-size: 10pt; }
  .ins-lim { display: grid; grid-template-columns: repeat(3, 1fr); }
  .ins-lim div { padding: 9px 15px; border-top: 1px solid var(--line); }
  .ins-lim div:not(:nth-child(3n+1)) { border-left: 1px solid var(--line); }
  .ins-lim span { display: block; font-size: 7.6pt; color: var(--muted); } .ins-lim b { font: 700 11.5pt 'Outfit'; color: var(--f950); }

  /* ---------- Sign ---------- */
  .sign-wrap { break-inside: avoid; }
  .sign { border: 1px solid var(--line); border-radius: 12px; padding: 13px 16px 16px; }
  .sign p { color: var(--body); }
  .sig-grid { display: grid; grid-template-columns: 1.4fr 1.2fr .7fr; gap: 9mm; margin-top: 12mm; }
  .sig { border-top: 1.5px solid var(--f950); padding-top: 5px; font-size: 7.8pt; color: var(--muted); font-weight: 600; }

  .thanks { margin-top: 6mm; display: flex; align-items: center; justify-content: space-between; break-inside: avoid; }
  .thanks .display { font-size: 15pt; font-weight: 800; color: var(--f950); }
  .thanks .display em { font-style: normal; color: var(--b600); }
  .contact { text-align: right; font-size: 8.5pt; color: var(--body); line-height: 1.6; }
  .contact b { color: var(--f950); }
  .badge { display: inline-flex; align-items: center; gap: 5px; margin-top: 3px; font: 700 7pt 'Plus Jakarta Sans'; letter-spacing: .14em; text-transform: uppercase;
    color: var(--b700); background: var(--b50); border-radius: 99px; padding: 3px 9px; }
</style>
</head>
<body>

<header>
  <div class="hero">
    <div class="hero-in">
      <div class="logo">
        <img class="roller" src="${img.roller}" alt="">
        <div class="logo-t">
          <span class="logo-col">COLORES</span>
          <span class="logo-san"><img src="${img.stroke}" alt=""><b>SANTOS</b></span>
          <span class="logo-tag">PAINTING &amp; FINISHES</span>
        </div>
      </div>
      <div class="doc-meta">
        <span class="doc-kicker">${esc(d.subtituloDocumento || empresa.tagline)}</span>
        <h1>${esc(d.tituloDocumento || t.doc)}</h1>
        <dl>
          ${d.numero ? `<dt>${t.num}</dt><dd>${esc(d.numero)}</dd>` : ''}
          <dt>${t.fecha}</dt><dd>${fmtFecha(d.fecha, lang)}</dd>
          ${vence ? `<dt>${t.valida}</dt><dd>${fmtFecha(vence, lang)}</dd>` : ''}
        </dl>
      </div>
    </div>
  </div>
  <div class="stripe"></div>
</header>

<main class="wrap">
  <section class="parties">
    <div class="card acc">
      <div class="label">${t.cliente}</div>
      <h3>${esc(cli.nombre || '')}</h3>
      ${cli.atencion ? `<p><span class="muted">${t.atencion}:</span> <strong>${esc(cli.atencion)}</strong></p>` : ''}
      ${cli.empresa ? `<p><strong>${esc(cli.empresa)}</strong></p>` : ''}
      ${cli.direccion ? `<p>${esc(cli.direccion)}</p>` : ''}
      ${cli.telefono ? `<p>${esc(cli.telefono)}</p>` : ''}
      ${cli.email ? `<p>${esc(cli.email)}</p>` : ''}
    </div>
    <div class="card">
      <div class="label">${t.proyecto}</div>
      <h3>${esc(pro.titulo || '')}</h3>
      ${pro.direccion ? `<p>${esc(pro.direccion)}</p>` : ''}
      ${pro.descripcion ? `<p class="muted" style="margin-top:4px">${esc(pro.descripcion)}</p>` : ''}
    </div>
  </section>

  ${resumen ? `<section class="kfs">${resumen}</section>` : ''}

  ${sPrecios}
  ${sAlcance}
  ${sSistema}
  ${sCrono}
  ${sIncluye}
  ${sSeguro}
  ${sGarantia}
  ${sNotas}
  ${sAprob}

  <section class="thanks">
    <div>
      <div class="display">${t.gracias.replace(/(\S+!?)$/, '<em>$1</em>')}</div>
      <span class="badge">● ${t.licencia} · ${esc(empresa.area)}</span>
    </div>
    <div class="contact">
      <b>${esc(empresa.name)}</b><br>${esc(empresa.phone)} · ${esc(empresa.email)}<br>${esc(empresa.web)}
    </div>
  </section>
</main>
</body>
</html>`
}
