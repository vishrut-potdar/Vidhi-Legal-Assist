import { afterEach, describe, expect, it, vi } from 'vitest';
import { TTLCache, hashKey, isCacheableBoilerplate, normalizeClauseText } from '../../src/server/cache';

describe('TTLCache', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns stored values and tracks hits and misses', () => {
    const cache = new TTLCache<string>(10, 1000);
    cache.set('a', 'one');
    expect(cache.get('a')).toBe('one');
    expect(cache.get('missing')).toBeUndefined();
    expect([cache.hits, cache.misses]).toEqual([1, 1]);
  });

  it('expires entries after the TTL', () => {
    vi.useFakeTimers();
    const cache = new TTLCache<number>(10, 1000);
    cache.set('k', 1);
    vi.advanceTimersByTime(999);
    expect(cache.get('k')).toBe(1);
    vi.advanceTimersByTime(2);
    expect(cache.get('k')).toBeUndefined();
  });

  it('evicts the least recently used entry when full', () => {
    const cache = new TTLCache<number>(2, 60_000);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a'); // a is now most recently used
    cache.set('c', 3);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe(1);
    expect(cache.size).toBe(2);
  });
});

describe('boilerplate caching rules', () => {
  const boilerplate = 'This Deed shall be governed by and construed in accordance with the laws of India.';

  it('caches generic boilerplate', () => {
    expect(isCacheableBoilerplate(boilerplate)).toBe(true);
    expect(isCacheableBoilerplate('12. ' + boilerplate)).toBe(true); // leading clause number is fine
  });

  it.each([
    ['amounts', 'The Purchaser shall pay the consideration of ₹ 50 lakh to the Vendor on execution.'],
    ['dates and digits', 'Possession shall be handed over on the 30th day after registration of this Deed.'],
    ['redacted identifiers', 'The Vendor holds PAN [REDACTED_PAN_4F] and warrants clear and marketable title.'],
    ['names with honorifics', 'Shri Rajesh Verma warrants that the property is free from all encumbrances.'],
    ['very short text', 'Time is of essence.'],
  ])('never caches clauses with %s', (_label, text) => {
    expect(isCacheableBoilerplate(text)).toBe(false);
  });

  it('normalises trivial differences so identical boilerplate shares a key', () => {
    const a = normalizeClauseText('7.  This Deed shall be "governed" by the laws of India.');
    const b = normalizeClauseText('Clause 12 this deed shall be governed by the laws of   india.');
    expect(a).toBe(b);
    expect(hashKey('m', a)).toBe(hashKey('m', b));
    expect(hashKey('m', a)).not.toBe(hashKey('other-model', a));
  });
});
