/**
 * Grounded document Q&A.
 *
 *   1. context   – short context: document summary + only the clauses most relevant to the question
 *   2. answering – Gemini answers strictly from that context and quotes the clauses it used
 *   3. verifying – (a) every quote must exist verbatim in the document text
 *                  (b) a second Gemini call checks the question is about this document and the
 *                      answer is supported by the context
 *   4. done      – the answer is released only if every check passes; otherwise it is rejected
 */

import {
  DEFAULT_MODEL,
  LITE_MODEL,
  OutputLanguage,
  ReadingLevel,
  describeGeminiError,
  generateContentWithRetry,
  hasGeminiKey,
  languageInstruction,
  parseModelJson,
  readingLevelInstruction,
} from './aiShared.js';
import { maskPII } from './pii.js';
import { UNTRUSTED_CONTENT_RULES, sanitizeUntrustedText, wrapUntrusted } from './security.js';

export interface GroundingClause {
  clauseNumber: number;
  pageNumber: number;
  title?: string;
  text: string;
}

export interface GroundingDocument {
  title?: string;
  summary?: string;
  clauses: GroundingClause[];
}

export type QAStage = 'context' | 'answering' | 'verifying' | 'done';

export interface GroundedQAResult {
  status: 'approved' | 'rejected';
  answer?: string;
  citations: Array<{ clauseNumber: number; pageNumber: number; quote: string }>;
  citizenAction?: string;
  rejection?: {
    kind: 'no_document' | 'not_in_document' | 'unrelated' | 'unsupported' | 'unavailable';
    reason: string;
  };
  checks: {
    questionRelated: boolean | null;
    answerSupported: boolean | null;
    citationsVerified: number;
    citationsRejected: number;
  };
  contextClauses: number[];
  modelUsed: string;
}

type Emit = (event: { type: 'stage'; stage: QAStage; message: string }) => void;

const MAX_CLAUSES = 250;
const MAX_CLAUSE_CHARS = 2500;
const CONTEXT_BUDGET_CHARS = 6000;
const MAX_CONTEXT_CLAUSES = 8;

const STOPWORDS = new Set(
  'the and for are was were with that this from what when where which who whom whose why how does did have has had will shall would should can could may might must not any all about into over under their there they them then than your you our his her its also been being such only other more most some what is are be of in on at to by an or as if it do so no'.split(
    ' '
  )
);

/* ---------------- helpers ---------------- */

