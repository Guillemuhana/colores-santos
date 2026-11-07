import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, ChevronRight, CircleCheck, MoveHorizontal } from 'lucide-react'
import { Bar, EstimateButton, Eyebrow, Reveal, SplitTitle, Stagger, WhatsAppButton, ease } from './ui'
import { PROCESS_ICONS } from '../data/services'
import { PaintCanvas, PaintDrips, PaintSplat, RollerSVG } from './paint'

const wrap = 'mx-auto max-w-[1320px] px-5'

/* ---------- Hero with curved image and parallax ---------- */
export function PageHero({ crumbs, eyebrow, title, green, intro, image, alt, children, tall = false }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15])

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-b from-white to-mist/60 pt-[84px]">
      <PaintCanvas />
      <div className={`${wrap} relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] ${tall ? 'lg:min-h-[640px]' : 'lg:min-h-[560px]'}`}>
        <div className="relative z-10 py-10 lg:py-16">
          {crumbs && (
            <motion.nav aria-label="Breadcrumb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex flex-wrap items-center gap-1 text-sm font-semibold">
              {crumbs.map(([label, to], i) => (
                <span key={label} className="flex items-center gap-1">
                  {to ? <Link to={to} className="hover:text-brand-600">{label}</Link> : <span className="text-brand-600">{label}</span>}
                  {i < crumbs.length - 1 && <ChevronRight className="size-3.5 opacity-50" />}
                </span>
              ))}
            </motion.nav>
          )}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <SplitTitle lines={title} green={green} className="text-[clamp(2.4rem,5.2vw,4.4rem)] font-extrabold leading-[0.98]" />
          <Reveal delay={0.35}><p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink/75">{intro}</p></Reveal>
          <Reveal delay={0.5} className="mt-8 flex flex-wrap gap-3"><EstimateButton /><WhatsAppButton /></Reveal>
          {children}
        </div>

        <div className="relative -mx-5 h-[360px] sm:h-[440px] lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:h-auto lg:w-[58%]">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-brand-300 to-brand-500"
            style={{ borderTopLeftRadius: '55% 100%' }}
            initial={{ clipPath: 'inset(0 0 0 100%)' }}
            animate={{ clipPath: 'inset(0 0 0 0%)' }}
            transition={{ duration: 1.1, ease }}
          />
          <motion.div
            className="absolute inset-y-0 left-4 right-0 overflow-hidden lg:left-6"
            style={{ borderTopLeftRadius: '55% 100%' }}
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            transition={{ duration: 1.7, ease: [0.45, 0, 0.25, 1], delay: 0.35 }}
          >
            <motion.img src={image} alt={alt || `${title.join(' ')} in Miami, FL`} className="h-full w-full object-cover" style={{ y, scale }} fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/20 via-transparent to-transparent" />
          </motion.div>
          {/* paint roller that "rolls" the photo onto the wall */}
          <motion.div
            className="pointer-events-none absolute -left-[4%] right-[-6%] z-10"
            initial={{ top: '-12%', opacity: 1 }}
            animate={{ top: ['-12%', '88%', '88%'], opacity: [1, 1, 0] }}
            transition={{ duration: 2.3, times: [0, 0.74, 1], ease: [0.45, 0, 0.25, 1], delay: 0.35 }}
          >
            <div className="h-6 bg-gradient-to-b from-transparent to-white/30 blur-sm" />
            <RollerSVG className="-mt-6 w-full drop-shadow-[0_18px_22px_rgb(0_0_0/0.35)]" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Benefit strip ---------- */
export function BenefitsStrip({ items }) {
  return (
    <section className="border-y border-black/5 bg-white">
      <Stagger className={`${wrap} grid grid-cols-2 gap-y-6 py-8 sm:grid-cols-3 lg:flex lg:justify-between lg:divide-x lg:divide-black/10`}>
        {items.map(([Icon, label]) => (
          <Stagger.Item key={label} className="group flex items-center gap-3 lg:flex-1 lg:justify-center lg:px-3">
            <Icon className="size-9 shrink-0 stroke-[1.6] text-brand-500 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
            <span className="max-w-[9rem] text-[15px] font-semibold leading-tight">{label}</span>
          </Stagger.Item>
        ))}
      </Stagger>
    </section>
  )
}

