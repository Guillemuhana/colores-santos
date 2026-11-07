import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, Award, CalendarCheck, Clock, Handshake, House, HardHat, Mail, MapPin, Phone, ShieldCheck, Sparkles, TrendingUp, Users, Leaf } from 'lucide-react'
import { BenefitsStrip, BeforeAfter, CtaBanner, DetailSection, PageHero, PaintDrips, Process, ServiceCard, WhyChoose, wrap } from '../components/sections'
import { Bar, Reveal, SplitTitle, Stagger, WhatsAppIcon, ease } from '../components/ui'
import { DEFAULT_PROCESS, RESIDENTIAL_CORE, SERVICES, getService } from '../data/services'
import { INDUSTRIES, SEGMENT_PAGES } from '../data/segments'
import { BUSINESS, waLink } from '../config'

/* ---------------- Service detail ---------------- */
export function ServicePage() {
  const { slug } = useParams()
  const s = getService(slug)
  if (!s) return <Navigate to="/services" replace />
  return (
    <>
      <PageHero crumbs={[['Home', '/'], ['Residential', '/residential'], [s.name]]} eyebrow="Residential Services · Miami, FL" title={s.title} intro={s.intro} image={s.hero} alt={`${s.name} in Miami, FL`} />
      <BenefitsStrip items={s.benefits} />
      <DetailSection name={s.name} title={s.detailTitle} text={s.detail} includes={s.includes} gallery={s.gallery} />
      <Process steps={s.process} />
      {s.before && <BeforeAfter name={s.name} before={s.before} after={s.after} text={s.baText} />}
      <MoreServices current={s.slug} />
      <CtaBanner title={s.cta} text={s.ctaText} />
    </>
  )
}

function MoreServices({ current }) {
  const list = SERVICES.filter((x) => x.slug !== current).slice(0, 3)
  return (
    <section className="bg-mist py-16">
      <div className={wrap}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl font-bold">More <span className="text-gradient">Services</span></h2>
          <Link to="/services" className="group inline-flex items-center gap-2 font-semibold text-brand-700">View all <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
        </div>
        <Stagger className="grid gap-5 md:grid-cols-3">
          {list.map((x) => <ServiceCard key={x.slug} s={x} i={SERVICES.indexOf(x)} />)}
        </Stagger>
      </div>
    </section>
  )
}

