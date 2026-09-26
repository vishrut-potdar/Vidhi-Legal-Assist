// @vitest-environment jsdom
/**
 * End-to-end style test of the whole React app against a fake API:
 * sign-in gate → paste a deed → streamed analysis → every workspace view → clear data → sign out.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { AuthGate } from '../../src/components/AuthGate';
import { PreferencesProvider } from '../../src/context/PreferencesContext';
import { analyzeDocumentStreaming } from '../../src/server/documentAnalysis';

const DEED = `DEED OF SALE
BETWEEN Shri Rajesh Verma (PAN ABCDE1234F) AND Rohan Sharma.
1. Consideration: The Purchaser shall pay Rs 50,00,000.
2. Title: The property is subject to an outstanding mortgage with SBI.
3. Possession shall be delivered in due course after registration.
4. Indemnity: The Purchaser shall indemnify the Vendor against all claims.`;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const ndjson = (events: unknown[]) => new Response(events.map((e) => JSON.stringify(e)).join('\n') + '\n', { status: 200 });

let signedIn = true;
let requests: Array<{ url: string; body: any }> = [];

beforeEach(() => {
  signedIn = true;
  requests = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.url;
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    requests.push({ url, body });

    if (url === '/api/auth/session') return json(signedIn ? { authenticated: true, email: 'vishrutedu@gmail.com' } : { authenticated: false });
    if (url === '/api/auth/logout') {
      signedIn = false;
      return json({ authenticated: false });
    }
    if (url === '/api/document/analyze/stream') {
      // Real server pipeline (offline rule engine) produces the payload the UI renders.
      const events: unknown[] = [];
      const payload = await analyzeDocumentStreaming(body, (e) => events.push(e));
      return ndjson([...events, { type: 'result', payload }]);
    }
    if (url === '/api/pipeline/summary') return json({});
    return json({ error: 'not mocked' }, 404);
  });
});

function renderApp() {
  return render(
    <PreferencesProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </PreferencesProvider>
  );
}

async function analysePastedDeed() {
  await userEvent.click((await screen.findAllByRole('button', { name: /Paste Text/ }))[0]);
  fireEvent.change(screen.getByLabelText('Paste deed or agreement text'), { target: { value: DEED } });
  await userEvent.click(screen.getByRole('button', { name: /Analyze Document with Gemini AI/ }));
  // The analysis notice appears on the workspace once the streamed result arrives.
  await screen.findByRole('status', { name: 'How this document was analysed' }, { timeout: 20000 });
}

const nav = (name: RegExp) => screen.getAllByRole('button', { name })[0];

describe('Vidhi app', () => {
  it('shows the login screen when there is no session', async () => {
    signedIn = false;
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Upload or OCR Your Legal Document')).not.toBeInTheDocument();
  });

  it('analyses a pasted deed and renders every workspace view without crashing', async () => {
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Upload or OCR Your Legal Document' })).toBeInTheDocument();
    await analysePastedDeed();

    // Offline notice explains how the result was produced; PII never reaches the UI.
    const notice = screen.getByRole('status', { name: 'How this document was analysed' });
    expect(notice).toHaveTextContent(/Offline mode/);
    expect(notice).toHaveTextContent(/1 personal identifier masked/);
    expect(document.body.textContent).not.toContain('ABCDE1234F');

    // The request carried the reading level and language.
    const upload = requests.find((r) => r.url === '/api/document/analyze/stream');
    expect(upload?.body).toMatchObject({ language: 'EN', readingLevel: 'standard' });

    // Each nav item opens its view (lazy-loaded) and renders that view's own heading.
    const views: Array<[RegExp, RegExp]> = [
      [/^Document & Clauses/, /./],
      [/^Red-Flag Rubric/, /Red-Flag/],
      [/^Pre-Signing Checklist/, /Pre-Signing Checklist/],
      [/^Version Comparison/, /Version History/],
      [/^Dispute Pathways/, /How Legal Options Play Out/],
      [/^Advocate Brief/, /Intake Brief/],
      [/^Legal Literacy/, /where would it go/],
    ];
    for (const [button, heading] of views) {
      await userEvent.click(nav(button));
      await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument());
      const main = within(document.getElementById('main-content')!);
      expect(main.getAllByRole('heading', { name: heading }).length).toBeGreaterThan(0);
    }
    // The Document view shows the rule engine's findings for this deed.
    await userEvent.click(nav(/^Document & Clauses/));
    expect((await screen.findAllByText(/No fixed possession date/)).length).toBeGreaterThan(0);
  }, 30000);

  it('switches the page language for screen readers', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Upload or OCR Your Legal Document' });
    await userEvent.click(screen.getAllByRole('button', { name: 'हिंदी (Hindi)' })[0]);
    expect(document.documentElement.lang).toBe('hi');
  });

  it('clears all data after confirmation', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Upload or OCR Your Legal Document' });
    await analysePastedDeed();
    localStorage.setItem('vidhi_reading_level', 'simple');

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await userEvent.click(screen.getAllByRole('button', { name: 'Clear my data' })[0]);

    expect(await screen.findByText(/have been cleared from this browser/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Upload or OCR Your Legal Document' })).toBeInTheDocument();
    expect(localStorage.getItem('vidhi_reading_level')).toBeNull();
  }, 20000);

  it('keeps data when the confirmation is cancelled', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Upload or OCR Your Legal Document' });
    await analysePastedDeed();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await userEvent.click(screen.getAllByRole('button', { name: 'Clear my data' })[0]);
    expect(screen.getByRole('status', { name: 'How this document was analysed' })).toBeInTheDocument();
  }, 20000);

  it('signs out back to the login screen', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Upload or OCR Your Legal Document' });
    await userEvent.click(screen.getAllByRole('button', { name: 'Sign out' })[0]);
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('You have been signed out.');
    expect(requests.some((r) => r.url === '/api/auth/logout')).toBe(true);
  });
});
