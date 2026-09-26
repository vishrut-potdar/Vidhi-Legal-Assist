import { afterEach } from 'vitest';

// Tests must never call the real Gemini API or depend on a developer's .env.
delete process.env.GEMINI_API_KEY;
delete process.env.LOGIN_PASSWORD;
delete process.env.ALLOWED_EMAILS;
process.env.SESSION_SECRET = 'test-session-secret';

// DOM matchers, browser API stand-ins and cleanup only where a DOM exists (jsdom component tests).
if (typeof window !== 'undefined') {
  await import('@testing-library/jest-dom/vitest');
  const { cleanup } = await import('@testing-library/react');

  // jsdom does not implement these; the app uses them for charts, scrolling and read-aloud.
  (globalThis as any).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView ??= function () {};
  (window as any).speechSynthesis ??= { speak() {}, cancel() {}, getVoices: () => [] };
  (globalThis as any).SpeechSynthesisUtterance ??= class {
    constructor(public text: string) {}
  };

  afterEach(() => {
    cleanup();
    try {
      localStorage.clear();
    } catch {}
  });
}
