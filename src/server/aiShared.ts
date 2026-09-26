/**
 * Shared Gemini helpers: client creation, language + reading-level instructions, safe JSON parsing.
 */

import { GoogleGenAI } from '@google/genai';

export type OutputLanguage = 'EN' | 'HI' | 'MR';
export type ReadingLevel = 'simple' | 'standard' | 'detailed';

export const DEFAULT_MODEL = 'gemini-3.8-flash';
/** Separate per-model quota, used as a fallback when the default model is rate limited. */
export const LITE_MODEL = 'gemini-3.1-flash-lite';

export function hasGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== 'MY_GEMINI_API_KEY');
}

let client: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return client;
}

/* ---------------- Retry on rate limits / overload ---------------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function errorStatus(err: any): number {
  const msg = String(err?.message || err || '');
  return Number(err?.status || err?.code || (msg.match(/"code":\s*(\d{3})/) || msg.match(/\b(429|5\d\d)\b/) || [])[1]) || 0;
}

/** Delay before retrying, or null when retrying is pointless (daily quota, auth, bad request). */
function retryDelayMs(err: any, attempt: number): number | null {
  const msg = String(err?.message || err || '');
  const status = errorStatus(err);
  if (status !== 429 && status < 500) return null;
  if (/PerDay|per day|daily/i.test(msg)) return null;
  const hinted = msg.match(/retryDelay"?:\s*"?(\d+(?:\.\d+)?)s/) || msg.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
  if (hinted) {
    const ms = Math.ceil(parseFloat(hinted[1]) * 1000);
    return ms <= 12_000 ? ms : null; // don't hold the request open for long waits
  }
  return [1500, 4000][attempt] ?? null;
}

async function withRetry<T>(run: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run();
    } catch (err) {
      const delay = attempt < maxRetries ? retryDelayMs(err, attempt) : null;
      if (delay === null) throw err;
      await sleep(delay);
    }
  }
}

type GenerateParams = Parameters<GoogleGenAI['models']['generateContent']>[0];

/** generateContent with automatic retries on 429 / 5xx. */
export function generateContentWithRetry(params: GenerateParams) {
  return withRetry(() => getGeminiClient().models.generateContent(params));
}

/** generateContentStream with retries on 429 / 5xx (the error arrives before the first chunk). */
export function generateContentStreamWithRetry(params: GenerateParams) {
  return withRetry(() => getGeminiClient().models.generateContentStream(params));
}

/** Short, user-safe description of a Gemini API failure. */
export function describeGeminiError(err: any): string {
  const msg = String(err?.message || err || '');
  const status = errorStatus(err);
  if (status === 429 || /quota|rate limit|RESOURCE_EXHAUSTED/i.test(msg)) {
    return /PerDay|per day|daily/i.test(msg) ? 'daily API quota used up' : 'API rate limit reached, try again in a minute';
  }
  if (/API key|PERMISSION_DENIED/i.test(msg) || status === 401 || status === 403) return 'API key rejected';
  if (status === 404 || /NOT_FOUND/i.test(msg)) return 'model not available for this key';
  if (status >= 500) return 'Gemini is temporarily overloaded, try again shortly';
  return 'request failed';
}

export function normalizeLanguage(value: unknown): OutputLanguage {
  return value === 'HI' || value === 'MR' ? value : 'EN';
}

export function normalizeReadingLevel(value: unknown): ReadingLevel {
  return value === 'simple' || value === 'detailed' ? value : 'standard';
}

export function readingLevelInstruction(level: ReadingLevel): string {
  switch (level) {
    case 'simple':
      return `READING LEVEL: SIMPLE. Write for a citizen with no legal background (about Class 8 reading level). Use short sentences of at most 15 words and everyday words. Avoid Latin and legal jargon; if a legal term is unavoidable, explain it in brackets. Keep each explanation to 2 short sentences and each list to at most 2 items.`;
    case 'detailed':
      return `READING LEVEL: DETAILED. Give a thorough explanation for a citizen who wants depth: name the relevant statute and section (Transfer of Property Act 1882, Registration Act 1908, RERA 2016, Indian Contract Act 1872, Limitation Act 1963, Maharashtra Stamp Act etc.) where applicable, explain the legal reasoning and realistic edge cases. Still avoid unexplained jargon.`;
    default:
      return `READING LEVEL: STANDARD. Clear plain language for an educated non-lawyer. Mention a statute only when it is essential.`;
  }
}

export function languageInstruction(language: OutputLanguage): string {
  switch (language) {
    case 'HI':
      return `OUTPUT LANGUAGE: Hindi (हिंदी) in Devanagari script. Keep key legal terms in English in brackets after the Hindi term, e.g. "भार (Encumbrance)", so the citizen can match them to the English document.`;
    case 'MR':
      return `OUTPUT LANGUAGE: Marathi (मराठी) in Devanagari script. Keep key legal terms in English in brackets after the Marathi term, e.g. "बोजा (Encumbrance)".`;
    default:
      return `OUTPUT LANGUAGE: English.`;
  }
}

/** Parses model JSON output, tolerating code fences. Returns null on failure. */
export function parseModelJson<T = any>(raw: string | undefined | null): T | null {
  if (!raw) return null;
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const asString = (v: unknown, fallback = ''): string =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback;

export const asStringArray = (v: unknown, max = 6): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, max).map((x) => x.trim()) : [];

export function asSeverity(v: unknown): 'HIGH' | 'MEDIUM' | 'LOW' {
  const s = String(v || '').toUpperCase();
  return s === 'HIGH' || s === 'MEDIUM' || s === 'LOW' ? s : 'MEDIUM';
}
