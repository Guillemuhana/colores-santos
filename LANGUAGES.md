# Website languages

The header selector offers English and Spanish on desktop and mobile. It changes
navigation, page copy, service descriptions, estimate form, footer and chat UI.
The chat language button uses the same preference. Existing conversation text and
customer form input are preserved when switching.

English is the default and the prerendered SEO language. The visitor's selection
is saved in `localStorage` as `colores-language-v1`; the document `lang` attribute
follows the selection. There are no additional Spanish URLs or hreflang claims.

Maintain Spanish phrases in `src/data/translations-es.js`. Components subscribe
with `useLanguage()` and call `translate()` only for presentation. Keep routes,
service IDs, form values and customer messages in their original form. Animated
headings use `translateLines()` so Spanish word order is correct before splitting
into animated words. No external translation API or per-visit charge is needed.

Checks: `node --test tests/language.test.mjs tests/chat.test.mjs` and `npm run build`.
