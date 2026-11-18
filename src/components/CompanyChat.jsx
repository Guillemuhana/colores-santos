import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Send, X, RotateCcw, LoaderCircle } from 'lucide-react'
import { CHAT_SERVICES } from '../data/assistant'
import { waLink } from '../config'
import { Logo } from './Logo'
import { useLanguage, translate } from '../i18n'

const STORAGE = 'colores-chat-v1'
export const HANDOFF = 'colores-chat-project'
const copy = {
  en: { title: 'Your project starts here', sub: 'Colores Santos · AI assistant', welcome: 'Hi! I’m the Colores Santos assistant. I can help you explore services, see our work and request a free estimate. What do you have in mind?', placeholder: 'Tell us about your project…', send: 'Send message', contact: 'Get my free estimate', human: 'Talk to the team on WhatsApp', guide: 'Quick service guide · The team can help with more details.', error: 'We couldn’t send that message. Please try again or contact our team.', retry: 'Try again', note: 'AI can make mistakes. Prices and availability are confirmed by our team.', photos: 'See this service', close: 'Close assistant', reset: 'Start a new conversation', open: 'Chat with Colores Santos', chips: ['Show me your services', 'I’d like a free estimate', 'Show cabinet painting photos'] },
  es: { title: 'Tu proyecto empieza acá', sub: 'Colores Santos · Asistente con IA', welcome: '¡Hola! Soy el asistente de Colores Santos. Puedo ayudarte a conocer los servicios, ver trabajos y pedir un presupuesto gratuito. ¿Qué te gustaría renovar?', placeholder: 'Contanos sobre tu proyecto…', send: 'Enviar mensaje', contact: 'Pedir mi presupuesto gratuito', human: 'Hablar con el equipo por WhatsApp', guide: 'Guía rápida de servicios · El equipo puede ayudarte con más detalles.', error: 'No pudimos enviar el mensaje. Intentá nuevamente o contactá al equipo.', retry: 'Reintentar', note: 'La IA puede equivocarse. El equipo confirma precios y disponibilidad.', photos: 'Ver este servicio', close: 'Cerrar asistente', reset: 'Empezar otra conversación', open: 'Chatear con Colores Santos', chips: ['Quiero conocer los servicios', 'Quiero un presupuesto gratuito', 'Mostrame fotos de cabinets'] },
}

