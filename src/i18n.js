import { useSyncExternalStore } from 'react'
import { ES } from './data/translations-es.js'

const STORAGE = 'colores-language-v1'
let language = 'en'
const listeners = new Set()
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener) }

export function setLanguage(next) {
  if (!['en', 'es'].includes(next)) return
  language = next
  if (typeof document !== 'undefined') document.documentElement.lang = next
  try { localStorage.setItem(STORAGE, next) } catch { /* Language still works without storage. */ }
  listeners.forEach(listener => listener())
}

export function restoreLanguage() {
  try { setLanguage(localStorage.getItem(STORAGE) || 'en') } catch { /* English is the default. */ }
}

export function useLanguage() {
  return useSyncExternalStore(subscribe, () => language, () => 'en')
}

// Only presentation text is translated. Routes, form values and customer messages
// keep their original values; React retains ownership of every rendered node.
export function translate(value) {
  if (Array.isArray(value)) return value.map(translate)
  if (language !== 'es' || typeof value !== 'string') return value
  const key = value.replace(/\s+/g, ' ').trim()
  const translated = ES[key]
  if (!translated) return value
  return value.replace(/\S[\s\S]*\S|\S/, translated)
}

const spanishTitles = {
  'Interior Painting': ['Pintura', 'interior'],
  'Exterior Painting': ['Pintura', 'exterior'],
  'Commercial Painting & Finishes': ['Pintura y acabados', 'comerciales'],
  'HOA & Condominium Painting': ['Pintura para HOA', 'y condominios'],
  'Painting & Home Improvement Solutions': ['Soluciones de pintura', 'y renovación', 'del hogar'],
  'Our Story': ['Nuestra', 'historia'],
  'Our Commercial Services': ['Nuestros servicios', 'comerciales'],
  'Our Interior Painting Service': ['Nuestro servicio de', 'pintura interior'],
  'Our Exterior Painting Service': ['Nuestro servicio de', 'pintura exterior'],
  'Our Stucco Services': ['Nuestros servicios', 'de estuco'],
  'Our Drywall Services': ['Nuestros servicios', 'de drywall'],
  'Our Carpentry Services': ['Nuestros servicios', 'de carpintería'],
  'Custom Finishes': ['Acabados', 'personalizados'],
  'Community Solutions': ['Soluciones', 'para comunidades'],
  'Property Solutions': ['Soluciones', 'para propiedades'],
  'Recent Commercial Projects': ['Proyectos comerciales', 'recientes'],
  'Recent Projects': ['Proyectos', 'recientes'],
}

export function translateLines(lines) {
  return language === 'es' ? spanishTitles[lines.join(' ')] || lines.map(translate) : lines
}
