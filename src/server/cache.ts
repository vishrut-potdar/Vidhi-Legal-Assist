/**
 * Small in-memory LRU cache with TTL for AI explanations of boilerplate clauses.
 * Lives only in process memory — nothing is written to disk, and entries expire.
 */

import { createHash } from 'crypto';

export class TTLCache<V> {
  private store = new Map<string, { value: V; expiresAt: number }>();
  hits = 0;
  misses = 0;

  constructor(private maxEntries: number, private ttlMs: number) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }
    // Refresh LRU position
    this.store.delete(key);
    this.store.set(key, entry);
    this.hits++;
    return entry.value;
  }

  set(key: string, value: V) {
    if (this.store.has(key)) this.store.delete(key);
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
    }
  }

  get size() {
    return this.store.size;
  }
}

export function hashKey(...parts: string[]): string {
  return createHash('sha256').update(parts.join('␞')).digest('hex');
}

/** Normalises clause text so trivially different copies of the same boilerplate share a cache entry. */
export function normalizeClauseText(text: string): string {
  return text
    .toLowerCase()
    .replace(/^\s*(?:clause|article|section)?\s*\d{1,3}[.):-]?\s*/i, '') // drop leading clause number
    .replace(/[“”"'‘’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Only generic boilerplate is cached. Anything that could carry deal-specific or
 * personal detail (amounts, dates, redacted identifiers, names with honorifics)
 * is always analysed fresh and never retained.
 */
export function isCacheableBoilerplate(text: string): boolean {
  const body = text.replace(/^\s*(?:clause|article|section)?\s*\d{1,3}[.):-]?\s*/i, '');
  if (body.length < 40 || body.length > 1500) return false;
  if (/\d/.test(body)) return false;
  if (/REDACTED|NEUTRALISED/.test(body)) return false;
  if (/₹|\brs\.?\s|\binr\b|lakh|crore/i.test(body)) return false;
  if (/\b(?:shri|smt|mr|mrs|ms|dr|kumari)\.?\s+[A-Z]/.test(body)) return false;
  return true;
}