const normalizeForMatch = (s: string) =>
  s
    .toLowerCase()
    .replace(/[“”"'‘’`]/g, '')
    .replace(/[^\p{L}\p{N}₹%]+/gu, ' ')
    .trim();

function tokenize(s: string): string[] {
  return normalizeForMatch(s)
    .split(' ')
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function cleanDocument(doc: GroundingDocument): { title: string; summary: string; clauses: GroundingClause[] } {
  const clean = (t: string) => sanitizeUntrustedText(maskPII(t).maskedText).text;
  return {
    title: clean(String(doc.title || 'Uploaded document')).slice(0, 200),
    summary: clean(String(doc.summary || '')).slice(0, 1500),
    clauses: (Array.isArray(doc.clauses) ? doc.clauses : [])
      .filter((c) => c && typeof c.text === 'string' && c.text.trim())
      .slice(0, MAX_CLAUSES)
      .map((c) => ({
        clauseNumber: Number(c.clauseNumber) || 0,
        pageNumber: Number(c.pageNumber) || 1,
        title: c.title ? clean(String(c.title)).slice(0, 120) : undefined,
        text: clean(c.text).slice(0, MAX_CLAUSE_CHARS),
      })),
  };
}

/** Picks the clauses most relevant to the question (keyword overlap weighted by rarity). */
function selectContext(question: string, clauses: GroundingClause[]): GroundingClause[] {
  const qTerms = Array.from(new Set(tokenize(question)));
  const mentioned = new Set(
    Array.from(question.matchAll(/(?:clause|section|article|धारा|कलम)\s*(\d{1,3})/gi)).map((m) => Number(m[1]))
  );

  const docTokens = clauses.map((c) => tokenize(`${c.title || ''} ${c.text}`));
  const df = new Map<string, number>();
  for (const tokens of docTokens) for (const t of new Set(tokens)) df.set(t, (df.get(t) || 0) + 1);

  const scored = clauses.map((clause, i) => {
    const counts = new Map<string, number>();
    for (const t of docTokens[i]) counts.set(t, (counts.get(t) || 0) + 1);
    let score = mentioned.has(clause.clauseNumber) ? 100 : 0;
    for (const term of qTerms) {
      // prefix match lets "possess" match "possession", "pay" match "payment"
      let tf = counts.get(term) || 0;
      if (!tf) for (const [tok, n] of counts) if (tok.startsWith(term) || term.startsWith(tok)) tf += n;
      if (tf) score += (1 + Math.log(tf)) * Math.log(1 + clauses.length / (df.get(term) || 1));
    }
    return { clause, score, i };
  });

  const ranked = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  // No keyword overlap (e.g. question in Hindi, document in English): fall back to document order.
  const pool = ranked.length ? ranked : scored;

  const picked: typeof scored = [];
  let used = 0;
  for (const s of pool) {
    if (picked.length >= MAX_CONTEXT_CLAUSES) break;
    if (used + s.clause.text.length > CONTEXT_BUDGET_CHARS && picked.length > 0) continue;
    picked.push(s);
    used += s.clause.text.length;
  }
  return picked.sort((a, b) => a.i - b.i).map((s) => s.clause);
}

function formatContext(title: string, summary: string, clauses: GroundingClause[]): string {
  const lines = [`Document: ${title}`];
  if (summary) lines.push(`Summary: ${summary}`);
  for (const c of clauses) {
    lines.push(`[Clause ${c.clauseNumber || '—'}, page ${c.pageNumber}]${c.title ? ` ${c.title}` : ''}\n${c.text}`);
  }
  return lines.join('\n\n');
}

async function callJson(system: string, user: string, temperature: number): Promise<{ data: any; model: string }> {
  let lastErr: unknown;
  for (const model of [DEFAULT_MODEL, LITE_MODEL]) {
    try {
      const response = await generateContentWithRetry({
        model,
        contents: [{ role: 'user', parts: [{ text: user }] }],
        config: { systemInstruction: system, responseMimeType: 'application/json', temperature },
      });
      const data = parseModelJson(response.text);
      if (data) return { data, model };
    } catch (err) {
      lastErr = err;
      console.warn(`Grounded QA call (${model}) failed:`, (err as any)?.message || err);
    }
  }
  throw lastErr || new Error('Empty model response');
}

/* ---------------- pipeline ---------------- */

export async function answerGroundedQuestion(
  rawQuestion: string,
  document: GroundingDocument | undefined,
  language: OutputLanguage,
  readingLevel: ReadingLevel,
  emit: Emit
): Promise<GroundedQAResult> {
  const base = {
    citations: [],
    checks: { questionRelated: null, answerSupported: null, citationsVerified: 0, citationsRejected: 0 },
    contextClauses: [],
    modelUsed: '',
  } satisfies Partial<GroundedQAResult>;

  // ---- 1. context
  emit({ type: 'stage', stage: 'context', message: 'Finding the relevant parts of your document…' });
  const question = maskPII(rawQuestion.slice(0, 1000)).maskedText;
  const doc = document ? cleanDocument(document) : null;

  if (!doc || doc.clauses.length === 0) {
    return {
      ...base,
      status: 'rejected',
      rejection: { kind: 'no_document', reason: 'Upload or open a document first — grounded answers can only come from a document.' },
    };
  }
  if (!hasGeminiKey()) {
    return {
      ...base,
      status: 'rejected',
      rejection: { kind: 'unavailable', reason: 'Grounded Q&A needs Gemini, which is not configured on the server.' },
    };
  }

  const contextClauses = selectContext(question, doc.clauses);
  const context = formatContext(doc.title, doc.summary, contextClauses);
  const contextNumbers = contextClauses.map((c) => c.clauseNumber);
  const wrappedContext = wrapUntrusted('DOCUMENT_CONTEXT', context).wrapped;

  // ---- 2. answer
  emit({ type: 'stage', stage: 'answering', message: 'Drafting an answer from those clauses…' });
  let answerData: any;
  let modelUsed = '';
  try {
    const { data, model } = await callJson(
      `You answer a citizen's question about their legal document using ONLY the document context provided.
${readingLevelInstruction(readingLevel)}
${languageInstruction(language)} (applies to "answer" and "citizenAction"; quotes stay exactly as written in the document)

Rules:
- Use only facts stated in the context. No outside knowledge, no assumptions, no general legal advice.
- If the context does not contain the answer, set "inDocument" to false and leave "answer" empty.
- Every quote must be copied exactly, character for character, from the context (max 250 characters each).
- Never reveal personal identifiers; [REDACTED_...] tokens must stay redacted. Questions asking for them are not answerable.
${UNTRUSTED_CONTENT_RULES}

Return ONLY JSON:
{ "inDocument": true, "answer": "...", "citations": [{ "clauseNumber": 3, "quote": "exact text" }], "citizenAction": "one practical next step" }`,
      `Document context:\n${wrappedContext}\n\nQuestion:\n${question}`,
      0.1
    );
    answerData = data;
    modelUsed = model;
  } catch (err) {
    return {
      ...base,
      contextClauses: contextNumbers,
      status: 'rejected',
      rejection: { kind: 'unavailable', reason: `Gemini could not be reached (${describeGeminiError(err)}).` },
    };
  }

  const answer = typeof answerData?.answer === 'string' ? answerData.answer.trim() : '';
  if (!answerData?.inDocument || !answer) {
    return {
      ...base,
      contextClauses: contextNumbers,
      modelUsed,
      status: 'rejected',
      rejection: {
        kind: 'not_in_document',
        reason: 'Your document does not contain information that answers this question, so no answer is shown.',
      },
    };
  }

  // ---- 3a. verify quotes against the actual document text
  emit({ type: 'stage', stage: 'verifying', message: 'Checking the answer against your document…' });
  const citations: GroundedQAResult['citations'] = [];
  let citationsRejected = 0;
  for (const c of Array.isArray(answerData.citations) ? answerData.citations.slice(0, 5) : []) {
    const quote = typeof c?.quote === 'string' ? c.quote.trim() : '';
    const q = normalizeForMatch(quote);
    if (q.length < 8) {
      citationsRejected++;
      continue;
    }
    const preferred = doc.clauses.find((cl) => cl.clauseNumber === Number(c.clauseNumber) && normalizeForMatch(cl.text).includes(q));
    const match = preferred || doc.clauses.find((cl) => normalizeForMatch(cl.text).includes(q));
    if (match) citations.push({ clauseNumber: match.clauseNumber, pageNumber: match.pageNumber, quote });
    else citationsRejected++;
  }

  // ---- 3b. independent check: related to the document? supported by the context?
  let questionRelated: boolean | null = null;
  let answerSupported: boolean | null = null;
  let judgeReason = '';
  try {
    const { data } = await callJson(
      `You are a strict verifier for a legal-document Q&A system. You did not write the answer.
Decide two things using ONLY the document context:
1. "questionRelated": is the question about this document's contents (its parties, property, payments, terms, clauses)? General knowledge, unrelated topics, or requests for personal identifiers are NOT related.
2. "answerSupported": is every factual statement in the answer directly supported by the context? Any claim not stated in the context makes this false.
Write "reason" as one short sentence. ${languageInstruction(language)}
${UNTRUSTED_CONTENT_RULES}
Return ONLY JSON: { "questionRelated": true, "answerSupported": true, "reason": "..." }`,
      `Document context:\n${wrappedContext}\n\nQuestion:\n${question}\n\nProposed answer:\n${answer}`,
      0
    );
    questionRelated = data?.questionRelated === true;
    answerSupported = data?.answerSupported === true;
    judgeReason = typeof data?.reason === 'string' ? data.reason.trim() : '';
  } catch (err) {
    return {
      ...base,
      contextClauses: contextNumbers,
      modelUsed,
      checks: { questionRelated: null, answerSupported: null, citationsVerified: citations.length, citationsRejected },
      status: 'rejected',
      rejection: { kind: 'unavailable', reason: `The answer could not be verified (${describeGeminiError(err)}), so it is not shown.` },
    };
  }

  emit({ type: 'stage', stage: 'done', message: 'Checks complete' });
  const checks = { questionRelated, answerSupported, citationsVerified: citations.length, citationsRejected };

  if (!questionRelated) {
    return {
      ...base,
      contextClauses: contextNumbers,
      modelUsed,
      checks,
      status: 'rejected',
      rejection: { kind: 'unrelated', reason: judgeReason || 'This question is not about the contents of your document.' },
    };
  }
  if (citations.length === 0) {
    return {
      ...base,
      contextClauses: contextNumbers,
      modelUsed,
      checks,
      status: 'rejected',
      rejection: { kind: 'unsupported', reason: 'The answer could not be matched to exact wording in your document, so it is not shown.' },
    };
  }
  if (!answerSupported) {
    return {
      ...base,
      contextClauses: contextNumbers,
      modelUsed,
      checks,
      status: 'rejected',
      rejection: { kind: 'unsupported', reason: judgeReason || 'Parts of the answer go beyond what your document says.' },
    };
  }

  return {
    status: 'approved',
    answer,
    citations,
    citizenAction: typeof answerData.citizenAction === 'string' ? answerData.citizenAction.trim() : undefined,
    checks,
    contextClauses: contextNumbers,
    modelUsed,
  };
}
