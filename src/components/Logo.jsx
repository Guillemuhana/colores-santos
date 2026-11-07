import { Link } from 'react-router'

/*
 * Colores Santos logo built from REAL photographed paint
 * (Pexels photos, free license, background removed + recolored to brand green):
 *   /img/brand/roller-icon.webp  real paint roller (photo cut-out, cover dyed brand green)
 *   /img/brand/stroke.webp  dry-brush horizontal stroke behind "SANTOS"
 * Everything is sized in `em`, so set the logo size with font-size
 * (1em = 1/8 of the logo height, e.g. text-[10px] -> 80px tall).
 * Animations live in index.css under `.cs-logo`; hover repaints.
 */
export function Logo({ light = false, className = 'text-[10px]' }) {
  return (
    <Link
      to="/"
      aria-label="Colores Santos Painting & Finishes, home"
      className={`cs-logo ${light ? 'cs-logo--light' : ''} ${className}`}
    >
      <span className="cs-logo__mark" aria-hidden="true">
        <img src="/img/brand/roller-icon.webp" alt="" width="260" height="394" className="cs-logo__roller" draggable="false" />
      </span>

      <span className="cs-logo__text" aria-hidden="true">
        <span className="cs-logo__colores">COLORES</span>
        <span className="cs-logo__santos">
          <img src="/img/brand/stroke.webp" alt="" width="640" height="181" className="cs-logo__stroke" draggable="false" />
          <span className="cs-logo__santos-text">SANTOS</span>
        </span>
        <span className="cs-logo__tag">PAINTING &amp; FINISHES</span>
      </span>
    </Link>
  )
}

export default Logo
