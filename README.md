# Vidhi — Plain-Language Legal Assistant

[![CI](https://github.com/vishrut-potdar/Vidhi-Legal-Assist/actions/workflows/ci.yml/badge.svg)](https://github.com/vishrut-potdar/Vidhi-Legal-Assist/actions/workflows/ci.yml)

Vidhi helps citizens in India understand property documents (sale deeds, leases, agreements) before they sign. Upload a PDF, Word file or photo, and Vidhi explains each clause in plain language, flags risky terms, answers questions grounded in the document, and prepares questions for an advocate.

Live: https://vidhi-legal-assist.vercel.app (sign-in required)

## Features

- **Document analysis** — PDF text extraction, DOCX, or Gemini OCR for scans/photos; clause-by-clause chunking; streamed progress (reading → masking → analysing → flagging → summary).
- **Grounded Q&A** — short context (summary + most relevant clauses) → answer with verbatim quotes → quotes checked word-for-word against the document → independent verifier checks relevance and support → shown only if approved, otherwise rejected with a reason.
- **Chat** — streaming answers grounded in the open document, with automatic model fallback when a model is rate-limited.
- **Plain language** — Simple / Standard / Detailed reading levels; Hindi and Marathi shown alongside the English original.
- **Security** — PII masking (Aadhaar, PAN, phone, email, UPI, IFSC, bank, card, voter ID, passport) before any text-only AI call; prompt-injection neutralisation; signed session cookies; per-IP rate limits; HTTPS + security headers; documents kept only in the browser tab (session-only) with a "Clear my data" control.
- **Accessibility** — keyboard-operable UI, ARIA roles/states, dialog focus management, live regions, skip link, page `lang` switching, reduced-motion support.

## Architecture

```
src/
  server/              Express API (runs locally via server.ts, on Vercel via api/index.ts)
    app.ts             middleware + routes (createApp)
    auth.ts            email allowlist sign-in, HMAC session cookies
    documentAnalysis.ts  extraction → masking → chunked Gemini analysis → findings → summary
    groundedQA.ts      context selection → answer → quote verification → verifier → approve/reject
    aiPipeline.ts      chat, clause deep-dive, executive summary, pipeline inspector
    aiShared.ts        Gemini client, retries on 429/5xx, reading-level/language prompts
    pii.ts             two-layer PII masking
    security.ts        prompt-injection guard, rate limiter, HTTPS/headers
    chunking.ts, cache.ts
  components/          React UI (views are code-split)
  utils/, hooks/, context/
tests/
  server/              unit + API integration tests (Node)
  client/              component + full-app tests (jsdom)
```

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env    # add GEMINI_API_KEY for real AI analysis
npm run dev             # http://localhost:3000
```

Without `GEMINI_API_KEY` the app runs in clearly-labelled offline mode (keyword rules, no AI).

### Environment variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (server-side only, never sent to the browser) |
| `ALLOWED_EMAILS` | Comma-separated emails allowed to sign in (default: the owner's email) |
| `LOGIN_PASSWORD` | Optional shared password; if unset, any password is accepted for allowed emails |
| `SESSION_SECRET` | Secret used to sign session cookies — set a long random value in production |
| `RATE_LIMIT_API` / `RATE_LIMIT_AI` / `RATE_LIMIT_UPLOAD` | Requests per minute per IP (defaults 120 / 30 / 6) |

## Testing

```bash
npm test                # run all tests once
npm run test:watch      # watch mode
npm run test:coverage   # tests + coverage report (coverage/index.html)
npm run check           # type-check + tests
```

The suite uses **Vitest**, **Testing Library** (jsdom) and **Supertest**. Gemini is always replaced by a scripted fake (`tests/helpers/gemini.ts`), so tests are deterministic, offline and never use API quota.

| Area | What is tested |
|---|---|
| PII masking | every identifier type, card-vs-Aadhaar precedence, ordinary legal text left untouched |
| Security | prompt-injection patterns, invisible characters, nonce delimiters, rate limiting, HTTPS redirect, headers |
| Grounded Q&A | approval path; rejection for fabricated quotes, unsupported claims, unrelated questions, no document, verifier failure; context selection; PII never sent |
| Document analysis | streamed stage order, masking in output, injection flagging, chunk fallback, boilerplate cache, Hindi fields |
| Retries | 429/503 retry with backoff, Google's `retryDelay` hint, no retry on daily quota / bad key |
| API | sign-in, session tamper resistance, sign-out, route protection, input validation, NDJSON streaming, rate limits |
| UI | reading-level toggle, bilingual text, progress stepper, login form, Q&A dialog, chat streaming, upload dialog, keyboard activation, report export |
| Full app | sign-in gate → analyse a deed → every workspace view → clear data → sign out |

CI (GitHub Actions) runs the type-check, tests with coverage thresholds, and a production build on every push and pull request.

## Deployment (Vercel)

`vercel.json` builds the Vite frontend as static files and rewrites `/api/*` to `api/index.ts`, which serves the same Express app. Set `GEMINI_API_KEY` and `SESSION_SECRET` in the Vercel project's environment variables. Vercel limits request bodies to 4.5 MB, so uploads above ~3 MB are rejected with a clear message.

## Disclaimer

Vidhi provides legal information, not legal advice. Always confirm with a qualified advocate before signing.
