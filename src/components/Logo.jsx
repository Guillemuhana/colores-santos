import { Link } from 'react-router'

/* Brand roller icon beside the plain wordmark. */
export function Logo({ light = false, className = 'text-[10px]' }) {
  return (
    <Link
      to="/"
      aria-label="Colores Santos Painting & Finishes, home"
      className={`cs-logo ${light ? 'cs-logo--light' : ''} ${className}`}
    >
      <span className="cs-logo__mark" aria-hidden="true">
        <svg className="cs-logo__roller" viewBox="88 195 124 136" aria-hidden="true"><g fill="#0b0b0b"><rect x="92" y="199" width="100" height="31" rx="5.5" /><path d="M188 213H197Q205 213 205 221V234Q205 240 199 242L150 259.5Q143 262 143 268V282" fill="none" stroke="#0b0b0b" strokeWidth="5.8" strokeLinecap="round" strokeLinejoin="round" /><rect x="131" y="279.5" width="23" height="47.5" rx="5" /></g></svg>
      </span>

      <span className="cs-logo__text" aria-hidden="true">
        <span className="cs-logo__colores">COLORES</span>
        <span className="cs-logo__santos">
          <span className="cs-logo__santos-text">SANTOS</span>
        </span>
        <span className="cs-logo__tag">PAINTING &amp; FINISHES</span>
      </span>
    </Link>
  )
}

export default Logo
