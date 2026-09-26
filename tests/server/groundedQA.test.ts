import { afterEach, describe, expect, it } from 'vitest';
import { answerGroundedQuestion, GroundingDocument } from '../../src/server/groundedQA';
import { clearGeminiKey, geminiError, mockGemini } from '../helpers/gemini';

const DOC: GroundingDocument = {
  title: 'Sale Deed — Flat 12',
  summary: 'Sale of Flat 12, Baner, Pune.',
  clauses: [
    { clauseNumber: 1, pageNumber: 1, title: 'Consideration', text: '1. The Purchaser shall pay Rs 50,00,000 of which Rs 5,00,000 is paid as earnest money.' },
    { clauseNumber: 2, pageNumber: 1, title: 'Possession', text: '2. The Vendor shall hand over vacant possession within 30 days of registration.' },
    { clauseNumber: 3, pageNumber: 2, title: 'Charges', text: '3. Stamp duty and registration charges shall be borne by the Purchaser. Vendor PAN ABCDE1234F.' },
    { clauseNumber: 4, pageNumber: 2, title: 'Disputes', text: '4. Disputes shall be referred to arbitration in Pune.' },
  ],
};

/** doc: omitted = sample deed, null = no document open */
const ask = (question: string, doc: GroundingDocument | null = DOC) => {
  const stages: string[] = [];
  return answerGroundedQuestion(question, doc ?? undefined, 'EN', 'standard', (e) => stages.push(e.stage)).then((result) => ({ result, stages }));
};

const JUDGE_OK = { questionRelated: true, answerSupported: true, reason: 'Supported.' };

afterEach(() => clearGeminiKey());

describe('grounded Q&A: approval', () => {
  it('approves an answer whose quote exists verbatim and that the verifier accepts', async () => {
    const gemini = mockGemini([
      {
        inDocument: true,
        answer: 'Within 30 days of registration.',
        citations: [{ clauseNumber: 2, quote: 'hand over vacant possession within 30 days of registration' }],
        citizenAction: 'Ask for a penalty for delay.',
      },
      JUDGE_OK,
    ]);
    const { result, stages } = await ask('When do I get possession?');

    expect(result.status).toBe('approved');
    expect(result.answer).toBe('Within 30 days of registration.');
    expect(result.citations).toEqual([
      { clauseNumber: 2, pageNumber: 1, quote: 'hand over vacant possession within 30 days of registration' },
    ]);
    expect(result.checks).toEqual({ questionRelated: true, answerSupported: true, citationsVerified: 1, citationsRejected: 0 });
    expect(stages).toEqual(['context', 'answering', 'verifying', 'done']);
    expect(gemini.calls).toHaveLength(2); // answer + independent verification
  });

  it('sends only the relevant clauses as context, not the whole document', async () => {
    const gemini = mockGemini([{ inDocument: false, answer: '' }]);
    await ask('When do I get possession?');
    const prompt = gemini.calls[0].contents[0].parts[0].text as string;
    expect(prompt).toContain('[Clause 2');
    expect(prompt).not.toContain('[Clause 4');
  });

  it('includes a clause the question names explicitly', async () => {
    const gemini = mockGemini([{ inDocument: false, answer: '' }]);
    await ask('Explain clause 4 to me');
    expect(gemini.calls[0].contents[0].parts[0].text).toContain('[Clause 4');
  });

  it('masks personal identifiers before anything reaches the model', async () => {
    const gemini = mockGemini([{ inDocument: false, answer: '' }]);
    await ask('Who pays stamp duty? My Aadhaar is 2345 6789 0123');
    const sent = gemini.sentText();
    expect(sent).not.toContain('ABCDE1234F');
    expect(sent).not.toContain('2345 6789 0123');
    expect(sent).toContain('REDACTED_PAN');
  });
});

describe('grounded Q&A: rejection', () => {
  it('rejects when the model says the document does not answer the question (one call only)', async () => {
    const gemini = mockGemini([{ inDocument: false, answer: '' }]);
    const { result } = await ask('What is the capital of France?');
    expect(result.status).toBe('rejected');
    expect(result.rejection?.kind).toBe('not_in_document');
    expect(result.answer).toBeUndefined();
    expect(gemini.calls).toHaveLength(1);
  });

  it('rejects an answer whose quote is not in the document (fabricated citation)', async () => {
    mockGemini([
      { inDocument: true, answer: 'Immediately.', citations: [{ clauseNumber: 2, quote: 'possession shall be given immediately on signing' }] },
      JUDGE_OK,
    ]);
    const { result } = await ask('When do I get possession?');
    expect(result.status).toBe('rejected');
    expect(result.rejection?.kind).toBe('unsupported');
    expect(result.checks.citationsRejected).toBe(1);
    expect(result.answer).toBeUndefined();
  });

  it('rejects when the verifier finds claims beyond the document', async () => {
    mockGemini([
      { inDocument: true, answer: 'The Purchaser pays, at 6%.', citations: [{ clauseNumber: 3, quote: 'borne by the Purchaser' }] },
      { questionRelated: true, answerSupported: false, reason: 'The 6% rate is not in the document.' },
    ]);
    const { result } = await ask('Who pays stamp duty?');
    expect(result.status).toBe('rejected');
    expect(result.rejection).toEqual({ kind: 'unsupported', reason: 'The 6% rate is not in the document.' });
  });

  it('rejects when the verifier says the question is not about the document', async () => {
    mockGemini([
      { inDocument: true, answer: 'Arbitration is in Pune.', citations: [{ clauseNumber: 4, quote: 'referred to arbitration in Pune' }] },
      { questionRelated: false, answerSupported: true, reason: 'This is a joke request.' },
    ]);
    const { result } = await ask('Tell me a joke about arbitration');
    expect(result.rejection?.kind).toBe('unrelated');
  });

  it('rejects without calling the model when no document is open', async () => {
    const gemini = mockGemini([]);
    for (const doc of [null, { title: 'Empty', clauses: [] }]) {
      const { result } = await ask('anything', doc as any);
      expect(result.rejection?.kind).toBe('no_document');
    }
    expect(gemini.calls).toHaveLength(0);
  });

  it('rejects as unavailable when Gemini is not configured', async () => {
    const { result } = await ask('When do I get possession?');
    expect(result.rejection?.kind).toBe('unavailable');
  });

  it('never shows an unverified answer when the verifier call fails', async () => {
    mockGemini([
      { inDocument: true, answer: 'Within 30 days.', citations: [{ clauseNumber: 2, quote: 'within 30 days of registration' }] },
      geminiError(400, 'API key not valid'),
      geminiError(400, 'API key not valid'),
    ]);
    const { result } = await ask('When do I get possession?');
    expect(result.status).toBe('rejected');
    expect(result.rejection?.kind).toBe('unavailable');
    expect(result.answer).toBeUndefined();
  });

  it('falls back to the lite model when the default model fails', async () => {
    const gemini = mockGemini([geminiError(404, 'NOT_FOUND'), { inDocument: false, answer: '' }]);
    const { result } = await ask('What is the capital of France?');
    expect(result.rejection?.kind).toBe('not_in_document');
    expect(gemini.calls.map((c) => c.model)).toEqual(['gemini-3.8-flash', 'gemini-3.1-flash-lite']);
  });
});
