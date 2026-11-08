import { useEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { motion } from 'motion/react'
import Lenis from 'lenis'
import { Camera, Clock, FileText, Mail, MapPin, Phone } from 'lucide-react'
import Header, { Logo } from './Header'
import { WhatsAppIcon, ease } from './ui'
import { AREAS, BUSINESS, waLink } from '../config'
import { applySeo } from '../seo'
import { SERVICES } from '../data/services'

function useSmoothScroll() {
  const lenis = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ duration: 1.1, smoothWheel: true })
    lenis.current = l
    let id
    const raf = (t) => { l.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); l.destroy() }
  }, [])
  return lenis
}

function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-forest-950 text-white">
      <div className="mx-auto grid max-w-[1760px] gap-10 px-5 md:px-8 xl:px-12 2xl:px-16 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light className="text-[10px]" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
            Complete interior and exterior solutions for residential, commercial and multi-family properties in {BUSINESS.area}.
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-bold text-brand-300">Services</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {SERVICES.map((s) => <li key={s.slug}><Link className="transition-colors hover:text-white" to={`/residential/${s.slug}`}>{s.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-bold text-brand-300">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {[['Residential', '/residential'], ['Commercial', '/commercial'], ['HOA & Condominiums', '/hoa-condominiums'], ['Property Management', '/property-management'], ['About', '/about'], ['Contact', '/contact']].map(([l, t]) => (
              <li key={t}><Link className="transition-colors hover:text-white" to={t}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-bold text-brand-300">Get in touch</h4>
          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex gap-3"><Phone className="size-4 shrink-0 text-brand-400" /><a href={`tel:${BUSINESS.phone.replace(/[^\d+]/g, '')}`}>{BUSINESS.phone}</a></li>
            <li className="flex gap-3"><Mail className="size-4 shrink-0 text-brand-400" /><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></li>
            <li className="flex gap-3"><MapPin className="size-4 shrink-0 text-brand-400" />{BUSINESS.area}</li>
            <li className="flex gap-3"><Clock className="size-4 shrink-0 text-brand-400" />{BUSINESS.hours}</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[1760px] px-5 md:px-8 xl:px-12 2xl:px-16 pb-10">
        <h4 className="mb-3 text-sm font-bold text-brand-300">Areas We Serve in Miami-Dade, Florida</h4>
        <p className="text-sm leading-relaxed text-white/60">{AREAS.join(' · ')}</p>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1760px] flex-wrap justify-between gap-2 px-5 md:px-8 xl:px-12 2xl:px-16 py-5 text-xs text-white/50">
          <span>© {new Date().getFullYear()} {BUSINESS.name} Painting &amp; Finishes. All rights reserved.</span>
          <span>Licensed &amp; insured · Painting contractor in Miami, FL</span>
        </div>
      </div>
    </footer>
  )
}

function FloatingWhatsApp() {
  return (
    <motion.a
      href={waLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-5 right-5 z-40 grid size-15 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/25"
    >
      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#25D366]" />
      <WhatsAppIcon className="relative size-8" />
    </motion.a>
  )
}

/* Slim vertical "Free Estimate" tab pinned to the left edge of the screen */
function EstimateTab() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/contact')) return null
  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.8, ease }}
      className="fixed left-0 top-1/2 z-40 -translate-y-1/2"
    >
      <Link
        to="/contact"
        aria-label="Get a free estimate"
        className="estimate-tab group relative flex flex-col items-center gap-2 overflow-hidden rounded-r-xl bg-gradient-to-b from-brand-300 via-brand-400 to-brand-500 py-3 pl-1.5 pr-1.5 text-forest-950 shadow-[8px_8px_24px_-8px_rgb(7_40_34/0.45)] ring-1 ring-white/40 transition-[padding] duration-500 hover:pl-3"
      >
        <span className="relative grid size-6 place-items-center rounded-lg bg-forest-950 text-brand-300 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
          <FileText className="size-3.5" />
          <span className="absolute -right-0.5 -top-0.5 flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/80" />
            <span className="relative size-2 rounded-full border border-brand-400 bg-white" />
          </span>
        </span>
        <span className="rotate-180 font-display text-[10.5px] font-extrabold uppercase tracking-[0.2em] [writing-mode:vertical-rl]">
          Free Estimate
        </span>
        <Camera className="size-3 text-forest-950/70" />
        <span aria-hidden="true" className="estimate-tab__shine pointer-events-none absolute inset-x-0 -top-1/2 h-1/2 bg-gradient-to-b from-transparent via-white/60 to-transparent" />
      </Link>
    </motion.div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const lenis = useSmoothScroll()
  useEffect(() => applySeo(pathname), [pathname])
  useEffect(() => {
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, lenis])

  return (
    <>
      <Header />
      <motion.main key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
        <Outlet />
      </motion.main>
      <Footer />
      <EstimateTab />
      <FloatingWhatsApp />
    </>
  )
}
