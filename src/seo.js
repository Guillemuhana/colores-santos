/* Per-route SEO: title, description, canonical, Open Graph and JSON-LD.
 * headTags() is used both by the browser (on navigation) and by the build-time
 * prerender (scripts/prerender.js), so crawlers get the same tags without JS. */
import { AREAS, BUSINESS, SITE_URL } from './config'
import { SERVICES, getService } from './data/services'

const BRAND = `${BUSINESS.name} Painting & Finishes`
const BIZ_ID = `${SITE_URL}/#business`
const areaShort = 'Miami, Miami Beach, Coral Gables, Doral & all of Miami-Dade'

const PAGES = {
  '/': {
    title: `Painting Contractor in Miami, FL | ${BRAND}`,
    description: `Miami painting contractor for interior & exterior painting, stucco, drywall, cabinet refinishing, carpentry and pressure washing. Homes, businesses, HOAs & condos in Miami-Dade. Free estimates.`,
    image: '/img/home-hero.jpg',
  },
  '/residential': {
    title: `Residential Painting Services in Miami, FL | ${BUSINESS.name}`,
    description: `House painting, cabinet refinishing, stucco, drywall and carpentry for Miami homes. Clean, on-time work that protects your home from Florida weather. Free estimates.`,
    image: '/img/residential-hero.jpg',
    crumbs: [['Residential', '/residential']],
  },
  '/services': {
    title: `Painting & Finishing Services in Miami, FL | ${BUSINESS.name}`,
    description: `All our services in Miami: interior & exterior painting, stucco, drywall, cabinet painting, carpentry, custom finishes and pressure washing. Serving ${areaShort}.`,
    image: '/img/home-hero.jpg',
    crumbs: [['Services', '/services']],
  },
  '/commercial': {
    title: `Commercial Painting Contractor in Miami, FL | ${BUSINESS.name}`,
    description: `Commercial painting in Miami for offices, retail, restaurants, warehouses and hotels. Minimal disruption, durable finishes, licensed & insured. Free estimates.`,
    image: '/img/commercial-hero.jpg',
    crumbs: [['Commercial', '/commercial']],
  },
  '/hoa-condominiums': {
    title: `HOA & Condo Painting in Miami, FL | ${BUSINESS.name}`,
    description: `Exterior repaints, stucco restoration and maintenance programs for HOAs and condominiums in Miami-Dade. Board-ready proposals and phased scheduling.`,
    image: '/img/card-hoa.jpg',
    crumbs: [['HOA & Condominiums', '/hoa-condominiums']],
  },
  '/property-management': {
    title: `Painting for Property Managers in Miami, FL | ${BUSINESS.name}`,
    description: `Fast make-ready repaints, drywall repairs and exterior maintenance for rental and multi-unit properties in Miami. Clear pricing and flexible scheduling.`,
    image: '/img/card-pm.jpg',
    crumbs: [['Property Management', '/property-management']],
  },
  '/about': {
    title: `About Us | ${BUSINESS.name} – Miami Painting Company`,
    description: `${BUSINESS.name} is a Miami painting and finishes company serving homes, businesses and communities across Miami-Dade with detail, reliability and lasting results.`,
    image: '/img/residential-h1.jpg',
    crumbs: [['About', '/about']],
  },
  '/contact': {
    title: `Free Painting Estimate in Miami, FL | Contact ${BUSINESS.name}`,
    description: `Request a free, no-obligation painting estimate in Miami. Call ${BUSINESS.phone} or message us on WhatsApp. Serving ${areaShort}.`,
    image: '/img/home-hero.jpg',
    crumbs: [['Contact', '/contact']],
  },
}

// Search-friendly names for page titles (what people type into Google)
const SEARCH_NAME = {
  'interior-painting': 'Interior Painting',
  'exterior-painting': 'Exterior House Painting',
  'cabinet-painting-refinishing': 'Cabinet Painting & Refinishing',
  stucco: 'Stucco Repair & Installation',
  drywall: 'Drywall Installation & Repair',
  carpentry: 'Carpentry & Trim Services',
  'custom-finishes': 'Venetian Plaster & Custom Finishes',
  'pressure-washing': 'Pressure Washing',
}

export const PRERENDER_ROUTES = [...Object.keys(PAGES), ...SERVICES.map((s) => `/residential/${s.slug}`)]

