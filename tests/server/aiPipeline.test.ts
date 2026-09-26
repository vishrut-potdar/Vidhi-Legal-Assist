import { afterEach, describe, expect, it } from 'vitest';
import {
  analyzeClauseWithAI,
  askLegalQuestionWithAI,
  executeAIPipeline,
  generateAIExecutiveSummary,
  handleChatWithAI,
  streamChatWithAI,
} from '../../src/server/aiPipeline';
import { clearGeminiKey, geminiError, mockGemini } from '../helpers/gemini';

afterEach(() => clearGeminiKey());

describe('executeAIPipeline (pipeline inspector)', () => {
  it('masks PII in two layers and records an audit trace', async () => {
    const result = await executeAIPipeline(
      'SALE DEED. Vendor PAN ABCDE1234F, Aadhaar 2345 6789 0123, phone +91 98220 12345, A/c 10293847561. Flat 402, clause 4 mortgage and possession terms of the property deed.'
    );
    expect(result.success).toBe(true);
    expect(result.maskingEntitiesLayer1.map((e) => e.type).sort()).toEqual(['AADHAAR', 'PAN']);
    expect(result.maskingEntitiesLayer2.map((e) => e.type).sort()).toEqual(['BANK_ACCOUNT', 'PHONE']);
    expect(result.maskedText).not.toMatch(/ABCDE1234F|2345 6789 0123|98220|10293847561/);
    expect(result.trace.map((t) => t.stepId)).toContain('step-8-verification');
  });

  it('rejects text that is not a legal document', async () => {
    const result = await executeAIPipeline('Recipe: mix flour and sugar.');
    expect(result).toMatchObject({ success: false, isOutOfContext: true });
  });

  it('uses Gemini output when available and sends only masked, fenced text', async () => {
    const gemini = mockGemini([
      { documentVerdict: 'Review', riskScore: 50, flaggedClauses: [{ clauseNumber: 1, severity: 'HIGH', plainHeadline: 'x' }], advocateQuestionsSummary: [] },
    ]);
    const result = await executeAIPipeline('Deed: vendor PAN ABCDE1234F sells the property under clause 1 with possession and title terms. '.repeat(3));
    expect(result.structuredOutput?.riskScore).toBe(50);
    expect(gemini.sentText()).not.toContain('ABCDE1234F');
    expect(gemini.sentText()).toContain('BEGIN_UNTRUSTED_DOCUMENT');
  });
});

describe('askLegalQuestionWithAI', () => {
  it('refuses to reveal identifiers in offline mode', async () => {
    const res = await askLegalQuestionWithAI("What is the seller's PAN?");
    expect(res.isGroundedInDocument).toBe(false);
    expect(res.category).toBe('PII Protection Refusal');
  });

  it('passes the masked question and document to Gemini', async () => {
    const gemini = mockGemini([{ isGroundedInDocument: true, category: 'Payment', answerPlain: 'Rs 50 lakh.', citizenAction: 'Check.' }]);
    const res = await askLegalQuestionWithAI('Price? call me 9876543210', 'Clause 1: price Rs 50 lakh. Buyer phone 9123456789', 'EN', 'simple');
    expect(res.answerPlain).toBe('Rs 50 lakh.');
    const sent = gemini.sentText();
    expect(sent).not.toMatch(/9876543210|9123456789/);
    expect(sent).toContain('Class 8'); // simple reading level reached the prompt
  });
});

describe('analyzeClauseWithAI', () => {
  const boilerplate = 'This Deed shall be governed by and construed in accordance with the laws of India and the courts at Pune.';
  const reply = { title: 'Governing law', severity: 'LOW', plainExplanation: 'Indian law applies.', advocateCounterClause: 'No change needed.' };

  it('returns rule-based analysis offline', async () => {
    const res = await analyzeClauseWithAI(4, 7, 'Balance payable without mortgage release.');
    expect(res.severity).toBe('HIGH');
    expect(res.modelUsed).toMatch(/Conveyancing Engine/);
  });

  it('caches boilerplate clause explanations', async () => {
    const gemini = mockGemini([reply]);
    const first = await analyzeClauseWithAI(9, 3, boilerplate, 'EN', 'detailed');
    const second = await analyzeClauseWithAI(12, 5, boilerplate, 'EN', 'detailed');
    expect(gemini.calls).toHaveLength(1);
    expect(second).toMatchObject({ clauseNumber: 12, pageNumber: 5, plainExplanation: first.plainExplanation });
    expect(second.modelUsed).toMatch(/cached/);
  });
});

describe('chat', () => {
  const messages = [{ role: 'user' as const, content: 'What is an EC?' }];

  it('answers from the rule engine offline with generic (non-sample) text', async () => {
    const res = await handleChatWithAI([{ role: 'user', content: 'hello there' }]);
    expect(res.modelUsed).toMatch(/Fallback/);
    expect(res.reply).not.toMatch(/Flat 402|Kalyani/);
  });

  it('does not match "ec" inside other words', async () => {
    const res = await handleChatWithAI([{ role: 'user', content: 'Can you check this section?' }]);
    expect(res.reply).not.toMatch(/Encumbrance Certificate/);
  });

  it('falls back from an unavailable model to the default one', async () => {
    const gemini = mockGemini([geminiError(404, 'NOT_FOUND'), 'EC means encumbrance certificate.']);
    const res = await handleChatWithAI(messages, undefined, 'EN', 'fast');
    expect(res.reply).toBe('EC means encumbrance certificate.');
    expect(gemini.calls.map((c) => c.model)).toEqual(['gemini-3.1-flash-lite', 'gemini-3.8-flash']);
  });

  it('streams deltas and explains when another model answered', async () => {
    mockGemini([geminiError(404, 'NOT_FOUND'), 'Streamed answer text.']);
    const deltas: string[] = [];
    const done = await streamChatWithAI(messages, 'Doc context', 'EN', 'deep', 'standard', (t) => deltas.push(t));
    expect(deltas.join('')).toBe('Streamed answer text.');
    expect(done.offline).toBe(false);
    expect(done.notice).toMatch(/gemini-3.1-pro-preview was unavailable \(model not available/);
  });

  it('labels the offline answer when every model fails', async () => {
    mockGemini([geminiError(400, 'API key not valid'), geminiError(400, 'API key not valid'), geminiError(400, 'API key not valid')]);
    const done = await streamChatWithAI(messages, undefined, 'EN', 'general', 'standard', () => {});
    expect(done).toMatchObject({ offline: true, modelUsed: 'Offline rule engine' });
    expect(done.notice).toMatch(/API key rejected.*not AI/);
  });

  it('keeps only the latest turns and masks every message', async () => {
    const gemini = mockGemini(['ok']);
    const history = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? ('assistant' as const) : ('user' as const), content: `turn ${i} 9876543210` }));
    await handleChatWithAI(history);
    const sent = gemini.calls[0].contents;
    expect(sent).toHaveLength(20);
    expect(JSON.stringify(sent)).not.toContain('9876543210');
  });
});

describe('generateAIExecutiveSummary', () => {
  it.each(['EN', 'HI', 'MR'] as const)('returns a complete offline summary in %s', async (lang) => {
    const summary = await generateAIExecutiveSummary(undefined, lang);
    expect(summary.plainSummaryParagraphs.length).toBeGreaterThan(0);
    expect(summary.piiRedactedCount).toBeGreaterThan(0);
  });
});
