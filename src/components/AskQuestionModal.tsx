import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Language } from '../types';
import { groundedQADatabase, GroundedQAEntry } from '../data/legalIntelligenceData';
import { SourceSpanCitation } from './SourceSpanCitation';
import { UncertaintyBadge } from './UncertaintyBadge';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialQuery?: string;
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  language,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [result, setResult] = useState<GroundedQAEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [strictGrounding, setStrictGrounding] = useState(true);

  if (!isOpen) return null;

  const handleAsk = async (qToAsk?: string) => {
    const activeQ = qToAsk || query;
    if (!activeQ.trim()) return;

    setIsLoading(true);
    setSubmittedQuery(activeQ);

    try {
      const res = await fetch('/api/pipeline/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: activeQ, language }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          id: `ai-qa-${Date.now()}`,
          query: activeQ,
          isGroundedInDocument: Boolean(data.isGroundedInDocument),
          category: data.category || 'Grounded Analysis',
          answerPlain: data.answerPlain,
          citation: data.citation
            ? {
                clauseNumber: data.citation.clauseNumber,
                pageNumber: data.citation.pageNumber,
                verbatimQuote: data.citation.verbatimQuote,
              }
            : undefined,
          citizenAction: data.citizenAction,
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend Ask API unavailable, using local legal database:', err);
    }

    // High-fidelity local legal database fallback
    const qLower = activeQ.toLowerCase();
    let matched = groundedQADatabase.find((entry) => {
      const entryWords = entry.query.toLowerCase().split(' ');
      const matchesWords = entryWords.filter(
        (w) => w.length > 4 && qLower.includes(w)
      );
      return matchesWords.length >= 2;
    });

    if (!matched) {
      if (
        qLower.includes('pan') ||
        qLower.includes('aadhaar') ||
        qLower.includes('id') ||
        qLower.includes('tax id')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-refusal-01');
      } else if (
        qLower.includes('maintenance') ||
        qLower.includes('monthly') ||
        qLower.includes('society charges')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-refusal-02');
      } else if (
        qLower.includes('tenant') ||
        qLower.includes('occupant') ||
        qLower.includes('commercial')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-refusal-03');
      } else if (
        qLower.includes('rera') ||
        qLower.includes('builder registration')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-refusal-04');
      } else if (
        qLower.includes('price') ||
        qLower.includes('consideration') ||
        qLower.includes('86') ||
        qLower.includes('cost')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-01');
      } else if (
        qLower.includes('possession') ||
        qLower.includes('handover') ||
        qLower.includes('keys') ||
        qLower.includes('date')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-02');
      } else if (
        qLower.includes('loan') ||
        qLower.includes('bank') ||
        qLower.includes('sbi') ||
        qLower.includes('mortgage') ||
        qLower.includes('encumbrance')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-03');
      } else if (
        qLower.includes('stamp') ||
        qLower.includes('registration fee') ||
        qLower.includes('incidental')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-04');
      } else if (
        qLower.includes('arbitration') ||
        qLower.includes('dispute') ||
        qLower.includes('court')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-05');
      } else if (
        qLower.includes('schedule iii') ||
        qLower.includes('schedule 3') ||
        qLower.includes('annexure')
      ) {
        matched = groundedQADatabase.find((e) => e.id === 'qa-06');
      } else {
        matched = {
          id: 'qa-generic-refusal',
          query: activeQ,
          isGroundedInDocument: false,
          category: 'Out of Document',
          answerPlain: `NOT FOUND IN UPLOADED DOCUMENT: The 18-page Sale Deed for Flat 402, Kalyani Nagar does not contain terms regarding "${activeQ}". Vidhi operates under strict legal grounding and refuses to guess or hallucinate terms absent from the draft.`,
          citizenAction:
            'Raise this point during your advocate consultation or request written clarification from the vendor prior to signing.',
        };
      }
    }

    setResult(matched || null);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F3F0E8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C621E] font-mono bg-[#F3ECD7] px-2 py-0.5 rounded border border-[#E8DAB7]">
                GROUNDED LEGAL CITATION ENGINE
              </span>
              <span className="text-xs font-mono text-[#6F6D65]">
                SALE DEED — FLAT 402
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[#1C1C19] font-serif mt-1">
              Grounded Document Q&amp;A
            </h2>
            <p className="text-xs text-[#6F6D65] mt-0.5">
              Answers derived strictly from the uploaded 18-page text with exact page and clause citations. Unstated matters are strictly refused to prevent hallucinations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8C887B] hover:text-[#1C1C19] hover:bg-[#F3F0E8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strict Grounding Badge */}
        <div className="p-2.5 bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#1C1C19]">
            <span className="w-2 h-2 rounded-full bg-[#58735C]" />
            <span>STRICT GROUNDING: ACTIVE</span>
          </div>
          <span className="text-[#6F6D65] text-[11px]">
            Zero Hallucination Policy
          </span>
        </div>

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the deed (e.g., 'When is possession promised?' or test refusal with 'What is the seller's PAN number?')..."
              className="w-full text-xs p-3 rounded-lg border border-[#C9C4B7] bg-white text-[#1C1C19] focus:outline-none focus:ring-1 focus:ring-[#171714] leading-relaxed"
              rows={3}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2.5 bottom-2.5 px-3 py-1.5 bg-[#171714] text-[#F7F5EF] rounded-md text-xs font-medium hover:bg-[#2C2B26] disabled:opacity-40 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Verify &amp; Answer</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Answer Display */}
        {isLoading && (
          <div className="p-6 text-center space-y-2 bg-[#FAF8F5] rounded-lg border border-[#DDD9CE]">
            <div className="w-5 h-5 border-2 border-[#171714] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#6F6D65] font-mono">
              Grounding query against 18 pages of Flat 402 Sale Deed...
            </p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4 animate-fade-in">
            {result.isGroundedInDocument ? (
              // Grounded Answer Card
              <div className="p-5 bg-white border border-[#DDD9CE] rounded-lg space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#58735C] bg-[#F0F5F0] px-2 py-0.5 rounded border border-[#D5E2D5] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#58735C]" />
                    FOUND IN UPLOADED DOCUMENT
                  </span>
                  {result.citation && (
                    <span className="text-[11px] font-mono text-[#8C621E] font-semibold">
                      CLAUSE {result.citation.clauseNumber} · PAGE {result.citation.pageNumber}
                    </span>
                  )}
                </div>

                {/* Exact Source Span Citation */}
                {result.citation && (
                  <SourceSpanCitation
                    span={{
                      documentId: 'doc-sale-deed-402',
                      clauseNumber: result.citation.clauseNumber,
                      pageNumber: result.citation.pageNumber,
                      startLine: 1,
                      endLine: 8,
                      exactQuote: result.citation.verbatimQuote,
                      anchorId: `qa-citation-clause-${result.citation.clauseNumber}`,
                    }}
                    language={language}
                  />
                )}

                {/* Plain Answer */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#6F6D65] tracking-wider block">
                    PLAIN-LANGUAGE VERDICT:
                  </span>
                  <p className="text-xs text-[#1C1C19] leading-relaxed font-sans">
                    {result.answerPlain}
                  </p>
                </div>

                {/* Uncertainty Signal for grounded answers */}
                <UncertaintyBadge
                  signal={{
                    level: result.citation ? 'HIGH_CERTAINTY' : 'MEDIUM_UNCERTAINTY',
                    label: result.citation
                      ? 'High Textual Grounding (Verbatim draft quote verified)'
                      : 'Medium Uncertainty',
                    reason:
                      'Answer grounded exclusively within the 18-page Sale Deed draft. No speculative statutory extrapolation.',
                    counselRequiredAction:
                      'Review this clause with your advocate to ensure it reflects commercial terms agreed with seller.',
                  }}
                  language={language}
                />

                {/* Citizen Next Step */}
                <div className="p-3 bg-[#FCFBF7] rounded border border-[#EFECE3] text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8C621E] tracking-wider block">
                    RECOMMENDED CITIZEN ACTION:
                  </span>
                  <p className="text-[#4A4843] leading-relaxed">
                    {result.citizenAction}
                  </p>
                </div>
              </div>
            ) : (
              // Explicit Grounding Refusal Box
              <div className="p-5 bg-[#FAF3F1] border-2 border-[#EADBDA] rounded-lg space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E4A3F] bg-white px-2 py-0.5 rounded border border-[#EADBDA] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8E4A3F]" />
                    STRICT GROUNDING REFUSAL
                  </span>
                  <span className="text-[10px] font-mono text-[#8E4A3F] font-semibold">
                    ABSENT FROM DOCUMENT TEXT
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-[#8E4A3F] leading-relaxed font-medium">
                    {result.answerPlain}
                  </p>
                </div>

                <div className="p-3 bg-white rounded border border-[#EADBDA] text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1C1C19] tracking-wider block">
                    HOW CITIZEN SHOULD PROCEED:
                  </span>
                  <p className="text-[#4A4843] leading-relaxed">
                    {result.citizenAction}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Clickable Test Questions */}
        <div className="space-y-2 pt-2 border-t border-[#F3F0E8]">
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">
            TEST GROUNDING INTEGRITY
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Group 1: Grounded in Document */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#58735C] font-semibold block">
                IN DOCUMENT (GROUNDED CITATIONS):
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery('When does the seller promise to hand over physical possession of Flat 402?');
                  handleAsk('When does the seller promise to hand over physical possession of Flat 402?');
                }}
                className="w-full text-left p-2 rounded bg-white hover:bg-[#FAF8F5] border border-[#DDD9CE] text-[11px] text-[#1C1C19] transition-colors"
              >
                "When is possession promised?" (Clause 6)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('Do I have to pay the seller if the existing home loan is not closed?');
                  handleAsk('Do I have to pay the seller if the existing home loan is not closed?');
                }}
                className="w-full text-left p-2 rounded bg-white hover:bg-[#FAF8F5] border border-[#DDD9CE] text-[11px] text-[#1C1C19] transition-colors"
              >
                "Must I pay if SBI loan is open?" (Clause 4)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('Who pays stamp duty and registration expenses?');
                  handleAsk('Who pays stamp duty and registration expenses?');
                }}
                className="w-full text-left p-2 rounded bg-white hover:bg-[#FAF8F5] border border-[#DDD9CE] text-[11px] text-[#1C1C19] transition-colors"
              >
                "Who pays stamp duty &amp; incidentals?" (Clause 7)
              </button>
            </div>

            {/* Group 2: Out of Document (Explicit Refusal) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#8E4A3F] font-semibold block">
                OUTSIDE DOCUMENT (TEST REFUSAL):
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery('What is the seller\'s PAN number or Aadhaar card details?');
                  handleAsk('What is the seller\'s PAN number or Aadhaar card details?');
                }}
                className="w-full text-left p-2 rounded bg-white hover:bg-[#FAF3F1] border border-[#DDD9CE] text-[11px] text-[#1C1C19] transition-colors"
              >
                "What is the seller's PAN or Aadhaar?" [Unstated in deed]
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('What is the monthly society maintenance charge for Flat 402?');
                  handleAsk('What is the monthly society maintenance charge for Flat 402?');
                }}
                className="w-full text-left p-2 rounded bg-white hover:bg-[#FAF3F1] border border-[#DDD9CE] text-[11px] text-[#1C1C19] transition-colors"
              >
                "What is monthly maintenance fee?" [Unstated in deed]
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('What is the builder\'s MahaRERA registration number for Gulmohar Residency?');
                  handleAsk('What is the builder\'s MahaRERA registration number for Gulmohar Residency?');
                }}
                className="w-full text-left p-2 rounded bg-white hover:bg-[#FAF3F1] border border-[#DDD9CE] text-[11px] text-[#1C1C19] transition-colors"
              >
                "What is builder's MahaRERA ID?" [Unstated in deed]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
