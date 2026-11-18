import { setLanguage, translate, useLanguage } from '../i18n'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { SERVICES } from '../data/services'
import { EstimateButton, WhatsAppButton, ease } from './ui'
import { Logo } from './Logo'

export { Logo }

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/residential', label: 'Residential', menu: true },
  { to: '/commercial', label: 'Commercial' },
  { to: '/hoa-condominiums', label: 'HOA & Condominiums' },
  { to: '/property-management', label: 'Property Management' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function NavItem({ item, light = false }) {
  useLanguage()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <NavLink to={item.to} className={`relative flex items-center gap-1 whitespace-nowrap py-2 text-[13.5px] font-semibold transition-colors ${light ? 'text-white hover:text-brand-300' : 'text-ink/85 hover:text-brand-600'}`}>
        {translate(item.label)}
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
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-black/5 bg-white p-3 text-ink shadow-2xl shadow-forest-900/15">
              {SERVICES.map((s) => (
                <Link key={s.slug} to={`/residential/${s.slug}`} className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-brand-50">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-400 group-hover:text-forest-950">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight">{translate(s.name)}</span>
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
  const language = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [mobile, setMobile] = useState(false)
  const { pathname } = useLocation()
  const hasHero = pathname === '/' || pathname === '/residential' || SERVICES.some(s => pathname === `/residential/${s.slug}`) || ['/commercial', '/hoa-condominiums', '/property-management', '/about'].includes(pathname)
  const overlay = hasHero && !scrolled
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/85 py-2 shadow-[0_8px_30px_-12px_rgb(11_58_50/0.25)] backdrop-blur-xl' : overlay ? 'bg-transparent py-5' : 'bg-white py-3.5'}`}>
      <div className="mx-auto flex max-w-[1760px] items-center justify-between gap-2 px-4 md:gap-4 md:px-8 xl:px-12 2xl:px-16">
        <Logo light={overlay} className={`shrink-0 transition-[font-size] duration-500 ${scrolled ? 'text-[6px] md:text-[8px]' : overlay ? 'text-[6px] md:text-[12px]' : 'text-[6px] md:text-[10px]'}`} />
        <nav aria-label={language === 'es' ? 'Navegación principal' : 'Main navigation'} className="hidden items-center gap-4 2xl:flex">
          {NAV.map((n) => <NavItem key={n.to} item={n} light={overlay} />)}
        </nav>
        {!overlay && <div className="hidden min-[1800px]:block"><EstimateButton size="sm" /></div>}
        <div className="ml-auto flex shrink-0 items-center gap-2 2xl:ml-0">
          <label className="sr-only" htmlFor="site-language">Idioma / Language</label>
          <select id="site-language" value={language} onChange={event => setLanguage(event.target.value)} className={`min-h-11 w-[92px] cursor-pointer rounded-xl border px-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-400 md:w-[108px] md:text-sm ${overlay ? 'border-white/40 bg-forest-950/65 text-white' : 'border-brand-300 bg-white text-forest-950'}`}>
            <option value="en" lang="en">English</option>
            <option value="es" lang="es">Español</option>
          </select>
        <button className="grid size-11 place-items-center rounded-xl bg-forest-900 text-white 2xl:hidden" onClick={() => setMobile((v) => !v)} aria-expanded={mobile} aria-label={translate("Menu")}>
          {mobile ? <X /> : <Menu />}
        </button>
        </div>
      </div>
      <motion.div className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-brand-600 to-brand-400" style={{ scaleX: progress }} />

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden bg-white 2xl:hidden"
            data-lenis-prevent
          >
            <div className="max-h-[80vh] overflow-y-auto px-5 pb-6 pt-3">
              {NAV.map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => `block border-b border-black/5 py-3.5 font-display text-xl font-semibold ${isActive ? 'text-brand-600' : ''}`}>
                    {translate(n.label)}
                  </NavLink>
                  {n.menu && (
                    <div className="grid grid-cols-2 gap-x-3 py-2">
                      {SERVICES.map((s) => (
                        <Link key={s.slug} to={`/residential/${s.slug}`} className="py-1.5 text-sm text-ink/70">{translate(s.name)}</Link>
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
