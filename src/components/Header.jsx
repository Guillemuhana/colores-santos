import { useEffect, useId, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { SERVICES } from '../data/services'
import { EstimateButton, WhatsAppButton, ease } from './ui'

export function Logo({ light = false }) {
  const uid = useId().replace(/:/g, '')
  const g = (n) => `${n}-${uid}`
  return (
    <Link to="/" className={`cs-logo group flex items-center gap-3 ${light ? 'cs-logo--light' : ''}`} aria-label="Colores Santos home">
      <svg viewBox="0 0 56 56" className="cs-logo__mark h-11 w-11 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id={g('bg')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#14584b" />
            <stop offset="1" stopColor="#072822" />
          </linearGradient>
          <linearGradient id={g('paint')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5ddfba" />
            <stop offset=".6" stopColor="#96ebd2" />
            <stop offset="1" stopColor="#c9f5e6" />
          </linearGradient>
          <linearGradient id={g('cyl')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#96ebd2" />
            <stop offset=".45" stopColor="#1fd8a6" />
            <stop offset="1" stopColor="#0c8566" />
          </linearGradient>
          <linearGradient id={g('shine')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={g('clip')}><rect width="56" height="56" rx="15" /></clipPath>
        </defs>

        <g clipPath={`url(#${g('clip')})`}>
          <rect width="56" height="56" fill={`url(#${g('bg')})`} />
          {/* painted band (revealed as the roller passes) */}
          <g className="cs-logo__band">
            <path
              d="M8 13.5c4-.9 9 .6 14-.3s10 .5 15-.2 7 .4 10 .1v9.6c-3 .5-7-.3-11 .3s-9-.6-14 .1-9-.3-14 .2Z"
              fill={`url(#${g('paint')})`}
            />
            <path d="M8 15.5h39" stroke="#fff" strokeOpacity=".25" strokeWidth="1" />
          </g>
          {/* drip */}
          <path className="cs-logo__drip" d="M13 22.4h3.4v5.2a1.7 1.7 0 0 1-3.4 0Z" fill="#12c193" />
          <circle className="cs-logo__drop" cx="14.7" cy="31" r="1.5" fill="#1fd8a6" />
          {/* roller */}
          <g className="cs-logo__roller">
            <rect x="25" y="10" width="21" height="15" rx="4.5" fill={`url(#${g('cyl')})`} stroke="#072822" strokeOpacity=".45" strokeWidth="1.2" />
            <rect x="25" y="10" width="3.2" height="15" rx="1.6" fill="#fff" fillOpacity=".9" />
            <path d="M27.5 13.2h16" stroke="#fff" strokeOpacity=".55" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M46 17.5h4.2v10.3H34v5.4" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="30.5" y="32.5" width="7" height="15" rx="3.2" fill="#fff" />
            <path d="M32.6 36v8" stroke="#0b3a32" strokeOpacity=".2" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          {/* glossy sweep */}
          <rect className="cs-logo__shine" x="-30" y="0" width="22" height="56" fill={`url(#${g('shine')})`} transform="skewX(-20)" />
        </g>
        <rect x=".75" y=".75" width="54.5" height="54.5" rx="14.5" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="1.5" />
      </svg>

      <div className="leading-none">
        <div className="cs-logo__word font-display text-[22px] font-extrabold tracking-tight">
          <span className="cs-logo__colores">
            {'COLORES'.split('').map((c, i) => (
              <span key={i} style={{ '--i': i }}>{c}</span>
            ))}
          </span>{' '}
          <span className="cs-logo__santos ml-1">
            <span className="cs-logo__swipe" aria-hidden="true" />
            <span className="cs-logo__santos-text">SANTOS</span>
          </span>
        </div>
        <div className="cs-logo__tag mt-1.5 flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.22em]">
          <span className="cs-logo__rule" /> PAINTING &amp; FINISHES <span className="cs-logo__rule" />
        </div>
      </div>
    </Link>
  )
}

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/residential', label: 'Residential', menu: true },
  { to: '/commercial', label: 'Commercial' },
  { to: '/hoa-condominiums', label: 'HOA & Condominiums' },
  { to: '/property-management', label: 'Property Management' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function NavItem({ item }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <NavLink to={item.to} className="relative flex items-center gap-1 py-2 text-[13.5px] font-semibold text-ink/85 transition-colors hover:text-brand-600">
        {item.label}
        {item.menu && <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />}
        {active && <motion.span layoutId="nav-underline" className="absolute -bottom-0.5 left-0 right-0 h-[3px] rounded bg-brand-400" />}
      </NavLink>
      <AnimatePresence>
        {item.menu && open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease }}
            className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3"
          >
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-black/5 bg-white p-3 shadow-2xl shadow-forest-900/15">
              {SERVICES.map((s) => (
                <Link key={s.slug} to={`/residential/${s.slug}`} className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-brand-50">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-400 group-hover:text-forest-950">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight">{s.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobile, setMobile] = useState(false)
  const { pathname } = useLocation()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => setMobile(false), [pathname])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/85 py-2 shadow-[0_8px_30px_-12px_rgb(11_58_50/0.25)] backdrop-blur-xl' : 'bg-white py-3.5'}`}>
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5">
        <Logo />
        <nav className="hidden items-center gap-6 xl:flex">
          {NAV.map((n) => <NavItem key={n.to} item={n} />)}
        </nav>
        <div className="hidden xl:block"><EstimateButton size="sm" /></div>
        <button className="grid size-11 place-items-center rounded-xl bg-forest-900 text-white xl:hidden" onClick={() => setMobile((v) => !v)} aria-label="Menu">
          {mobile ? <X /> : <Menu />}
        </button>
      </div>
      <motion.div className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-brand-600 to-brand-400" style={{ scaleX: progress }} />

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden bg-white xl:hidden"
            data-lenis-prevent
          >
            <div className="max-h-[80vh] overflow-y-auto px-5 pb-6 pt-3">
              {NAV.map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => `block border-b border-black/5 py-3.5 font-display text-xl font-semibold ${isActive ? 'text-brand-600' : ''}`}>
                    {n.label}
                  </NavLink>
                  {n.menu && (
                    <div className="grid grid-cols-2 gap-x-3 py-2">
                      {SERVICES.map((s) => (
                        <Link key={s.slug} to={`/residential/${s.slug}`} className="py-1.5 text-sm text-ink/70">{s.name}</Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              <div className="mt-6 flex flex-wrap gap-3"><EstimateButton /><WhatsAppButton /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
