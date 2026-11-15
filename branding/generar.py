# Genera las versiones del isotipo de Colores Santos (rodillo) en SVG + PNG
# y una lámina de revisión en PDF.
#   python branding/generar.py
# Sale en branding/isotipo/ (SVG, PNG 2048 px) y branding/isotipo-revision.pdf
# Requiere PyMuPDF (pip install pymupdf) y Edge o Chrome para la lámina.
import os, subprocess, tempfile, shutil, pathlib
import pymupdf as fitz

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'isotipo'
OUT.mkdir(exist_ok=True)

SALVIA, GRAFITO, BLANCO, GRIS = '#9ACDA8', '#0B0B0B', '#FFFFFF', '#E9EDEB'

# Geometría del rodillo (la misma que public/img/brand/roller-mark.svg y Logo.jsx)
BOX = (88, 195, 124, 136)  # x, y, w, h
CX, CY = BOX[0] + BOX[2] / 2, BOX[1] + BOX[3] / 2


def rodillo(color):
    return (f'<g fill="{color}"><rect x="92" y="199" width="100" height="31" rx="5.5"/>'
            f'<path d="M188 213H197Q205 213 205 221V234Q205 240 199 242L150 259.5Q143 262 143 268V282" fill="none" '
            f'stroke="{color}" stroke-width="5.8" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<rect x="131" y="279.5" width="23" height="47.5" rx="5"/></g>')


def svg_transparente(color):
    # Recorte ajustado con un margen chico; fondo transparente
    m = 6
    vb = f'{BOX[0] - m} {BOX[1] - m} {BOX[2] + 2 * m} {BOX[3] + 2 * m}'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{rodillo(color)}</svg>'


def svg_fondo(fondo, color, lado=1024, alto_marca=0.46):
    # Cuadrado con el rodillo centrado ocupando ~46% del alto (como el isotipo original)
    k = lado * alto_marca / BOX[3]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lado} {lado}">'
            f'<rect width="{lado}" height="{lado}" fill="{fondo}"/>'
            f'<g transform="translate({lado / 2} {lado / 2}) scale({k:.4f}) translate({-CX} {-CY})">{rodillo(color)}</g></svg>')


VERSIONES = [
    # nombre, svg, fondo para la lámina, título, uso
    ('isotipo-fondo-salvia', svg_fondo(SALVIA, GRAFITO), SALVIA, 'Principal · fondo salvia', 'Versión original. Perfil de redes, avatar, app, uniformes.'),
    ('isotipo-fondo-claro', svg_fondo(GRIS, GRAFITO), GRIS, 'Fondo claro', 'Gris claro #E9EDEB. Papelería, documentos, fondos claros.'),
    ('isotipo-fondo-oscuro', svg_fondo(GRAFITO, SALVIA), GRAFITO, 'Fondo oscuro', 'Rodillo salvia sobre negro grafito. Vehículos, piezas oscuras.'),
    ('isotipo-negro-transparente', svg_transparente(GRAFITO), None, 'Transparente · negro', 'Para poner sobre blanco, gris claro o salvia.'),
    ('isotipo-blanco-transparente', svg_transparente(BLANCO), None, 'Transparente · blanco', 'Para poner sobre negro grafito o fotos oscuras.'),
    ('isotipo-salvia-transparente', svg_transparente(SALVIA), None, 'Transparente · salvia', 'Para poner sobre negro grafito (acento de marca).'),
]


def png(svg, destino, ancho=2048):
    doc = fitz.open(stream=svg.encode(), filetype='svg')
    page = doc[0]
    z = ancho / page.rect.width
    page.get_pixmap(matrix=fitz.Matrix(z, z), alpha=True).save(destino)


for nombre, svg, *_ in VERSIONES:
    (OUT / f'{nombre}.svg').write_text(svg, encoding='utf-8')
    png(svg, str(OUT / f'{nombre}.png'))
    print('  ', nombre, '.svg / .png')

# ---------- Lámina de revisión ----------
damero = ('background-color:#fff;background-image:linear-gradient(45deg,#e4e7e6 25%,transparent 25%),'
          'linear-gradient(-45deg,#e4e7e6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e4e7e6 75%),'
          'linear-gradient(-45deg,transparent 75%,#e4e7e6 75%);background-size:16px 16px;'
          'background-position:0 0,0 8px,8px -8px,-8px 0')


