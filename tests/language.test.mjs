import test from 'node:test'
import assert from 'node:assert/strict'
import { setLanguage, restoreLanguage, translate, translateLines } from '../src/i18n.js'
import { ES } from '../src/data/translations-es.js'
import { SERVICES, DEFAULT_PROCESS } from '../src/data/services.js'
import { SEGMENTS, SEGMENT_PAGES, INDUSTRIES } from '../src/data/segments.js'

test('language selection translates presentation and preserves English source values', () => {
  setLanguage('en')
  assert.equal(translate('Get a Free Estimate'), 'Get a Free Estimate')
  setLanguage('es')
  assert.equal(translate('Get a Free Estimate'), 'Pedir presupuesto gratis')
  assert.equal(translate('  Our Services '), '  Nuestros servicios ')
  assert.deepEqual(translate(['Interior Painting', 'Exterior Painting']), ['Pintura interior', 'Pintura exterior'])
  assert.equal(translate('/residential/interior-painting'), '/residential/interior-painting')
  assert.equal(translate('Mi cocina en Doral'), 'Mi cocina en Doral')
  assert.equal(SERVICES[0].name, 'Interior Painting')
  assert.deepEqual(translateLines(['Custom', 'Finishes']), ['Acabados', 'personalizados'])
  setLanguage('en')
  assert.deepEqual(translateLines(['Custom', 'Finishes']), ['Custom', 'Finishes'])
})

test('approved service and segment content has complete Spanish phrase coverage', () => {
  const unchanged = new Set(['Interior', 'Exterior', 'Drywall'])
  const check = value => {
    if (typeof value === 'string') {
      if (!value.startsWith('/') && /[A-Z]/.test(value) && !unchanged.has(value)) assert.ok(ES[value], `Missing Spanish copy: ${value}`)
    } else if (Array.isArray(value)) value.forEach(check)
  }
  SERVICES.forEach(s => ['name', 'short', 'title', 'intro', 'benefits', 'detailTitle', 'detail', 'includes', 'process', 'baText', 'cta', 'ctaText'].forEach(key => check(s[key])))
  SEGMENTS.forEach(s => { check(s.name); check(s.short) })
  Object.values(SEGMENT_PAGES).forEach(p => Object.entries(p).filter(([k]) => !['hero', 'gallery'].includes(k)).forEach(([,v]) => {
    if (typeof v === 'string' || Array.isArray(v)) check(v)
  }))
  check(DEFAULT_PROCESS)
  check(INDUSTRIES)
})

test('preference survives reload, sets document language and tolerates blocked storage', () => {
  let saved
  globalThis.localStorage = { getItem: () => saved, setItem: (_, value) => { saved = value } }
  globalThis.document = { documentElement: { lang: 'en' } }
  setLanguage('es')
  assert.equal(saved, 'es')
  assert.equal(document.documentElement.lang, 'es')
  restoreLanguage()
  assert.equal(translate('Home'), 'Inicio')
  setLanguage('fr')
  assert.equal(saved, 'es')
  globalThis.localStorage = { getItem() { throw Error('blocked') }, setItem() { throw Error('blocked') } }
  assert.doesNotThrow(restoreLanguage)
  assert.doesNotThrow(() => setLanguage('en'))
  delete globalThis.localStorage
  delete globalThis.document
})
