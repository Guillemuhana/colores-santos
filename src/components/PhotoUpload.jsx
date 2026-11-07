import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { upload } from '@vercel/blob/client'
import { Camera, CircleAlert, Check, ImagePlus, X } from 'lucide-react'

export const MAX_PHOTOS = 10

/* Downscale big phone photos in the browser (max 2000px, JPEG) so uploads are fast.
 * Falls back to the original file if the browser can't decode it (e.g. HEIC on Chrome). */
async function compress(file) {
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
    const w = Math.round(bmp.width * scale)
    const h = Math.round(bmp.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(bmp, 0, 0, w, h)
    bmp.close?.()
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

const slug = (s) => s.toLowerCase().replace(/\.\w+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo'

/**
 * Photo picker for the estimate form. Photos upload to Vercel Blob as soon as they
 * are picked; `onChange` receives the list of items ({ id, preview, status, url }).
 */
export function PhotoUpload({ items, onChange }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const latest = useRef(items)
  latest.current = items

  const patch = (id, data) => {
    latest.current = latest.current.map((p) => (p.id === id ? { ...p, ...data } : p))
    onChange(latest.current)
  }

  const add = (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
    const room = MAX_PHOTOS - latest.current.length
    const fresh = files.slice(0, Math.max(0, room)).map((file) => ({
      id: crypto.randomUUID?.() || String(Math.random()),
      name: file.name,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
      file,
    }))
    if (!fresh.length) return
    latest.current = [...latest.current, ...fresh]
    onChange(latest.current)

    fresh.forEach(async (item) => {
      try {
        const small = await compress(item.file)
        const ext = small.type === 'image/jpeg' ? 'jpg' : (small.name.split('.').pop() || 'jpg').toLowerCase()
        const blob = await upload(`estimates/${new Date().toISOString().slice(0, 10)}/${slug(item.name)}.${ext}`, small, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: small.type || undefined,
          onUploadProgress: ({ percentage }) => patch(item.id, { progress: percentage }),
        })
        patch(item.id, { status: 'done', progress: 100, url: blob.url, file: undefined })
      } catch {
        patch(item.id, { status: 'error', file: undefined })
      }
    })
  }

  const remove = (id) => {
    const it = latest.current.find((p) => p.id === id)
    if (it) URL.revokeObjectURL(it.preview)
    latest.current = latest.current.filter((p) => p.id !== id)
    onChange(latest.current)
  }

  const full = items.length >= MAX_PHOTOS

  return (
    <div>
      <p className="mb-2 mt-6 flex items-baseline justify-between text-sm font-bold">
        <span>Photos of the house / area to paint</span>
        <span className="text-xs font-semibold text-ink/45">{items.length}/{MAX_PHOTOS} · optional</span>
      </p>

      {!full && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files) }}
          className={`group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-all ${drag ? 'scale-[1.01] border-brand-400 bg-brand-50' : 'border-black/12 bg-mist/50 hover:border-brand-300 hover:bg-brand-50/60'}`}
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-md shadow-forest-900/10 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-3">
            <ImagePlus className="size-6" />
          </span>
          <span className="font-semibold">
            <span className="hidden sm:inline">Drag &amp; drop photos or </span><span className="text-brand-600 underline decoration-brand-300 underline-offset-4">choose photos</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-ink/55">
            <Camera className="size-3.5" /> Walls, rooms, exterior, damage… they help us quote faster
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => { add(e.target.files); e.target.value = '' }}
      />

      {items.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          <AnimatePresence initial={false}>
            {items.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="relative aspect-square overflow-hidden rounded-xl bg-mist ring-1 ring-black/5"
              >
                <img src={p.preview} alt={p.name} className="h-full w-full object-cover" />
                {p.status === 'uploading' && (
                  <div className="absolute inset-0 grid place-items-center bg-forest-950/45 text-xs font-bold text-white">
                    {Math.round(p.progress)}%
                    <span className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/30">
                      <span className="block h-full rounded-full bg-brand-400 transition-[width]" style={{ width: `${p.progress}%` }} />
                    </span>
                  </div>
                )}
                {p.status === 'done' && (
                  <span className="absolute bottom-1.5 left-1.5 grid size-6 place-items-center rounded-full bg-brand-400 text-forest-950 shadow"><Check className="size-3.5" /></span>
                )}
                {p.status === 'error' && (
                  <div className="absolute inset-0 grid place-items-center bg-red-900/55 p-1 text-center text-[10px] font-bold leading-tight text-white">
                    <span><CircleAlert className="mx-auto mb-0.5 size-4" />Couldn't upload</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white"
                >
                  <X className="size-3.5" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}

export default PhotoUpload