/* ---------- Dark service detail with checklist + gallery ---------- */
export function DetailSection({ title, text, includes, gallery, name = '' }) {
  const g = gallery
  return (
    <>
    <section className="grain relative overflow-hidden bg-forest-900 py-16 text-white lg:py-20">
      <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-brand-400/10 blur-3xl" />
      <div className={`${wrap} grid gap-10 lg:grid-cols-[0.8fr_1.6fr]`}>
        <div>
          <Bar />
          <SplitTitle as="h2" lines={title} className="text-4xl font-bold leading-[1.02] sm:text-5xl" />
          <Reveal delay={0.2}><p className="mt-5 text-lg leading-relaxed text-white/80">{text}</p></Reveal>
          <Stagger className="mt-6 space-y-3" gap={0.07}>
            {includes.map((i) => (
              <Stagger.Item key={i} className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 size-5 shrink-0 fill-brand-400 text-forest-900" />
                <span className="text-[15px] text-white/90">{i}</span>
              </Stagger.Item>
            ))}
          </Stagger>
          <Reveal delay={0.3} className="mt-8"><EstimateButton /></Reveal>
        </div>
        <Stagger className={`grid gap-4 ${g.length === 4 ? 'grid-cols-2 sm:grid-cols-[1.3fr_1fr_1fr] sm:grid-rows-2' : 'grid-cols-2 sm:grid-cols-[1.45fr_1fr] sm:grid-rows-2'}`}>
          {g.map((src, i) => (
            <Stagger.Item
              key={src}
              className={`group relative overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl ${i === 0 ? 'col-span-2 aspect-[4/3] sm:col-span-1 sm:row-span-2 sm:aspect-auto' : 'aspect-[4/3]'} ${g.length === 4 && i === 1 ? 'sm:col-span-2' : ''}`}
            >
              <img src={src} alt={`${name} project in Miami, FL – photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
            </Stagger.Item>
          ))}
        </Stagger>
      </div>
    </section>
    <PaintDrips seed={11} />
    </>
  )
}

/* ---------- Process steps with drawn line ---------- */
export function Process({ steps, title = ['Our', 'Process'], text = 'A simple and transparent experience from start to finish.', tone = 'white' }) {
  return (
    <section className={`${tone === 'mist' ? 'bg-mist' : 'bg-white'} overflow-hidden pb-16 pt-24 lg:pb-20 lg:pt-28`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-[0.7fr_2fr] lg:items-center`}>
        <div className="relative">
          <PaintSplat className="-left-10 -top-12 size-28 opacity-15" />
          <h2 className="relative text-4xl font-bold sm:text-5xl">{title[0]} <span className="text-gradient">{title[1]}</span></h2>
          <Reveal delay={0.1}><p className="mt-3 text-lg text-ink/70">{text}</p></Reveal>
        </div>
        <div className="relative">
          <motion.div
            className="absolute left-[12%] right-[12%] top-7 hidden h-[2px] origin-left bg-[repeating-linear-gradient(90deg,#1fd8a6_0_10px,transparent_10px_18px)] md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease }}
          />
          <Stagger className="relative grid gap-8 sm:grid-cols-2 md:grid-cols-4" gap={0.18}>
            {steps.map(([t, d], i) => {
              const Icon = PROCESS_ICONS[i] || PROCESS_ICONS[0]
              return (
                <Stagger.Item key={t} className="group text-center">
                  <div className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-white text-brand-500 shadow-lg shadow-forest-900/10 ring-1 ring-brand-100 transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-brand-400 group-hover:text-forest-950">
                    <Icon className="size-7" />
                    <span className="absolute -left-2 -top-2 grid size-6 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white">{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{t}</h3>
                  <p className="mx-auto mt-1.5 max-w-[15rem] text-sm leading-relaxed text-ink/70">{d}</p>
                </Stagger.Item>
              )
            })}
          </Stagger>
        </div>
      </div>
    </section>
  )
}

/* ---------- Draggable before / after ---------- */
export function BeforeAfter({ before, after, text, name = 'Painting' }) {
  const box = useRef(null)
  const [pos, setPos] = useState(50)
  const [drag, setDrag] = useState(false)
  const move = (clientX) => {
    const r = box.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className={`${wrap} grid gap-10 lg:grid-cols-[0.7fr_2fr] lg:items-center`}>
        <div>
          <h2 className="text-4xl font-bold sm:text-5xl">Before &amp; <span className="text-gradient">After</span></h2>
          <Reveal delay={0.1}><p className="mt-3 text-lg text-ink/70">{text}</p></Reveal>
          <Reveal delay={0.2}><p className="mt-5 inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-semibold text-forest-700"><MoveHorizontal className="size-4" /> Drag to compare</p></Reveal>
        </div>
        <Reveal>
          <div
            ref={box}
            className={`relative aspect-[4/3] select-none sm:aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl shadow-forest-900/20 ${drag ? 'cursor-grabbing' : 'cursor-ew-resize'}`}
            onPointerDown={(e) => { setDrag(true); e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX) }}
            onPointerMove={(e) => drag && move(e.clientX)}
            onPointerUp={() => setDrag(false)}
            style={{ touchAction: 'pan-y' }}
          >
            <img src={after} alt={`${name} in Miami – after`} className="absolute inset-0 h-full w-full object-cover" draggable="false" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <img src={before} alt={`${name} in Miami – before`} className="absolute inset-0 h-full w-full object-cover" draggable="false" />
            </div>
            <span className="absolute bottom-4 left-4 rounded-full bg-ink/85 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">Before</span>
            <span className="absolute bottom-4 right-4 rounded-full bg-brand-400 px-4 py-1.5 text-sm font-bold text-forest-950">After</span>
            <div className="absolute inset-y-0 w-[6px] -translate-x-1/2 bg-gradient-to-r from-brand-600 via-brand-300 to-brand-500 opacity-90 shadow-[0_0_24px_rgb(31_216_166/0.6)]" style={{ left: `${pos}%` }}>
              <div className="absolute top-1/2 left-1/2 h-[70%] w-[64px] -translate-x-1/2 -translate-y-1/2">
                <RollerSVG vertical className="absolute left-1/2 top-1/2 w-[min(40vh,230px)] sm:w-[min(46vh,360px)] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_18px_rgb(0_0_0/0.4)]" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Bottom CTA with paint roller ---------- */
export function CtaBanner({ title, text, flip = false }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], flip ? ['10%', '-10%'] : ['-12%', '6%'])
  const rot = useTransform(scrollYProgress, [0, 1], [-8, 4])
  return (
    <section ref={ref} className={`relative overflow-hidden ${flip ? 'bg-forest-900 text-white' : 'bg-white'}`}>
      <PaintCanvas alpha={flip ? 0.22 : 0.16} />
      <PaintSplat className="-right-10 -top-10 size-44 opacity-20" delay={0.2} />
      <div className={`${wrap} grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-20`}>
        <div className={`relative h-56 sm:h-72 ${flip ? 'lg:order-2' : ''}`}>
          <motion.div className="absolute inset-0 overflow-hidden rounded-3xl" style={{ x }}>
            <motion.img src="/img/roller.jpg" alt="Paint roller applying fresh paint" className="h-full w-full object-cover" style={{ rotate: rot, scale: 1.15 }} loading="lazy" />
          </motion.div>
        </div>
        <div className={flip ? 'lg:order-1' : ''}>
          <SplitTitle as="h2" lines={title} className="text-4xl font-extrabold leading-[1.02] sm:text-5xl" />
          <Reveal delay={0.2}><p className={`mt-4 max-w-lg text-lg ${flip ? 'text-white/80' : 'text-ink/75'}`}>{text}</p></Reveal>
          <Reveal delay={0.3} className="mt-7 flex flex-wrap gap-3"><EstimateButton size="lg" /><WhatsAppButton size="lg" dark={flip} /></Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------- Service card grid ---------- */
export function ServiceCard({ s, i = 0 }) {
  return (
    <Stagger.Item className="h-full">
      <Link to={`/residential/${s.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest-900/10 ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-500/20">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={s.tile} alt={`${s.name} in Miami, FL`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-forest-700 backdrop-blur">0{i + 1}</span>
        </div>
        <div className="flex flex-1 items-start gap-3 p-5">
          <s.icon className="mt-0.5 size-7 shrink-0 stroke-[1.6] text-brand-500" />
          <div className="flex-1">
            <h3 className="text-lg font-bold leading-tight">{s.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{s.short}</p>
          </div>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-400 text-forest-950 transition-transform duration-500 group-hover:-rotate-45">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </Link>
    </Stagger.Item>
  )
}

/* ---------- Infinite marquee ---------- */
export function Marquee({ items }) {
  const row = [...items, ...items]
  return (
    <div className="relative overflow-hidden bg-brand-400 py-4 text-forest-950">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-2xl font-bold uppercase tracking-tight">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">{t}<span className="size-2.5 rounded-full bg-forest-900" /></span>
        ))}
      </div>
    </div>
  )
}

/* ---------- Why choose ---------- */
export function WhyChoose({ items }) {
  return (
    <section className="bg-white pb-14 pt-28">
      <div className={`${wrap} grid gap-10 lg:grid-cols-[0.6fr_2fr] lg:items-center`}>
        <h2 className="text-4xl font-bold leading-tight lg:border-r lg:border-black/10 lg:pr-8">Why Choose <span className="block text-gradient">Colores Santos</span></h2>
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([Icon, t, d]) => (
            <Stagger.Item key={t} className="group rounded-2xl p-4 text-center transition-colors hover:bg-mist">
              <Icon className="mx-auto size-10 stroke-[1.5] text-brand-500 transition-transform duration-500 group-hover:scale-110" />
              <h3 className="mt-3 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-ink/65">{d}</p>
            </Stagger.Item>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

export { wrap, PaintDrips }
