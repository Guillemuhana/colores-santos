import { useId } from 'react'
import { motion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1]

/* Seeded random so drips look the same on every render */
const rand = (seed) => {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

/* ------------------------------------------------------------------
 * BrushStroke: dry-brush paint swipe painted behind a heading line
 * ------------------------------------------------------------------ */
export function BrushStroke({ show = true, delay = 0, color = '#5ddfba', className = '' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute -left-[3%] bottom-[6%] -z-10 h-[46%] w-[106%] overflow-visible ${className}`}
    >
      <defs>
        <filter id={`dry-${id}`} x="-5%" y="-40%" width="110%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.02 1.6" numOctaves="2" seed="9" result="streaks" />
          <feColorMatrix in="streaks" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5" result="mask" />
          <feComposite in="d" in2="mask" operator="in" />
        </filter>
      </defs>
      <motion.path
        d="M6 24 C 70 14, 140 30, 210 21 S 330 14, 394 22"
        fill="none"
        stroke={color}
        strokeWidth="26"
        strokeLinecap="round"
        filter={`url(#dry-${id})`}
        opacity="0.55"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay }}
      />
    </svg>
  )
}

/* ------------------------------------------------------------------
 * PaintDrips: liquid drips that run down from the section above.
 * Place it right after a section, passing that section's color.
 * ------------------------------------------------------------------ */
export function PaintDrips({ color = '#0b3a32', seed = 7, count = 16, max = 52 }) {
  const id = useId().replace(/:/g, '')
  const r = rand(seed)
  const drips = Array.from({ length: count }, (_, i) => ({
    left: (i + 0.15 + r() * 0.7) * (100 / count),
    w: 10 + r() * 16,
    h: 18 + r() * max,
    delay: r() * 0.9,
    dur: 1.6 + r() * 1.6,
  }))
  return (
    <div className="pointer-events-none relative z-20 h-0 [overflow-x:clip] [overflow-y:visible]" aria-hidden="true">
      <svg className="absolute size-0">
        <filter id={`goo-${id}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </svg>
      <motion.div
        className="absolute inset-x-0 -top-3"
        style={{ height: max + 60, filter: `url(#goo-${id})` }}
        initial="hide"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      >
        <div className="absolute inset-x-0 top-0 h-5" style={{ background: color }} />
        {drips.map((d, i) => (
          <motion.div
            key={i}
            className="absolute top-0 origin-top rounded-b-full"
            style={{ left: `${d.left}%`, width: d.w, height: d.h, background: color }}
            variants={{ hide: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: d.dur, delay: d.delay, ease: [0.3, 0.9, 0.4, 1] } } }}
          >
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full" style={{ width: d.w * 1.35, height: d.w * 1.35, background: color }} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------
 * RollerSVG: realistic paint roller (horizontal or vertical)
 * ------------------------------------------------------------------ */
export function RollerSVG({ className = '', vertical = false }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 520 150" className={className} style={vertical ? { transform: 'rotate(90deg)' } : undefined} aria-hidden="true">
      <defs>
        <linearGradient id={`cyl-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8f3e1" />
          <stop offset=".25" stopColor="#3ee4b6" />
          <stop offset=".6" stopColor="#12c193" />
          <stop offset="1" stopColor="#0a7a5d" />
        </linearGradient>
        <filter id={`nap-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 .2  0 0 0 0 .15  0 0 0 1.4 -.55" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f5f4" /><stop offset=".5" stopColor="#9aa5a2" /><stop offset="1" stopColor="#5d6664" />
        </linearGradient>
      </defs>
      {/* frame wire */}
      <path d="M470 60 h24 v-40 H300 v-14" fill="none" stroke={`url(#metal-${id})`} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      {/* handle */}
      <rect x="282" y="-60" width="36" height="74" rx="14" fill="#141a19" />
      <rect x="288" y="-56" width="8" height="64" rx="4" fill="#ffffff" opacity=".12" />
      {/* cylinder */}
      <rect x="20" y="38" width="460" height="88" rx="22" fill={`url(#cyl-${id})`} />
      <rect x="20" y="38" width="460" height="88" rx="22" fill="#000" filter={`url(#nap-${id})`} />
      <rect x="30" y="46" width="440" height="10" rx="5" fill="#fff" opacity=".35" />
      {/* end caps */}
      <ellipse cx="22" cy="82" rx="8" ry="44" fill="#0a7a5d" />
      <ellipse cx="478" cy="82" rx="8" ry="44" fill="#0d8f6d" />
    </svg>
  )
}

/* ------------------------------------------------------------------
 * PaintSplat: organic splatter blob, scales in when visible
 * ------------------------------------------------------------------ */
export function PaintSplat({ className = '', color = '#1fd8a6', delay = 0 }) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={`pointer-events-none absolute ${className}`}
      aria-hidden="true"
      initial={{ scale: 0, rotate: -20, opacity: 0 }}
      whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 180, damping: 12, delay }}
    >
      <path fill={color} d="M104 38c14-2 18 14 30 12s20-14 28-4-6 20 2 30 26 4 26 18-18 12-20 24 12 24 2 32-20-4-30 4-6 28-20 28-14-18-26-16-18 18-30 10 2-22-8-30-30-2-32-16 18-14 16-26-18-20-8-30 22 4 32-4 14-26 28-28Z" />
      <circle cx="30" cy="40" r="7" fill={color} />
      <circle cx="176" cy="160" r="9" fill={color} />
      <circle cx="160" cy="28" r="5" fill={color} />
      <circle cx="44" cy="176" r="5" fill={color} />
    </motion.svg>
  )
}

export { ease }
