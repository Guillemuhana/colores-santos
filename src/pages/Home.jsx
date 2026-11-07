import { Link } from 'react-router'
import { ArrowRight, Award, CalendarCheck, Handshake, Leaf, MapPin, ShieldCheck, Users } from 'lucide-react'
import { PageHero, Process, CtaBanner, Marquee, WhyChoose, wrap, PaintDrips } from '../components/sections'
import { Bar, Reveal, SplitTitle, Stagger } from '../components/ui'
import { SERVICES, DEFAULT_PROCESS } from '../data/services'
import { SEGMENTS } from '../data/segments'

export default function Home() {
  return (
    <>
      <PageHero
        tall
        green={[1]}
        title={['Professional', 'Painting & Finishes', 'for Homes, Businesses', '& Communities']}
        intro="Complete interior and exterior solutions, including painting, stucco, drywall, carpentry and custom finishes, for residential, commercial and multi-family properties in Miami and surrounding areas."
        image="/img/home-hero.jpg"
      >
        <Reveal delay={0.65} className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink/80">
          {[[ShieldCheck, 'Quality Workmanship'], [Users, 'Reliable & Professional'], [MapPin, 'Serving Miami & Surroundings']].map(([I, t]) => (
            <span key={t} className="flex items-center gap-2"><I className="size-6 stroke-[1.6] text-brand-500" />{t}</span>
          ))}
        </Reveal>
      </PageHero>

      {/* Segments */}
      <section className="relative z-10 bg-white py-14">
        <Stagger className={`${wrap} grid gap-5 sm:grid-cols-2 lg:grid-cols-4`}>
          {SEGMENTS.map((s) => (
            <Stagger.Item key={s.to}>
              <Link to={s.to} className="group block h-full overflow-hidden rounded-2xl bg-white shadow-xl shadow-forest-900/10 ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/25">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={s.card} alt="" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <s.icon className="size-8 stroke-[1.6] text-brand-500" />
                    <h3 className="flex-1 text-xl font-bold leading-tight">{s.name}</h3>
                    <span className="grid size-8 place-items-center rounded-full bg-brand-400 text-forest-950 transition-transform duration-500 group-hover:-rotate-45"><ArrowRight className="size-4" /></span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{s.short}</p>
                </div>
              </Link>
            </Stagger.Item>
          ))}
        </Stagger>
      </section>

      <Marquee items={['Interior Painting', 'Exterior Painting', 'Stucco', 'Drywall', 'Cabinet Refinishing', 'Carpentry', 'Custom Finishes', 'Pressure Washing']} />

      {/* Services */}
      <section className="grain relative overflow-hidden bg-forest-900 py-16 text-white lg:py-24">
        <div className="pointer-events-none absolute -right-40 top-10 size-[600px] rounded-full bg-brand-400/10 blur-3xl" />
        <div className={`${wrap} grid gap-10 lg:grid-cols-[0.75fr_2.2fr]`}>
          <div>
            <Bar />
            <SplitTitle as="h2" lines={['Our Services']} className="text-5xl font-bold" />
            <Reveal delay={0.15}><p className="mt-5 text-lg leading-relaxed text-white/80">Comprehensive painting and finish solutions to enhance, protect and add value to your property.</p></Reveal>
            <Reveal delay={0.25} className="mt-8">
              <Link to="/services" className="group inline-flex items-center gap-2.5 rounded-xl border-2 border-white/80 px-6 py-3.5 font-semibold transition-colors hover:bg-white hover:text-forest-900">
                View All Services <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4" gap={0.06}>
            {SERVICES.map((s) => (
              <Stagger.Item key={s.slug}>
                <Link to={`/residential/${s.slug}`} className="group block overflow-hidden rounded-2xl bg-white text-ink transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-400/30">
                  <div className="aspect-[2/1] overflow-hidden"><img src={s.tile} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" /></div>
                  <div className="flex min-h-[72px] items-center gap-2.5 p-3.5">
                    <s.icon className="size-6 shrink-0 stroke-[1.6] text-brand-500" />
                    <span className="text-[15px] font-bold leading-tight">{s.name}</span>
                  </div>
                </Link>
              </Stagger.Item>
            ))}
          </Stagger>
        </div>
      </section>
      <PaintDrips seed={3} max={64} />

      <WhyChoose items={[
        [Award, 'Attention to Detail', 'Professional finishes that make a difference.'],
        [CalendarCheck, 'On-Time & Reliable', 'We respect your time and deliver as promised.'],
        [Handshake, 'Clean & Organized', 'We take care of your property from start to finish.'],
        [Leaf, 'Results That Last', 'Quality paints and proven techniques for long-lasting protection.'],
      ]} />

      <Process tone="mist" title={['How We', 'Work']} text="A simple, professional process from quote to final touch." steps={DEFAULT_PROCESS} />

      <CtaBanner flip title={["Let's Paint & Upgrade", 'Your Next Project']} text="Get a free, no-obligation estimate and see how Colores Santos can bring new life to your property." />
    </>
  )
}
