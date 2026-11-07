import { useEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { motion } from 'motion/react'
import Lenis from 'lenis'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
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
      <FloatingWhatsApp />
    </>
  )
}
