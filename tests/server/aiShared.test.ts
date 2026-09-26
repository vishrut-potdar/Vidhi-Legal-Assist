import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  asSeverity,
  describeGeminiError,
  generateContentWithRetry,
  hasGeminiKey,
  normalizeLanguage,
  normalizeReadingLevel,
  parseModelJson,
  readingLevelInstruction,
} from '../../src/server/aiShared';
import { clearGeminiKey, geminiError, mockGemini } from '../helpers/gemini';

afterEach(() => {
  clearGeminiKey();
  vi.useRealTimers();
});

describe('generateContentWithRetry', () => {
  const params = { model: 'm', contents: 'x' } as any;

  it('retries a rate-limited call and then succeeds', async () => {
    vi.useFakeTimers();
    const gemini = mockGemini([geminiError(429), { ok: 1 }]);
    const pending = generateContentWithRetry(params);
    await vi.runAllTimersAsync();
    expect((await pending).text).toBe('{"ok":1}');
    expect(gemini.calls).toHaveLength(2);
  });

  it('retries server overload errors up to twice, then gives up', async () => {
    vi.useFakeTimers();
    const gemini = mockGemini([geminiError(503), geminiError(503), geminiError(503)]);
    const pending = generateContentWithRetry(params).catch((e) => e);
    await vi.runAllTimersAsync();
    expect(describeGeminiError(await pending)).toMatch(/overloaded/);
    expect(gemini.calls).toHaveLength(3);
  });

  it.each([
    ['daily quota', geminiError(429, 'Quota exceeded GenerateRequestsPerDayPerProjectPerModel'), /daily API quota/],
    ['invalid key', geminiError(400, 'API key not valid'), /API key rejected/],
    ['unknown model', geminiError(404, 'models/x is NOT_FOUND'), /model not available/],
  ])('does not retry on %s', async (_label, error, expected) => {
    const gemini = mockGemini([error, { never: 'used' }]);
    const err = await generateContentWithRetry(params).catch((e) => e);
    expect(describeGeminiError(err)).toMatch(expected);
    expect(gemini.calls).toHaveLength(1);
  });

  it("honours Google's suggested retry delay", async () => {
    vi.useFakeTimers();
    mockGemini([geminiError(429, 'retryDelay: 3s'), { ok: 1 }]);
    let done = false;
    generateContentWithRetry(params).then(() => (done = true));
    await vi.advanceTimersByTimeAsync(2900);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(200);
    expect(done).toBe(true);
  });
});

describe('helpers', () => {
  it('detects whether a real key is configured', () => {
    expect(hasGeminiKey()).toBe(false);
    process.env.GEMINI_API_KEY = 'MY_GEMINI_API_KEY'; // placeholder from .env.example
    expect(hasGeminiKey()).toBe(false);
    process.env.GEMINI_API_KEY = 'real-looking-key';
    expect(hasGeminiKey()).toBe(true);
  });

  it('parses model JSON with code fences or surrounding text', () => {
    expect(parseModelJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseModelJson('Here you go: {"a":2} thanks')).toEqual({ a: 2 });
    expect(parseModelJson('not json')).toBeNull();
    expect(parseModelJson(undefined)).toBeNull();
  });

  it('normalises untrusted request values', () => {
    expect(normalizeLanguage('HI')).toBe('HI');
    expect(normalizeLanguage('FR')).toBe('EN');
    expect(normalizeReadingLevel('simple')).toBe('simple');
    expect(normalizeReadingLevel('<script>')).toBe('standard');
    expect(asSeverity('high')).toBe('HIGH');
    expect(asSeverity('critical')).toBe('MEDIUM');
  });

  it('gives each reading level distinct instructions', () => {
    expect(readingLevelInstruction('simple')).toMatch(/Class 8/);
    expect(readingLevelInstruction('detailed')).toMatch(/statute and section/);
    expect(readingLevelInstruction('standard')).toMatch(/STANDARD/);
  });
});
