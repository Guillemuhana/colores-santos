# Colores Santos assistant

The website assistant replaces the floating WhatsApp shortcut. Existing WhatsApp links remain available inside the assistant and on service/contact pages.

## Knowledge and photos

`src/data/assistant.js` derives its service descriptions and approved images from `src/data/services.js`, and business contact details and areas from `src/config.js`. Update those sources when the company approves new information. The assistant does not quote prices, confirm bookings, or claim to submit leads. Customers review and submit the existing contact form themselves.

## AI activation

`api/chat.js` uses AI SDK 7 and the direct Groq provider, as requested by the owner. Set `GROQ_API_KEY` as a Secret in the project's Vercel Environment Variables for Production (and Preview for staged tests). Never use a `VITE_` prefix, commit a credential, or send it through chat. No Vercel AI Gateway card is needed for this direct connection.

Default model: `openai/gpt-oss-20b`, verified against Groq's structured-output documentation during implementation. Set `GROQ_MODEL` to another supported text/strict-structured-output model if needed. Groq's free tier has request and token limits; confirm the account's current quotas in Groq Console. `vercel dev` supports local Vercel Function development; Vite alone does not serve `/api/chat`.

When Groq is unavailable, not configured, or rate limited, the API returns an explicitly labelled service guide with approved photos, contact links and useful factual responses. This guide is not a substitute for the full AI conversation. It does not store or submit a lead.

## Conversation and handoff

Conversation continuity uses browser session storage (up to 30 messages), with at most 16 bounded messages sent per request. The chat history is sent to the AI provider for answering; application logs omit conversation text. Reset clears the current browser conversation. No conversation database or CRM integration is included.

The customer can choose “Get my free estimate” to transfer their own project messages to the contact form. The form remains editable and the customer must submit it. WhatsApp handoff likewise opens a draft message for the customer to send.

The API rejects cross-origin requests, invalid roles and oversized input; generation has a 20-second deadline and 1,200-output-token cap (including model reasoning). There is a best-effort per-instance rate limit. For higher public traffic, configure persistent/platform rate limiting and review Groq account quotas. No paid plan, automatic top-up or budget change is configured by this feature.

## Checks

Run `node --test tests/chat.test.mjs` and `npm run build`. Browser verification covers mobile/desktop layout, photo cards, Spanish UI, keyboard dismissal, error handling and project handoff. Before claiming AI is active, POST a real message to `/api/chat` and verify `ai: true`, not only a successful HTTP status.
