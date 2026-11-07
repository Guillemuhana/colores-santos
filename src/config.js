// ⚠️ Datos del negocio: completar con los reales antes de publicar.
export const BUSINESS = {
  name: 'Colores Santos',
  tagline: 'Painting & Finishes',
  whatsapp: '13057960889', // formato internacional sin "+" ni espacios
  phone: '+1 (305) 796-0889',
  email: 'coloressantos@gmail.com',
  area: 'Miami & Surrounding Areas',
  hours: 'Mon – Sat · 7:00 AM – 6:00 PM',
  instagram: '',
  facebook: '',
}

// URL pública del sitio (sin "/" final). Cambiar cuando tengan dominio propio:
// se usa en canonical, Open Graph, sitemap.xml y robots.txt.
export const SITE_URL = 'https://colores-santos.vercel.app'

// Ciudades/barrios donde trabajan (SEO local). Ajustar a la zona real.
export const AREAS = [
  'Miami', 'Miami Beach', 'Coral Gables', 'Doral', 'Hialeah', 'Kendall', 'Brickell', 'Coconut Grove',
  'Miami Lakes', 'Aventura', 'North Miami', 'Pinecrest', 'Key Biscayne', 'Homestead',
]

// Before/after: oculto hasta tener fotos reales de trabajos propios (public/img/*-before.jpg y *-after.jpg).
export const SHOW_BEFORE_AFTER = false

export const waLink = (text = `Hi ${BUSINESS.name}! I'd like a free estimate.`) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`