export default function CompanyChat() {
  const [open, setOpen] = useState(false)
  const lang = useLanguage()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  const panel = useRef(null)
  const field = useRef(null)
  const bottom = useRef(null)
  const trigger = useRef(null)
  const controller = useRef(null)
  const busy = useRef(false)
  const ready = useRef(false)
  const t = copy[lang]
  const guideMode = messages.filter(m => m.role === 'assistant').at(-1)?.ai === false

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE))
      if (Array.isArray(saved?.messages)) setMessages(saved.messages.filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string').slice(-30))
    } catch { /* Storage may be disabled. */ }
    ready.current = true
    return () => controller.current?.abort()
  }, [])
  useEffect(() => { if (ready.current) try { sessionStorage.setItem(STORAGE, JSON.stringify({ lang, messages })) } catch { /* Optional session continuity. */ } }, [messages, lang])
  useEffect(() => { if (open) field.current?.focus() }, [open])
  useEffect(() => { if (open) bottom.current?.scrollIntoView({ block: 'nearest' }) }, [messages, pending, open])

  const close = () => { setOpen(false); trigger.current?.focus() }
  const requestReply = async (next) => {
    if (busy.current) return
    busy.current = true; setPending(true); setError(false)
    controller.current = new AbortController()
    const timeout = setTimeout(() => controller.current.abort(), 26000)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.slice(-16).map(({ role, content }) => ({ role, content: content.slice(0, 1500) })) }), signal: controller.current.signal })
      if (!response.ok) throw new Error('unavailable')
      const data = await response.json()
      if (typeof data.reply !== 'string') throw new Error('invalid response')
      setMessages([...next, { role: 'assistant', content: data.reply, serviceSlugs: Array.isArray(data.serviceSlugs) ? data.serviceSlugs : [], showContact: !!data.showContact, ai: data.ai }].slice(-30))
    } catch { setError(true) }
    finally { clearTimeout(timeout); busy.current = false; setPending(false) }
  }
  const send = (text) => {
    if (!text.trim() || busy.current) return
    const next = [...messages, { role: 'user', content: text.trim().slice(0, 1200) }]
    setMessages(next); setInput(''); requestReply(next)
  }
  const summary = () => messages.filter(m => m.role === 'user').map(m => m.content).join('\n').slice(-3000)
  const handoff = () => {
    try { sessionStorage.setItem(HANDOFF, summary()) } catch { /* Form still works without storage. */ }
    window.dispatchEvent(new Event('colores-chat-handoff')); close()
  }
  const onKeyDown = (event) => {
    if (event.key === 'Escape') { event.preventDefault(); close() }
    if (event.key === 'Tab') {
      const nodes = [...panel.current.querySelectorAll('button:not([disabled]), a[href], textarea:not([disabled])')]
      const first = nodes[0], last = nodes.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
  }
  return <>
    {!open && <button ref={trigger} onClick={() => setOpen(true)} aria-label={t.open} aria-expanded={open} aria-controls="company-chat" className="fixed bottom-5 right-5 z-50 flex h-15 items-center gap-2 rounded-full bg-forest-900 px-5 font-semibold text-white shadow-xl ring-2 ring-brand-300 transition hover:bg-forest-800 focus-visible:outline-4 focus-visible:outline-brand-400"><img src="/favicon.svg" alt="" width="36" height="36" className="size-9 rounded-xl" /><span>{lang === 'es' ? 'Conversemos' : 'Let\u2019s talk'}</span></button>}
    {open && <section ref={panel} id="company-chat" role="dialog" aria-label={t.title} onKeyDown={onKeyDown} data-lenis-prevent className="company-chat fixed bottom-4 right-4 z-[60] flex w-[400px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-brand-200 bg-white text-ink shadow-2xl">
      <header className="flex items-center gap-2 bg-forest-900 px-4 py-4 text-white">
        <div className="min-w-0 flex-1"><h2 className="sr-only">{t.title}</h2><Logo light className="text-[5.5px]" /><p className="mt-2 text-[10px] text-brand-200">{guideMode ? (lang === 'es' ? 'Colores Santos · Guía de servicios' : 'Colores Santos · Service guide') : t.sub}</p></div>
        <button onClick={close} className="rounded-lg p-2 hover:bg-white/10" aria-label={t.close}><X className="size-5" /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-mist/35 p-4" role="log" aria-live="polite" aria-relevant="additions" aria-busy={pending}>
        <p className="mr-6 rounded-2xl rounded-tl-sm border border-black/5 bg-white p-3.5 text-sm leading-relaxed shadow-sm">{t.welcome}</p>
        {!messages.length && <div className="mt-4 flex flex-wrap gap-2">{t.chips.map(c => <button disabled={pending} key={c} onClick={() => send(c)} className="rounded-xl border border-brand-300 bg-white px-3 py-2 text-left text-xs font-semibold text-brand-700 hover:bg-brand-50">{c}</button>)}</div>}
        {messages.map((message, index) => <div key={index} className={`mt-4 ${message.role === 'user' ? 'ml-8' : 'mr-3'}`}>
          <p className={`whitespace-pre-wrap rounded-2xl p-3.5 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-tr-sm bg-brand-200' : 'rounded-tl-sm border border-black/5 bg-white shadow-sm'}`}>{message.content}</p>
          {message.role === 'assistant' && message.ai === false && <p className="mt-1 px-1 text-[10px] text-ink/55">{t.guide}</p>}
          {message.role === 'assistant' && (message.serviceSlugs || []).map(slug => CHAT_SERVICES.find(s => s.slug === slug)).filter(Boolean).slice(0, 2).map(s => <Link key={s.slug} to={s.href} onClick={close} className="mt-2 block overflow-hidden rounded-2xl border border-brand-200 bg-white"><img src={s.image} alt={`${translate(s.name)} — Colores Santos`} className="aspect-video w-full object-cover" loading="lazy" /><span className="flex items-center justify-between gap-2 p-3 text-xs font-semibold">{translate(s.name)}<ArrowRight className="size-4 shrink-0" /></span></Link>)}
          {message.showContact && <Link to="/contact" onClick={handoff} className="mt-2 flex items-center justify-between rounded-xl bg-brand-300 p-3 text-sm font-bold">{t.contact}<ArrowRight className="size-4" /></Link>}
        </div>)}
        {pending && <p className="mt-4 flex items-center gap-2 text-xs text-ink/60"><LoaderCircle className="size-4 animate-spin" />{lang === 'es' ? 'Preparando una respuesta…' : 'Preparing a reply…'}</p>}
        {error && <div role="alert" className="mt-4 rounded-xl border border-brand-300 bg-white p-3 text-xs"><p>{t.error}</p><button onClick={() => requestReply(messages)} className="mt-2 font-bold underline">{t.retry}</button></div>}
        <div ref={bottom} />
      </div>
      <footer className="border-t border-black/5 bg-white p-4">
        <Link to="/contact" onClick={handoff} className="mb-2 flex items-center justify-between rounded-xl bg-brand-300 px-3 py-2.5 text-xs font-bold">{t.contact}<ArrowRight className="size-4" /></Link>
        <a href={summary() ? waLink(summary()) : waLink()} target="_blank" rel="noreferrer" className="mb-2 flex items-center justify-between rounded-xl border border-brand-300 px-3 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-50">{t.human}<ArrowRight className="size-4" /></a>
        <form onSubmit={e => { e.preventDefault(); send(input) }} className="flex items-end gap-2">
          <label className="sr-only" htmlFor="company-chat-input">{t.placeholder}</label>
          <textarea id="company-chat-input" ref={field} rows={2} maxLength={1200} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input) } }} placeholder={t.placeholder} className="min-w-0 flex-1 resize-none rounded-xl border border-black/15 p-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
          <button type="submit" disabled={pending || !input.trim()} aria-label={t.send} className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-900 text-white disabled:opacity-40"><Send className="size-5" /></button>
        </form>
        <div className="mt-2 flex justify-end"><button disabled={pending} aria-label={t.reset} onClick={() => { setMessages([]); setError(false); setInput(''); field.current?.focus() }} className="rounded-lg p-2 text-ink/50 hover:bg-mist"><RotateCcw className="size-3.5" /></button></div>
        <p className="text-[10px] leading-relaxed text-ink/50">{t.note}</p>
      </footer>
    </section>}
  </>
}
