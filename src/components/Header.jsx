import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { SERVICES } from '../data/services'
import { EstimateButton, WhatsAppButton, ease } from './ui'

export function Logo({ light = false }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Colores Santos home">
      <svg viewBox="0 0 64 56" className="h-11 w-auto shrink-0 transition-transform duration-500 group-hover:-rotate-6">
        <path d="M2 30c8-14 22-22 40-22" stroke="#1fd8a6" strokeWidth="9" strokeLinecap="round" fill="none" opacity=".9" />
        <rect x="14" y="4" width="36" height="16" rx="5" fill={light ? '#fff' : '#0d1412'} />
        <rect x="18" y="7" width="28" height="10" rx="3" fill="#1fd8a6" />
        <path d="M50 12h7v14H33v8" fill="none" stroke={light ? '#fff' : '#0d1412'} strokeWidth="4" strokeLinejoin="round" />
        <rect x="29" y="34" width="8" height="18" rx="3" fill={light ? '#fff' : '#0d1412'} />
      </svg>
      <div className="leading-none">
        <div className={`font-display text-[22px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
          COLORES <span className="text-brand-400">SANTOS</span>
        </div>
        <div className={`mt-1 flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.22em] ${light ? 'text-white/80' : 'text-ink/80'}`}>
          <span className="h-px w-3 bg-current" /> PAINTING &amp; FINISHES <span className="h-px w-3 bg-current" />
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
