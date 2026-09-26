// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AskQuestionModal, GroundingDocument } from '../../src/components/AskQuestionModal';
import { PreferencesProvider } from '../../src/context/PreferencesContext';

const DOC: GroundingDocument = {
  title: 'Sale Deed — Flat 12',
  summary: 'Sale of Flat 12.',
  clauses: [{ clauseNumber: 2, pageNumber: 1, text: '2. Possession within 30 days of registration.' }],
};

const ndjson = (...events: object[]) =>
  new Response(events.map((e) => JSON.stringify(e)).join('\n') + '\n', {
    status: 200,
    headers: { 'Content-Type': 'application/x-ndjson' },
  });

const stages = ['context', 'answering', 'verifying', 'done'].map((stage) => ({ type: 'stage', stage }));

function renderModal(props: Partial<React.ComponentProps<typeof AskQuestionModal>> = {}) {
  const onClose = vi.fn();
  render(
    <PreferencesProvider>
      <AskQuestionModal isOpen onClose={onClose} language="EN" groundingDocument={DOC} {...props} />
    </PreferencesProvider>
  );
  return { onClose };
}

describe('AskQuestionModal (grounded Q&A)', () => {
  it('sends the question with the document and shows an approved, verified answer', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      ndjson(...stages, {
        type: 'result',
        result: {
          status: 'approved',
          answer: 'Within 30 days of registration.',
          citations: [{ clauseNumber: 2, pageNumber: 1, quote: 'Possession within 30 days of registration.' }],
          citizenAction: 'Ask for a delay penalty.',
          checks: { questionRelated: true, answerSupported: true, citationsVerified: 1, citationsRejected: 0 },
          contextClauses: [2],
          modelUsed: 'gemini-3.8-flash',
        },
      })
    );
    renderModal();
    await userEvent.type(screen.getByLabelText(/Your question/), 'When do I get possession?');
    await userEvent.click(screen.getByRole('button', { name: /Ask & verify/ }));

    const approved = await screen.findByRole('region', { name: 'Approved answer' });
    expect(approved).toHaveTextContent('Within 30 days of registration.');
    expect(approved).toHaveTextContent('Clause 2 · Page 1');
    expect(approved).toHaveTextContent('1 quote found word-for-word in the document');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/qa/grounded');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({ question: 'When do I get possession?', document: DOC, readingLevel: 'standard' });
  });

  it('shows a rejection card with the reason instead of an answer', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      ndjson(stages[0], stages[1], {
        type: 'result',
        result: {
          status: 'rejected',
          rejection: { kind: 'not_in_document', reason: 'Your document does not contain information that answers this question.' },
          citations: [],
          checks: { questionRelated: null, answerSupported: null, citationsVerified: 0, citationsRejected: 0 },
          contextClauses: [],
          modelUsed: 'gemini-3.8-flash',
        },
      })
    );
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'What is the capital of France?' }));

    const rejected = await screen.findByRole('region', { name: 'Rejected answer' });
    expect(rejected).toHaveTextContent('Rejected: Not answered by your document');
    expect(screen.queryByRole('region', { name: 'Approved answer' })).not.toBeInTheDocument();
    // Steps never reached are shown as skipped, not done
    expect(screen.getByText('Check against document').textContent).toContain('(skipped)');
  });

  it('shows a server error as an alert', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Rate limit for AI questions exceeded.' }), { status: 429 }));
    renderModal();
    await userEvent.type(screen.getByLabelText(/Your question/), 'Anything{enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Rate limit for AI questions exceeded.');
  });

  it('warns when no document is open', () => {
    renderModal({ groundingDocument: undefined });
    expect(screen.getByRole('status')).toHaveTextContent(/Open or upload a document first/);
  });

  it('closes on Escape (accessible dialog)', async () => {
    const { onClose } = renderModal();
    expect(screen.getByRole('dialog', { name: 'Ask your document' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
