# Colores Santos — Painting & Finishes

Sitio web de Colores Santos (Miami): home, residencial, 8 páginas de servicio, commercial, HOA & condominios, property management, about y contacto.

## Stack
- React 19 + Vite 8
- Tailwind CSS 4
- Motion (animaciones), Lenis (scroll suave), lucide-react (íconos)
- React Router

## Efectos
- Rodillo que "pinta" la foto del hero al cargar
- Trazos de pincel secos detrás de los títulos
- Gotas de pintura que chorrean de las secciones oscuras
- Pincel que pinta bajo el cursor (desktop) y se seca solo
- Slider before/after arrastrable con rodillo
- Títulos que aparecen palabra por palabra, parallax, botones magnéticos

## Configurar
Datos del negocio (WhatsApp, teléfono, email, horarios): `src/config.js`.
Textos de servicios: `src/data/services.js` · Segmentos: `src/data/segments.js`.
Fotos: `public/img/` (por ahora son recortes de los mockups — reemplazar por fotos reales con el mismo nombre).

El formulario de contacto y los botones "Get a Free Estimate" abren WhatsApp con el mensaje armado (sin backend).

## Desarrollo
```bash
npm install
npm run dev
npm run build
```

Deploy: Vercel (preset Vite). `vercel.json` incluye el rewrite para las rutas SPA.

## Fotos
Las fotos de heroes, tarjetas y galerías son de [Unsplash](https://unsplash.com/license) (licencia gratuita, uso comercial permitido, sin atribución obligatoria).
Lo ideal es ir reemplazándolas por fotos reales de trabajos de Colores Santos, con el mismo nombre de archivo (mínimo ~1600 px de ancho para heroes).
La sección Before/After está oculta (`SHOW_BEFORE_AFTER` en `src/config.js`) hasta tener fotos reales de antes/después.

## SEO
- `src/seo.js`: title, description, Open Graph y datos estructurados (JSON-LD) por página.
- `npm run build` genera HTML estático por ruta, `sitemap.xml`, `robots.txt` y `404.html`.
- Cambiar `SITE_URL` en `src/config.js` cuando haya dominio propio, y dar de alta el sitio en Google Search Console + Google Business Profile.
