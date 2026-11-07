import { useRef } from 'react'
import { Link } from 'react-router'
import { motion, useInView, useMotionValue, useSpring } from 'motion/react'
import { BrushStroke } from './paint'
import { CalendarCheck, ArrowRight } from 'lucide-react'
import { waLink } from '../config'

export const ease = [0.22, 1, 0.36, 1]

export function WhatsAppIcon({ className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  )
}

/** Fade + slide up when entering the viewport */
export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </M>
  )
}

/** Container that staggers its <Stagger.Item> children */
export function Stagger({ children, className = '', gap = 0.08 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  )
}
Stagger.Item = function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease } } }}
    >
      {children}
    </motion.div>
  )
}

/** Animates a heading word by word. Green lines get a painted brush stroke behind them. */
export function SplitTitle({ lines, className = '', as = 'h1', greenFirst = false, green }) {
  const H = motion[as]
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  let i = 0
  return (
    <H ref={ref} className={className}>
      {lines.map((line, li) => {
        const isGreen = green ? green.includes(li) : greenFirst ? li === 0 : li > 0
        const words = line.split(' ')
        const start = i
        return (
          <span key={li} className="relative isolate block w-fit">
            {isGreen && <BrushStroke show={inView} delay={0.35 + start * 0.06} />}
            {words.map((w) => {
              const d = i++ * 0.06
              return (
                <span key={w + d} className="relative inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <motion.span
                    className={`inline-block ${isGreen ? 'text-gradient' : ''}`}
                    initial={{ y: '110%' }}
                    animate={inView ? { y: 0 } : { y: '110%' }}
                    transition={{ duration: 0.9, ease, delay: 0.1 + d }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              )
            })}
          </span>
        )
      })}
    </H>
  )
}

/** Button that follows the cursor slightly */
function Magnetic({ children, className = '' }) {
  const ref = useRef(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15 })
  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.2)
        y.set((e.clientY - r.top - r.height / 2) * 0.3)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.span>
  )
}

export function EstimateButton({ size = 'md', className = '', label = 'Get a Free Estimate' }) {
  const s = size === 'lg' ? 'px-7 py-4 text-base' : size === 'sm' ? 'px-4 py-2.5 text-sm' : 'px-6 py-3.5 text-[15px]'
  return (
    <Magnetic>
      <Link
        to="/contact"
        className={`group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-brand-400 font-semibold text-forest-950 shadow-[0_10px_30px_-10px_rgb(31_216_166/0.8)] transition-colors ${s} ${className}`}
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <CalendarCheck className="size-[1.1em]" />
        <span className="relative">{label}</span>
        <ArrowRight className="size-[1.1em] transition-transform group-hover:translate-x-1" />
      </Link>
    </Magnetic>
  )
}

export function WhatsAppButton({ size = 'md', dark = false, text, className = '' }) {
  const s = size === 'lg' ? 'px-7 py-4 text-base' : 'px-6 py-3.5 text-[15px]'
  const tone = dark
    ? 'border-white/70 text-white hover:bg-white hover:text-forest-900'
    : 'border-brand-400 bg-white text-ink hover:bg-brand-50'
  return (
    <Magnetic>
      <a
        href={waLink(text)}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2.5 rounded-xl border-2 font-semibold transition-colors ${tone} ${s} ${className}`}
      >
        <WhatsAppIcon /> WhatsApp
      </a>
    </Magnetic>
  )
}

export function Eyebrow({ children, light = false }) {
  return (
    <div className={`mb-3 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em] ${light ? 'text-brand-300' : 'text-ink'}`}>
      {children}
      <motion.span
        className="h-[3px] w-12 origin-left rounded bg-brand-400"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease, delay: 0.2 }}
      />
    </div>
  )
}

export function Bar() {
  return (
    <motion.div
      className="mb-5 h-1 w-16 origin-left rounded bg-brand-400"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease }}
    />
  )
}
