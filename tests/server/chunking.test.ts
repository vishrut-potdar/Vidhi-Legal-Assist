import { describe, expect, it } from 'vitest';
import { groupIntoChunks, mapWithConcurrency, splitIntoClauses } from '../../src/server/chunking';

const DEED = `DEED OF SALE
BETWEEN Mr A (Vendor) AND Ms B (Purchaser)
1. Consideration: The Purchaser shall pay Rs 50,00,000.
2. Possession: Vacant possession within 30 days.
Clause 3 Indemnity: The Vendor indemnifies the Purchaser.
SCHEDULE
Flat 12, Baner, Pune.`;

describe('splitIntoClauses', () => {
  it('splits numbered clauses and keeps recitals/schedules as clause 0', () => {
    const segments = splitIntoClauses(DEED);
    expect(segments.map((s) => s.clauseNumber)).toEqual([0, 0, 1, 2, 3, 0]);
    expect(segments[2].text).toMatch(/^1\. Consideration/);
    expect(segments[4].heading).toMatch(/Indemnity/);
    expect(new Set(segments.map((s) => s.id)).size).toBe(segments.length);
  });

  it('keeps real page numbers when per-page text is supplied', () => {
    const segments = splitIntoClauses('', ['1. First clause on page one.', '2. Second clause on page two.']);
    expect(segments.map((s) => [s.clauseNumber, s.pageNumber])).toEqual([
      [1, 1],
      [2, 2],
    ]);
  });

  it('splits an oversized clause into several segments under the size cap', () => {
    const long = '5. ' + 'The Purchaser shall comply with every society bye-law. '.repeat(120);
    const segments = splitIntoClauses(long);
    expect(segments.length).toBeGreaterThan(1);
    expect(segments.every((s) => s.clauseNumber === 5 && s.text.length <= 3600)).toBe(true);
  });

  it('returns nothing for empty text', () => {
    expect(splitIntoClauses('')).toEqual([]);
  });
});

describe('groupIntoChunks', () => {
  it('packs consecutive segments without exceeding the budget', () => {
    const segments = Array.from({ length: 10 }, (_, i) => ({
      id: `S${i + 1}`,
      clauseNumber: i + 1,
      heading: '',
      text: 'x'.repeat(3000),
      pageNumber: 1,
    }));
    const chunks = groupIntoChunks(segments, 7000);
    expect(chunks).toHaveLength(5);
    expect(chunks.every((c) => c.charCount <= 7000)).toBe(true);
    expect(chunks.flatMap((c) => c.segments.map((s) => s.id))).toEqual(segments.map((s) => s.id));
  });
});

describe('mapWithConcurrency', () => {
  it('preserves order and never exceeds the concurrency limit', async () => {
    let running = 0;
    let peak = 0;
    const result = await mapWithConcurrency([30, 5, 20, 1, 10, 2], 2, async (ms, i) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, ms));
      running--;
      return i * 10;
    });
    expect(result).toEqual([0, 10, 20, 30, 40, 50]);
    expect(peak).toBe(2);
  });
});