/* ---------------- Residential ---------------- */
export function Residential() {
  const core = RESIDENTIAL_CORE.map(getService)
  const extra = SERVICES.filter((s) => !RESIDENTIAL_CORE.includes(s.slug))
  return (
    <>
      <PageHero
        eyebrow="Residential · Miami, FL"
        title={['Painting & Home', 'Improvement', 'Solutions']}
        green={[2]}
        intro="Enhance, protect and add value to your home with professional painting, finishes and light renovation services."
        image="/img/residential-hero.jpg"
      >
        <Reveal delay={0.65} className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          {[[TrendingUp, 'Increase Home Value'], [ShieldCheck, 'Protect & Maintain'], [Sparkles, 'Beautiful, Long-Lasting Results']].map(([I, t]) => (
            <span key={t} className="flex items-center gap-2"><I className="size-6 stroke-[1.6] text-brand-500" />{t}</span>
          ))}
        </Reveal>
      </PageHero>

      <section className="grain relative overflow-hidden bg-forest-900 py-16 lg:py-20">
        <div className={wrap}>
          <Bar />
          <h2 className="text-4xl font-bold text-white sm:text-5xl">Our <span className="text-gradient">Residential Services</span></h2>
          <Reveal><p className="mt-3 text-lg text-white/80">Complete solutions for the interior and exterior of your home.</p></Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {core.map((s) => <ServiceCard key={s.slug} s={s} i={SERVICES.indexOf(s)} />)}
          </Stagger>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {extra.map((s) => (
              <Reveal key={s.slug}>
                <Link to={`/residential/${s.slug}`} className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-white backdrop-blur transition-colors hover:bg-white/10">
                  <img src={s.tile} alt={`${s.name} in Miami`} loading="lazy" className="size-16 rounded-xl object-cover" />
                  <div className="flex-1"><h3 className="font-bold">{s.name}</h3><p className="text-sm text-white/65">{s.short}</p></div>
                  <ArrowRight className="size-5 text-brand-400 transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <PaintDrips seed={5} />

      <WhyChoose items={[
        [Award, 'Experienced Team', 'Skilled professionals with a detail-oriented approach.'],
        [CalendarCheck, 'On-Time & Reliable', 'We respect your time and keep you informed.'],
        [ShieldCheck, 'Quality Materials', 'Premium paints and finishes for lasting results.'],
        [House, 'Clean & Respectful', 'We treat your home like our own.'],
      ]} />

      <section className="bg-mist py-16">
        <div className={`${wrap} grid gap-8 lg:grid-cols-[0.7fr_2fr] lg:items-center`}>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Residential <span className="block text-gradient">Project Highlights</span></h2>
            <Reveal><p className="mt-3 text-lg text-ink/70">Real examples of home transformations.</p></Reveal>
          </div>
          <Stagger className="grid gap-5 sm:grid-cols-3">
            {[['residential-h1', 'Exterior Painting', 'exterior-painting'], ['residential-h2', 'Cabinet Refinishing', 'cabinet-painting-refinishing'], ['residential-h3', 'Interior Painting', 'interior-painting']].map(([im, t, slug]) => (
              <Stagger.Item key={im}>
                <Link to={`/residential/${slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                  <img src={`/img/${im}.jpg`} alt={t} className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-bold shadow">{t}</span>
                </Link>
              </Stagger.Item>
            ))}
          </Stagger>
        </div>
      </section>

      <Process title={['Our', 'Process']} steps={[
        ['Estimate', 'On-site or virtual assessment and detailed quote.'],
        ['Plan', 'We schedule the work and prepare your property.'],
        ['Execute', 'Professional and clean installation with care.'],
        ['Final Walkthrough', 'We review the results together to ensure your complete satisfaction.'],
      ]} />
      <CtaBanner title={['Ready to Transform', 'Your Home?']} text="Get a free, no-obligation estimate and let's bring your vision to life." />
    </>
  )
}

/* ---------------- All services ---------------- */
export function Services() {
  return (
    <>
      <section className="bg-gradient-to-b from-mist to-white pb-10 pt-36">
        <div className={wrap}>
          <SplitTitle lines={['Painting Services', 'in Miami, FL']} className="text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-none" />
          <Reveal delay={0.2}><p className="mt-4 max-w-xl text-lg text-ink/70">Comprehensive painting and finish solutions to enhance, protect and add value to your property.</p></Reveal>
        </div>
      </section>
      <section className="bg-white pb-20">
        <Stagger className={`${wrap} grid gap-5 sm:grid-cols-2 lg:grid-cols-4`} gap={0.06}>
          {SERVICES.map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />)}
        </Stagger>
      </section>
      <CtaBanner flip title={["Let's Paint & Upgrade", 'Your Next Project']} text="Get a free, no-obligation estimate and see how Colores Santos can bring new life to your property." />
    </>
  )
}

/* ---------------- Commercial ---------------- */
export function Commercial() {
  return (
    <>
      <PageHero crumbs={[['Home', '/'], ['Commercial']]} eyebrow="Commercial Services · Miami, FL" title={['Commercial', 'Painting & Finishes']}
        intro="Professional, efficient and high-quality painting solutions for businesses and commercial properties across South Florida." image="/img/commercial-hero.jpg" />
      <BenefitsStrip items={[[Users, 'Minimal Business Disruption'], [ShieldCheck, 'Durable & Long-Lasting Finishes'], [Clock, 'On-Time & Reliable Service'], [HardHat, 'Safety & Compliance'], [Award, 'Quality Work & Professional Team']]} />
      <section className="grain relative overflow-hidden bg-forest-900 py-16 lg:py-20">
        <div className={wrap}>
          <div className="mb-10 grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <SplitTitle as="h2" lines={['Our Commercial', 'Services']} className="text-4xl font-bold text-white sm:text-5xl" />
            <Reveal><p className="text-lg text-white/80 lg:border-l lg:border-white/20 lg:pl-8">Complete painting and finishing solutions for commercial spaces, tailored to your business needs.</p></Reveal>
          </div>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.06}>
            {SERVICES.map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />)}
          </Stagger>
        </div>
      </section>
      <PaintDrips seed={21} />
      <section className="bg-white pb-14 pt-28">
        <div className={`${wrap} grid gap-8 lg:grid-cols-[0.5fr_2fr] lg:items-center`}>
          <h2 className="text-4xl font-bold leading-tight">Industries <span className="text-gradient">We Serve</span></h2>
          <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {INDUSTRIES.map(([I, t]) => (
              <Stagger.Item key={t} className="group rounded-2xl border border-black/5 p-4 text-center transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg">
                <I className="mx-auto size-10 stroke-[1.5] text-brand-500 transition-transform group-hover:scale-110" />
                <p className="mt-2 text-sm font-semibold leading-tight">{t}</p>
              </Stagger.Item>
            ))}
          </Stagger>
        </div>
      </section>
      <Process tone="mist" steps={[
        ['Consult & Estimate', 'We assess your needs, schedule a site visit and provide a detailed quote.'],
        ['Plan & Prepare', 'We coordinate the scope, materials and schedule to minimize disruption.'],
        ['Execute', 'Our skilled team completes the work with precision and care.'],
        ['Final Walkthrough', 'We review the results with you to ensure complete satisfaction.'],
      ]} text="A clear, efficient and professional process to deliver high-quality results for your business." />
      <Gallery title={['Recent Commercial', 'Projects']} images={['/img/commercial-p1.jpg', '/img/commercial-p2.jpg', '/img/commercial-p3.jpg']} />
      <CtaBanner title={['Need a Commercial', 'Painting Partner?']} text="Get a free, no-obligation estimate and let's discuss your project, timeline and specific requirements." />
    </>
  )
}

function Gallery({ title, images }) {
  return (
    <section className="bg-white py-16">
      <div className={`${wrap} grid gap-8 lg:grid-cols-[0.6fr_2fr] lg:items-center`}>
        <h2 className="text-4xl font-bold leading-tight">{title[0]} <span className="block text-gradient">{title[1]}</span></h2>
        <Stagger className="grid gap-5 sm:grid-cols-3">
          {images.map((im) => (
            <Stagger.Item key={im} className="group aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              <img src={im} alt={`${title.join(' ')} – Miami, FL`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
            </Stagger.Item>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ---------------- HOA / Property management ---------------- */
export function SegmentPage({ id }) {
  const p = SEGMENT_PAGES[id]
  return (
    <>
      <PageHero crumbs={[['Home', '/'], [p.crumb]]} eyebrow={p.eyebrow} title={p.title} intro={p.intro} image={p.hero} />
      <BenefitsStrip items={p.benefits} />
      <section className="grain relative overflow-hidden bg-forest-900 py-16 lg:py-20">
        <div className={wrap}>
          <Bar />
          <SplitTitle as="h2" lines={p.servicesTitle} className="text-4xl font-bold text-white sm:text-5xl" />
          <Reveal><p className="mt-3 max-w-xl text-lg text-white/80">{p.servicesText}</p></Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {p.services.map(([I, t, d]) => (
              <Stagger.Item key={t} className="group h-full rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-brand-400/60 hover:bg-white/10">
                <span className="grid size-12 place-items-center rounded-xl bg-brand-400 text-forest-950 transition-transform duration-500 group-hover:rotate-6"><I className="size-6" /></span>
                <h3 className="mt-4 text-xl font-bold">{t}</h3>
                <p className="mt-1.5 text-white/70">{d}</p>
              </Stagger.Item>
            ))}
          </Stagger>
        </div>
      </section>
      <PaintDrips seed={33} />
      <Process steps={p.process} text="A clear and organized process designed for managers and boards." />
      <Gallery title={['Recent', 'Projects']} images={p.gallery} />
      <CtaBanner title={p.cta} text={p.ctaText} />
    </>
  )
}

/* ---------------- About ---------------- */
export function About() {
  return (
    <>
      <PageHero crumbs={[['Home', '/'], ['About']]} eyebrow="About Us" title={['Craftsmanship', 'You Can See']}
        intro="Colores Santos is a painting and finishes company serving homes, businesses and communities in Miami and surrounding areas, with a focus on detail, reliability and results that last."
        image="/img/residential-h1.jpg" />
      <section className="bg-white py-16 lg:py-24">
        <div className={`${wrap} grid gap-12 lg:grid-cols-2 lg:items-center`}>
          <Reveal className="grid grid-cols-2 gap-4">
            <img src="/img/carpentry-g1.jpg" alt="Custom carpentry by Colores Santos in Miami" loading="lazy" className="aspect-[3/4] w-full rounded-3xl object-cover shadow-xl" />
            <img src="/img/cabinet-g1.jpg" alt="Cabinet refinishing in a Miami kitchen" loading="lazy" className="mt-12 aspect-[3/4] w-full rounded-3xl object-cover shadow-xl" />
          </Reveal>
          <div>
            <Bar />
            <SplitTitle as="h2" lines={['Our', 'Story']} className="text-4xl font-bold sm:text-5xl" />
            <Reveal delay={0.15}>
              <p className="mt-5 text-lg leading-relaxed text-ink/75">
                {/* TODO: reemplazar con la historia real del cliente */}
                We started with a simple idea: treat every property as if it were our own. Today our team delivers complete interior and exterior solutions —
                painting, stucco, drywall, carpentry and custom finishes — for homeowners, businesses, HOAs and property managers.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink/75">
                Every project follows the same clear process: an honest estimate, careful preparation, quality materials and a final walkthrough with you.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
      <WhyChoose items={[
        [Award, 'Attention to Detail', 'Professional finishes that make a difference.'],
        [CalendarCheck, 'On-Time & Reliable', 'We respect your time and deliver as promised.'],
        [Handshake, 'Clean & Organized', 'We take care of your property from start to finish.'],
        [Leaf, 'Results That Last', 'Quality paints and proven techniques.'],
      ]} />
      <Process tone="mist" title={['How We', 'Work']} steps={DEFAULT_PROCESS} />
      <CtaBanner flip title={["Let's Work", 'Together']} text="Get a free, no-obligation estimate for your next project." />
    </>
  )
}

/* ---------------- Contact (sends to WhatsApp) ---------------- */
const TYPES = ['Residential', 'Commercial', 'HOA / Condominium', 'Property Management']

export function Contact() {
  const [f, setF] = useState({ name: '', phone: '', email: '', city: '', type: 'Residential', services: [], message: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const toggle = (n) => setF({ ...f, services: f.services.includes(n) ? f.services.filter((x) => x !== n) : [...f.services, n] })
  const submit = (e) => {
    e.preventDefault()
    const msg = [
      `Hi ${BUSINESS.name}! I'd like a free estimate.`,
      '',
      `Name: ${f.name}`,
      `Phone: ${f.phone}`,
      f.email && `Email: ${f.email}`,
      f.city && `City / Area: ${f.city}`,
      `Property type: ${f.type}`,
      f.services.length && `Services: ${f.services.join(', ')}`,
      f.message && `Details: ${f.message}`,
    ].filter(Boolean).join('\n')
    window.open(waLink(msg), '_blank', 'noopener')
  }
  const input = 'w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-400/20'

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mist to-white pb-20 pt-32">
      <div className="pointer-events-none absolute -right-40 top-0 size-[560px] rounded-full bg-brand-300/25 blur-3xl" />
      <div className={`${wrap} relative grid gap-12 lg:grid-cols-[1fr_1.3fr]`}>
        <div>
          <SplitTitle lines={['Get a Free', 'Painting Estimate']} className="text-[clamp(2.6rem,5.5vw,4.4rem)] font-extrabold leading-none" />
          <Reveal delay={0.2}><p className="mt-5 max-w-md text-lg text-ink/70">Tell us about your project anywhere in Miami-Dade. We'll reply on WhatsApp with next steps and schedule your free, no-obligation estimate.</p></Reveal>
          <Stagger className="mt-10 space-y-4">
            {[[Phone, 'Call us', BUSINESS.phone, `tel:${BUSINESS.phone.replace(/[^\d+]/g, '')}`], [Mail, 'Email', BUSINESS.email, `mailto:${BUSINESS.email}`], [MapPin, 'Service area', BUSINESS.area], [Clock, 'Hours', BUSINESS.hours]].map(([I, l, v, href]) => (
              <Stagger.Item key={l} className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-forest-900 text-brand-400"><I className="size-5" /></span>
                <div><p className="text-sm text-ink/55">{l}</p>{href ? <a href={href} className="font-semibold hover:text-brand-600">{v}</a> : <p className="font-semibold">{v}</p>}</div>
              </Stagger.Item>
            ))}
          </Stagger>
        </div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="rounded-3xl bg-white p-6 shadow-2xl shadow-forest-900/15 ring-1 ring-black/5 sm:p-9"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="Full name *" className={input} value={f.name} onChange={set('name')} />
            <input required type="tel" placeholder="Phone *" className={input} value={f.phone} onChange={set('phone')} />
            <input type="email" placeholder="Email" className={input} value={f.email} onChange={set('email')} />
            <input placeholder="City / Area" className={input} value={f.city} onChange={set('city')} />
          </div>
          <p className="mb-2 mt-6 text-sm font-bold">Property type</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button type="button" key={t} onClick={() => setF({ ...f, type: t })}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${f.type === t ? 'text-forest-950' : 'bg-mist text-ink/70 hover:bg-brand-50'}`}>
                {f.type === t && <motion.span layoutId="type-pill" className="absolute inset-0 rounded-full bg-brand-400" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
          <p className="mb-2 mt-6 text-sm font-bold">Services needed</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SERVICES.map((s) => {
              const on = f.services.includes(s.name)
              return (
                <button type="button" key={s.slug} onClick={() => toggle(s.name)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition-all ${on ? 'border-brand-400 bg-brand-50' : 'border-black/10 hover:border-brand-300'}`}>
                  <s.icon className={`size-5 shrink-0 ${on ? 'text-brand-600' : 'text-ink/40'}`} />{s.name}
                </button>
              )
            })}
          </div>
          <textarea rows={4} placeholder="Tell us about your project (size, timeline, details)…" className={`${input} mt-6 resize-none`} value={f.message} onChange={set('message')} />
          <button type="submit" className="group mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-4 text-lg font-bold text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:-translate-y-0.5">
            <WhatsAppIcon className="size-6" /> Send via WhatsApp <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-3 text-center text-xs text-ink/50">Free, no-obligation estimate · We usually reply the same day</p>
        </motion.form>
      </div>
    </section>
  )
}

export function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-5 pt-24 text-center">
      <div>
        <p className="font-display text-8xl font-black text-gradient">404</p>
        <h1 className="mt-2 text-3xl font-bold">This wall is still unpainted</h1>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-400 px-6 py-3 font-semibold text-forest-950">Back home <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  )
}
