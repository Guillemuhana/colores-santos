import { SERVICES } from './services.js'
import { AREAS, BUSINESS } from '../config.js'

export const CHAT_SERVICES = SERVICES.map(({ slug, name, intro, includes, hero, gallery }) => ({
  slug, name, intro, includes, image: hero, gallery: gallery.slice(0, 2), href: `/residential/${slug}`,
}))

export const COMPANY_KNOWLEDGE = JSON.stringify({
  business: BUSINESS, areas: AREAS, services: CHAT_SERVICES,
  process: ['Free project estimate', 'Preparation and scheduling agreed with the team', 'Professional work', 'Final walkthrough'],
  contact: '/contact',
  rules: 'Prices, visit times, job duration, material brands, licenses, insurance details, warranties and availability require confirmation by the team. No online booking or automatic quote is available.',
})

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const aliases = [
  ['interior-painting', /interior|inside|habitacion|room/],
  ['exterior-painting', /exterior|outside|fachada/],
  ['cabinet-painting-refinishing', /cabinet|gabinete|alacena|kitchen|cocina/],
  ['stucco', /stucco|estuco/], ['drywall', /drywall|yeso|sheetrock/],
  ['carpentry', /carpentry|carpinter|wood|madera|trim/],
  ['custom-finishes', /custom|finish|acabado|venetian|veneciano/],
  ['pressure-washing', /pressure|washing|lavado|presion|cleaning|limpieza/],
]

export function quickReply(messages) {
  const last = normalize(messages.at(-1)?.content || '')
  const context = normalize(messages.filter(m => m.role === 'user').map(m => m.content).join(' '))
  const es = /[¿¡]|\b(hola|quiero|necesito|pintar|fotos|precio|presupuesto|gracias|trabajo|horario|servicios|si|cuanto)\b/.test(context)
  const slug = aliases.find(([, pattern]) => pattern.test(last))?.[0] || aliases.find(([, pattern]) => pattern.test(context))?.[0]
  const service = CHAT_SERVICES.find(s => s.slug === slug)
  const hasCity = AREAS.some(city => context.includes(normalize(city)))
  const nextQuestion = es ? (hasCity ? '¿Qué parte del proyecto te gustaría renovar?' : '¿En qué ciudad está la propiedad?') : (hasCity ? 'Which parts of the project would you like to update?' : 'Which city is the property in?')
  let reply
  if (/hour|horario|open|abierto/.test(last)) reply = es ? `El horario de Colores Santos es de lunes a sábado, de 7:00 a 18:00. ¿Qué trabajo tenés en mente?` : 'Our hours are Monday–Saturday, 7 AM–6 PM. What project do you have in mind?'
  else if (/price|cost|precio|cuanto|presupuesto|estimate|quote/.test(last)) reply = es ? 'El presupuesto es gratuito y depende de la superficie, el estado y la preparación necesaria. El equipo debe evaluar tu proyecto para confirmar el precio. Podés completar el formulario con fotos y detalles.' : 'Estimates are free and depend on the area, its condition and the preparation needed. Our team needs to review your project to confirm pricing. You can add photos and details in the estimate form.'
  else if (/area|zona|city|ciudad|miami|doral|gables|hialeah/.test(last) && !service) reply = es ? `Trabajamos en Miami y alrededores, incluyendo ${AREAS.slice(1, 6).join(', ')}. El equipo confirma la cobertura de cada dirección. ¿Qué servicio necesitás?` : `We serve Miami and surrounding areas, including ${AREAS.slice(1, 6).join(', ')}. The team confirms coverage for each address. Which service do you need?`
  else if (service) reply = es ? `Podemos orientarte con ${service.name}. Abajo te muestro un trabajo y el enlace del servicio. ${nextQuestion}` : `We can help with ${service.name}. Here is one of our projects and the service page. ${nextQuestion}`
  else reply = es ? 'Colores Santos realiza pintura interior y exterior, cabinets, stucco, drywall, carpintería, acabados y limpieza a presión para casas, negocios y comunidades en Miami y alrededores. ¿Qué te gustaría renovar?' : 'Colores Santos offers interior and exterior painting, cabinets, stucco, drywall, carpentry, custom finishes and pressure washing for homes, businesses and communities around Miami. What would you like to improve?'
  return { reply, serviceSlugs: service ? [service.slug] : [], showContact: /price|cost|precio|cuanto|presupuesto|estimate|quote|contact|whatsapp|persona|human/.test(last), ai: false }
}