const abs = (p) => (p.startsWith('http') ? p : `${SITE_URL}${p}`)

function businessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HousePainter',
    '@id': BIZ_ID,
    name: BRAND,
    alternateName: BUSINESS.name,
    url: `${SITE_URL}/`,
    image: abs('/img/home-hero.jpg'),
    logo: abs('/favicon.svg'),
    telephone: BUSINESS.phone.replace(/[^\d+]/g, ''),
    email: BUSINESS.email,
    priceRange: '$$',
    address: { '@type': 'PostalAddress', addressLocality: 'Miami', addressRegion: 'FL', addressCountry: 'US' },
    geo: { '@type': 'GeoCoordinates', latitude: 25.7617, longitude: -80.1918 },
    areaServed: [
      ...AREAS.map((name) => ({ '@type': 'City', name: `${name}, FL` })),
      { '@type': 'AdministrativeArea', name: 'Miami-Dade County, FL' },
    ],
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '07:00',
      closes: '18:00',
    }],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Painting & Finishing Services',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: abs(`/residential/${s.slug}`) },
      })),
    },
    sameAs: [BUSINESS.instagram, BUSINESS.facebook].filter(Boolean),
  }
}

function breadcrumbSchema(crumbs) {
  const items = [['Home', '/'], ...crumbs]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  }
}

export function getSeo(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  let page = PAGES[path]
  const ld = [businessSchema()]

  const m = path.match(/^\/residential\/([^/]+)$/)
  const s = m && getService(m[1])
  if (s) {
    page = {
      title: `${SEARCH_NAME[s.slug] || s.name} in Miami, FL | ${BUSINESS.name}`,
      description: `${SEARCH_NAME[s.slug] || s.name} in Miami, FL. ${s.short} Serving ${areaShort}. Free, no-obligation estimates.`,
      image: s.hero || s.tile,
      crumbs: [['Residential', '/residential'], [s.name, path]],
    }
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${s.name} in Miami, FL`,
      serviceType: s.name,
      description: s.intro,
      provider: { '@id': BIZ_ID },
      areaServed: AREAS.map((name) => ({ '@type': 'City', name: `${name}, FL` })),
      url: abs(path),
    })
  }

  if (!page) {
    return { title: `Page Not Found | ${BUSINESS.name}`, description: PAGES['/'].description, robots: 'noindex', ld: [] }
  }
  if (path === '/') {
    ld.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: `${SITE_URL}/`, inLanguage: 'en-US' })
  }
  if (page.crumbs) ld.push(breadcrumbSchema(page.crumbs))

  return { ...page, canonical: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`, image: abs(page.image), ld }
}

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Head tags for a route, every tag marked data-seo so the client can swap them. */
export function headTags(pathname) {
  const m = getSeo(pathname)
  const t = [
    `<title data-seo>${esc(m.title)}</title>`,
    `<meta data-seo name="description" content="${esc(m.description)}" />`,
  ]
  if (m.robots) {
    t.push(`<meta data-seo name="robots" content="${m.robots}" />`)
    return t.join('\n    ')
  }
  t.push(
    `<link data-seo rel="canonical" href="${m.canonical}" />`,
    `<meta data-seo property="og:type" content="website" />`,
    `<meta data-seo property="og:site_name" content="${esc(BRAND)}" />`,
    `<meta data-seo property="og:locale" content="en_US" />`,
    `<meta data-seo property="og:title" content="${esc(m.title)}" />`,
    `<meta data-seo property="og:description" content="${esc(m.description)}" />`,
    `<meta data-seo property="og:url" content="${m.canonical}" />`,
    `<meta data-seo property="og:image" content="${m.image}" />`,
    `<meta data-seo name="twitter:card" content="summary_large_image" />`,
    `<meta data-seo name="twitter:title" content="${esc(m.title)}" />`,
    `<meta data-seo name="twitter:description" content="${esc(m.description)}" />`,
    `<meta data-seo name="twitter:image" content="${m.image}" />`,
    ...m.ld.map((j) => `<script data-seo type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  )
  return t.join('\n    ')
}

/** Browser: replace the current route's head tags. */
export function applySeo(pathname) {
  document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove())
  document.head.insertAdjacentHTML('beforeend', headTags(pathname))
}
