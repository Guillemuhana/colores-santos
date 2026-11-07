// ⚠️ Datos del negocio: completar con los reales antes de publicar.
export const BUSINESS = {
  name: 'Colores Santos',
  tagline: 'Painting & Finishes',
  whatsapp: '13050000000', // formato internacional sin "+" ni espacios
  phone: '+1 (305) 000-0000',
  email: 'info@coloressantos.com',
  area: 'Miami & Surrounding Areas',
  hours: 'Mon – Sat · 7:00 AM – 6:00 PM',
  instagram: '',
  facebook: '',
}

export const waLink = (text = `Hi ${BUSINESS.name}! I'd like a free estimate.`) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`
