import React, { useRef, useState } from 'react';
import { X, Send, Check, Loader2, ShieldCheck, ShieldX, Quote } from 'lucide-react';
import { Language } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { readNdjson } from '../utils/analyzeDocument';

export interface GroundingDocument {
  title: string;
  summary: string;
  clauses: Array<{ clauseNumber: number; pageNumber: number; title?: string; text: string }>;
}

interface GroundedResult {
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

type Stage = 'context' | 'answering' | 'verifying' | 'done';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialQuery?: string;
  groundingDocument?: GroundingDocument;
}

const STEPS: Array<{ id: Stage; label: string }> = [
  { id: 'context', label: 'Find relevant clauses' },
  { id: 'answering', label: 'Draft answer' },
  { id: 'verifying', label: 'Check against document' },
  { id: 'done', label: 'Approve or reject' },
];

const REJECTION_TITLES: Record<NonNullable<GroundedResult['rejection']>['kind'], string> = {
  no_document: 'No document open',
  not_in_document: 'Not answered by your document',
  unrelated: 'Question not about this document',
  unsupported: 'Answer failed verification',
  unavailable: 'AI unavailable',
};

const EXAMPLE_QUESTIONS = [
  'What is the total price and when is the balance due?',
  'When will I get possession of the property?',
  'Who pays stamp duty and registration charges?',
  'How are disputes resolved under this agreement?',
];
const OFF_TOPIC_EXAMPLES = ['What is the capital of France?', "What is the seller's PAN number?"];

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  language,
  initialQuery = '',
  groundingDocument,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [stage, setStage] = useState<Stage | null>(null);
  const [result, setResult] = useState<GroundedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { readingLevel } = usePreferences();
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose);
  const resultRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleAsk = async (qToAsk?: string) => {
    const activeQ = (qToAsk || query).trim();
    if (!activeQ || isLoading) return;

    setIsLoading(true);
    setSubmittedQuery(activeQ);
    setResult(null);
    setError(null);
    setStage('context');

    try {
      const res = await fetch('/api/qa/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: activeQ, document: groundingDocument, language, readingLevel }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || `Server returned ${res.status}`);
      }
      let final: GroundedResult | null = null;
      await readNdjson(res, (event) => {
        if (event.type === 'stage') setStage(event.stage);
        else if (event.type === 'result') final = event.result;
        else if (event.type === 'error') throw new Error(event.message);
      });
      if (!final) throw new Error('No answer was returned. Please try again.');
      setResult(final);
      setTimeout(() => resultRef.current?.focus(), 50);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setStage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const ask = (q: string) => {
    setQuery(q);
    handleAsk(q);
  };

  const stageIndex = stage ? STEPS.findIndex((s) => s.id === stage) : -1;
  const finished = Boolean(result);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-dialog-title"
        tabIndex={-1}
        className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-t-xl sm:rounded-xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F3F0E8]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C621E] font-mono bg-[#F3ECD7] px-2 py-0.5 rounded border border-[#E8DAB7]">
                GROUNDED Q&amp;A
              </span>
              <span className="text-xs font-mono text-[#6F6D65] truncate">
                {groundingDocument ? groundingDocument.title : 'No document open'}
              </span>
            </div>
            <h2 id="ask-dialog-title" className="text-xl font-semibold text-[#1C1C19] font-serif mt-1">
              Ask your document
            </h2>
            <p className="text-xs text-[#6F6D65] mt-0.5">
              Answers come only from your document. Each answer is checked against the document text before it is shown; anything the document doesn't support is rejected.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close question dialog"
            className="p-2 rounded-md text-[#8C887B] hover:text-[#1C1C19] hover:bg-[#F3F0E8]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {!groundingDocument && (
          <p role="status" className="text-xs p-3 rounded-lg bg-[#F3ECD7] border border-[#E6D8B0] text-[#6B5217]">
            Open or upload a document first. Grounded answers can only come from a document.
          </p>
        )}

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="space-y-2"
        >
          <div className="relative">
            <textarea
              aria-label="Your question about the document"
              data-autofocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Ask about your document, e.g. 'When will I get possession?'"
              className="w-full text-sm p-3 pr-32 rounded-lg border border-[#C9C4B7] bg-white text-[#1C1C19] focus:outline-none focus:ring-1 focus:ring-[#171714] leading-relaxed"
              rows={3}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2.5 bottom-2.5 px-3 py-1.5 bg-[#171714] text-[#F7F5EF] rounded-md text-xs font-medium hover:bg-[#2C2B26] disabled:opacity-40 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Ask &amp; verify</span>
              <Send className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Pipeline progress */}
        {stage && (
          <ol className="grid grid-cols-4 gap-1.5" aria-label="Answer steps">
            {STEPS.map((step, idx) => {
              // When finished: steps reached (and the final decision) are done; steps never reached were skipped.
              const state = finished
                ? idx <= stageIndex || idx === STEPS.length - 1
                  ? 'done'
                  : 'skipped'
                : idx < stageIndex
                ? 'done'
                : idx === stageIndex
                ? 'active'
                : 'todo';
              return (
                <li key={step.id} className="flex flex-col items-center text-center gap-1" aria-current={state === 'active' ? 'step' : undefined}>
                  <span
                    aria-hidden="true"
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold border ${
                      state === 'done'
                        ? 'bg-[#58735C] border-[#58735C] text-white'
                        : state === 'active'
                        ? 'bg-white border-[#C38A2E] text-[#8C621C]'
                        : 'bg-[#F3F0E8] border-[#DDD9CE] text-[#8C887B]'
                    }`}
                  >
                    {state === 'done' ? <Check className="w-3 h-3" /> : state === 'active' ? <Loader2 className="w-3 h-3 motion-safe:animate-spin" /> : state === 'skipped' ? '–' : idx + 1}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] leading-tight ${state === 'todo' || state === 'skipped' ? 'text-[#8C887B]' : 'text-[#1C1C19]'}`}>
                    {step.label}
                    <span className="sr-only">{state === 'done' ? ' (done)' : state === 'active' ? ' (in progress)' : state === 'skipped' ? ' (skipped)' : ''}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {error && (
          <p role="alert" className="text-xs p-3 rounded-lg bg-[#FAF3F1] border border-[#EADBDA] text-[#8E4A3F]">
            {error}
          </p>
        )}

        {/* Result */}
        {result && !isLoading && (
          <div ref={resultRef} tabIndex={-1} className="space-y-3 focus:outline-none" aria-live="polite">
            <p className="text-[11px] font-mono text-[#8C887B]">Q: {submittedQuery}</p>

            {result.status === 'approved' ? (
              <section aria-label="Approved answer" className="p-4 sm:p-5 bg-white border border-[#CADBCB] rounded-lg space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2 text-[#34503A]">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xs font-semibold">Answer verified against your document</span>
                </div>

                <p className="text-sm text-[#1C1C19] leading-relaxed" lang={language === 'HI' ? 'hi' : language === 'MR' ? 'mr' : 'en'}>
                  {result.answer}
                </p>

                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#6F6D65] font-semibold">From your document</p>
                  {result.citations.map((c, i) => (
                    <blockquote key={i} className="border-l-4 border-[#C38A2E] bg-[#FAF8F5] p-2.5 rounded-r text-xs">
                      <p className="font-serif italic text-[#1C1C19] flex gap-1.5">
                        <Quote className="w-3 h-3 shrink-0 mt-0.5 text-[#A87B24]" aria-hidden="true" />
                        <span>{c.quote}</span>
                      </p>
                      <footer className="mt-1 text-[10px] font-mono text-[#8C621E]">
                        {c.clauseNumber > 0 ? `Clause ${c.clauseNumber} · ` : ''}Page {c.pageNumber}
                      </footer>
                    </blockquote>
                  ))}
                </div>

                {result.citizenAction && (
                  <div className="p-3 bg-[#FCFBF7] rounded border border-[#EFECE3] text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#8C621E] tracking-wider block">Suggested next step</span>
                    <p className="text-[#4A4843] leading-relaxed">{result.citizenAction}</p>
                  </div>
                )}

                <ChecksList result={result} />
              </section>
            ) : (
              <section aria-label="Rejected answer" className="p-4 sm:p-5 bg-[#FAF3F1] border-2 border-[#EADBDA] rounded-lg space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-[#8E4A3F]">
                  <ShieldX className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xs font-semibold">
                    Rejected: {result.rejection ? REJECTION_TITLES[result.rejection.kind] : 'Not verified'}
                  </span>
                </div>
                <p className="text-sm text-[#6E3A31] leading-relaxed">{result.rejection?.reason}</p>
                <p className="text-xs text-[#4A4843]">
                  {result.rejection?.kind === 'unavailable'
                    ? 'No answer is shown because it could not be generated and verified. Please try again shortly.'
                    : result.rejection?.kind === 'no_document'
                    ? 'Upload a document from the Home screen, then ask again.'
                    : 'Try rephrasing the question around something your document covers, or raise this point with your advocate.'}
                </p>
                {result.rejection?.kind !== 'no_document' && result.rejection?.kind !== 'unavailable' && <ChecksList result={result} />}
              </section>
            )}
          </div>
        )}

        {/* Example questions */}
        <div className="space-y-2 pt-2 border-t border-[#F3F0E8]">
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">Try asking</span>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isLoading}
                onClick={() => ask(q)}
                className="text-left px-2.5 py-1.5 rounded bg-white hover:bg-[#FAF8F5] border border-[#DDD9CE] text-[11px] text-[#1C1C19] disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8E4A3F] font-semibold block pt-1">
            Test a rejection
          </span>
          <div className="flex flex-wrap gap-1.5">
            {OFF_TOPIC_EXAMPLES.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isLoading}
                onClick={() => ask(q)}
                className="text-left px-2.5 py-1.5 rounded bg-white hover:bg-[#FAF3F1] border border-[#DDD9CE] text-[11px] text-[#1C1C19] disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Shows which verification checks passed. */
const ChecksList: React.FC<{ result: GroundedResult }> = ({ result }) => {
  const { checks } = result;
  const item = (ok: boolean | null, label: string) => (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className={ok ? 'text-[#58735C]' : ok === false ? 'text-[#8E4A3F]' : 'text-[#8C887B]'}>
        {ok ? '✓' : ok === false ? '✗' : '–'}
      </span>
      <span>
        {label}
        <span className="sr-only">{ok ? ': passed' : ok === false ? ': failed' : ': not checked'}</span>
      </span>
    </li>
  );
  const hasCheck = checks.questionRelated !== null || checks.citationsVerified + checks.citationsRejected > 0;
  if (!hasCheck) return null;
  return (
    <ul className="text-[11px] text-[#4A4843] space-y-0.5 pt-2 border-t border-black/5" aria-label="Verification checks">
      {item(checks.questionRelated, 'Question is about this document')}
      {item(checks.answerSupported, 'Answer is supported by the document text')}
      {item(
        checks.citationsVerified > 0,
        `${checks.citationsVerified} quote${checks.citationsVerified === 1 ? '' : 's'} found word-for-word in the document${
          checks.citationsRejected ? ` (${checks.citationsRejected} unmatched quote${checks.citationsRejected === 1 ? '' : 's'} removed)` : ''
        }`
      )}
    </ul>
  );
};