def tarjeta(nombre, svg, fondo, titulo, uso):
    if fondo:
        vista = f'<div class="v">{svg}</div>'
    else:
        oscuro = 'negro' not in nombre
        cuadros = damero.replace('#e4e7e6', '#3a403d').replace('#fff', '#2a2e2c') if oscuro else damero
        pruebas = [GRAFITO, '#1F2A24', '#3B4440'] if oscuro else [BLANCO, SALVIA, GRIS]
        vista = (f'<div class="v t" style="{cuadros}"><div class="tt">{svg}</div></div>'
                 f'<div class="prueba">{"".join(f"<span style=background:{c}>{svg}</span>" for c in pruebas)}</div>')
    return f'<div class="c">{vista}<b>{titulo}</b><small>{uso}</small><code>{nombre}.svg · .png</code></div>'


html = f'''<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
@page {{ size: letter; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; }}
body {{ font: 9pt/1.45 Inter, sans-serif; color: #2d3330; background: #fff; padding: 14mm 15mm; }}
h1 {{ font: 800 22pt Montserrat; color: {GRAFITO}; }}
h1 span {{ color: #4f8a64; }}
.lead {{ margin: 3px 0 5mm; color: #66706b; max-width: 160mm; }}
h2 {{ font: 700 7pt Inter; letter-spacing: .2em; text-transform: uppercase; color: #4f8a64; margin: 0 0 3mm; }}
.g {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-bottom: 5mm; }}
.c b {{ display: block; font: 700 9.5pt Montserrat; color: {GRAFITO}; margin-top: 2.5mm; }}
.c small {{ display: block; color: #66706b; font-size: 7.8pt; }}
.c code {{ display: block; margin-top: 1mm; font: 500 7pt Inter; color: #8a948f; }}
.v {{ aspect-ratio: 1; border-radius: 10px; overflow: hidden; border: 1px solid #e3e7e5; }}
.v svg {{ display: block; width: 100%; height: 100%; }}
.t {{ display: grid; place-items: center; height: 34mm; aspect-ratio: auto; }}
.tt svg {{ width: 24mm; height: auto; display: block; }}
.prueba {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm; margin-top: 2mm; }}
.prueba span {{ display: grid; place-items: center; height: 14mm; border-radius: 6px; border: 1px solid #e3e7e5; }}
.prueba svg {{ width: 8mm; height: auto; }}
.pal {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; }}
.pal div span {{ display: block; height: 12mm; border-radius: 8px; border: 1px solid #e3e7e5; }}
.pal b {{ display: block; font: 700 9pt Montserrat; color: {GRAFITO}; margin-top: 2mm; }}
.pal small {{ color: #66706b; }}
.nota {{ margin-top: 5mm; padding: 3mm 4mm; background: #f4f6f5; border-radius: 8px; font-size: 8pt; color: #4a524e; }}
</style></head><body>
<h1>Isotipo <span>Colores Santos</span></h1>
<p class="lead">Versiones para revisión: fondo salvia (principal), claro, oscuro y transparentes. El rodillo es el mismo en todas; solo cambian colores y fondo. Cada versión viene en SVG (vectorial, para imprenta, vinilos y web) y PNG de 2048&nbsp;px.</p>
<h2>Con fondo</h2>
<div class="g">{''.join(tarjeta(*v) for v in VERSIONES[:3])}</div>
<h2>Fondo transparente</h2>
<div class="g">{''.join(tarjeta(*v) for v in VERSIONES[3:])}</div>
<h2>Paleta</h2>
<div class="pal">
<div><span style="background:{SALVIA}"></span><b>Verde salvia</b><small>{SALVIA} · color principal</small></div>
<div><span style="background:{GRAFITO}"></span><b>Negro grafito</b><small>{GRAFITO} · rodillo, texto</small></div>
<div><span style="background:{BLANCO}"></span><b>Blanco</b><small>{BLANCO}</small></div>
<div><span style="background:{GRIS}"></span><b>Gris claro</b><small>{GRIS} · fondos secundarios</small></div>
</div>
<p class="nota"><b>Regla general:</b> rodillo negro sobre fondos claros o salvia; rodillo salvia o blanco sobre fondos oscuros. No usar el rodillo salvia sobre blanco (poco contraste) ni el negro sobre fondo oscuro. Tipografías: Montserrat (títulos) e Inter (textos).</p>
</body></html>'''

tmp = pathlib.Path(tempfile.mkdtemp(prefix='cs-brand-'))
(tmp / 'lamina.html').write_text(html, encoding='utf-8')
browsers = [r'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', r'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
            r'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
browser = next((b for b in browsers if os.path.exists(b)), None)
if browser:
    pdf = HERE / 'isotipo-revision.pdf'
    subprocess.run([browser, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=8000',
                    f'--user-data-dir={tmp / "p"}', f'--print-to-pdf={pdf}', (tmp / 'lamina.html').as_uri()],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print('   lámina:', pdf)
shutil.rmtree(tmp, ignore_errors=True)
