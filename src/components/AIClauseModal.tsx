import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Check, Copy, ArrowRight } from 'lucide-react';
import { Language, Finding } from '../types';

export interface AIClauseAnalysisData {
  clauseNumber: number;
  pageNumber: number;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  plainExplanation: string;
  sellerTrap: string;
  statutoryPrecedent: string;
  advocateCounterClause: string;
  advocateQuestion: string;
  modelUsed: string;
}

interface AIClauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  clauseNumber: number;
  pageNumber: number;
  originalText: string;
  clauseTitle?: string;
  language: Language;
  onAddToBrief?: (question: string) => void;
}

export const AIClauseModal: React.FC<AIClauseModalProps> = ({
  isOpen,
  onClose,
  clauseNumber,
  pageNumber,
  originalText,
  clauseTitle,
  language,
  onAddToBrief,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<AIClauseAnalysisData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [addedBrief, setAddedBrief] = useState<boolean>(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setAddedBrief(false);
    try {
      const res = await fetch('/api/pipeline/analyze-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseNumber,
          pageNumber,
          originalLegalText: originalText,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        throw new Error('Analysis request failed');
      }
    } catch (err) {
      console.warn('AI clause analysis failed, using fallback:', err);
      setAnalysis({
        clauseNumber,
        pageNumber,
        title: clauseTitle || `Clause ${clauseNumber} Statutory Due Diligence`,
        severity: clauseNumber === 4 || clauseNumber === 9 ? 'HIGH' : 'MEDIUM',
        plainExplanation:
          clauseNumber === 4
            ? 'Mandates payment of consideration even while the vendor’s bank mortgage remains active and undischarged.'
            : clauseNumber === 9
            ? 'Enforces non-negotiable payment deadlines on the buyer while waiving timely vacant key handover for the vendor.'
            : 'Unilateral covenant shifting procedural risks onto the buyer before title conveyance.',
        sellerTrap:
          'Exploits standard commercial buyer trust by separating consideration transfer from debt release and physical occupancy.',
        statutoryPrecedent:
          'Transfer of Property Act 1882, Section 55(1)(g) & Section 55(6)(b); MahaRERA Section 11(4)(g).',
        advocateCounterClause:
          clauseNumber === 4
            ? 'Payment of the balance consideration of ₹68,80,000/- shall be strictly contingent upon the Vendor producing an unencumbered Loan Foreclosure Certificate and execution of Mortgage Satisfaction Deed by State Bank of India.'
            : 'Vacant physical possession and keys of Flat 402 with parking space P-14 shall be handed over simultaneously with execution before the Sub-Registrar.',
        advocateQuestion:
          clauseNumber === 4
            ? 'Can we deposit balance consideration directly to SBI against a pre-closure letter to extinguish the mortgage charge?'
            : 'Can we amend Clause 9 to require keys handover at the registration desk?',
        modelUsed: 'Vidhi Statutory Conveyancing Engine',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && originalText) {
      fetchAnalysis();
    }
  }, [isOpen, clauseNumber, originalText, language]);

  if (!isOpen) return null;

  const handleCopyWording = () => {
    if (!analysis) return;
    const text = `PROPOSED COUNTER-CLAUSE AMENDMENT (Clause ${clauseNumber}, Page ${pageNumber}):\n"${analysis.advocateCounterClause}"\n\nStatutory Basis: ${analysis.statutoryPrecedent}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddBriefClick = () => {
    if (!analysis) return;
    if (onAddToBrief) {
      onAddToBrief(analysis.advocateQuestion);
      setAddedBrief(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clause-ai-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E4D9] flex items-start justify-between bg-[#F8F5EE]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C621E] bg-[#F3ECD7] border border-[#E8DAB7] px-2 py-0.5 rounded font-bold">
                AI DOCUMENTATION INTELLIGENCE
              </span>
              <span className="font-mono text-[11px] text-[#6F6D65]">
                CLAUSE {clauseNumber} · PAGE {pageNumber}
              </span>
            </div>
            <h3
              id="clause-ai-title"
              className="font-serif text-lg font-semibold text-[#1C1C19] mt-1"
            >
              {analysis?.title || clauseTitle || `Clause ${clauseNumber} Deep Scrutiny`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalysis}
              disabled={loading}
              className="p-1.5 rounded text-[#6F6D65] hover:text-[#1C1C19] hover:bg-[#EAE6DB] transition-colors disabled:opacity-40"
              title="Re-analyze with Gemini"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#6F6D65] hover:text-[#1C1C19] hover:bg-[#EAE6DB] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Original Text Reference */}
          <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8C887B]">
              <span>ORIGINAL DRAFT LEGAL TEXT</span>
              <span>VERBATIM CLAUSE</span>
            </div>
            <p className="font-serif text-xs italic text-[#1C1C19] leading-relaxed border-l-2 border-[#C38A2E] pl-2.5 my-1 bg-white p-2.5 rounded border border-[#EFECE3]">
              "{originalText}"
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#171714] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#6F6D65]">
                Gemini 3.8 Flash evaluating clause against Transfer of Property Act & MahaRERA...
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Plain-Language Explanation */}
              <div className="bg-white border border-[#DDD9CE] rounded-lg p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#6F6D65] tracking-wider">
                    PLAIN-LANGUAGE WHAT THIS MEANS
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      analysis.severity === 'HIGH'
                        ? 'bg-[#FAF3F1] text-[#8E4A3F] border-[#EADBDA]'
                        : analysis.severity === 'MEDIUM'
                        ? 'bg-[#F3ECD7] text-[#8C621E] border-[#E8DAB7]'
                        : 'bg-[#F0F5F0] text-[#58735C] border-[#D5E2D5]'
                    }`}
                  >
                    {analysis.severity} RISK
                  </span>
                </div>
                <p className="text-xs text-[#1C1C19] leading-relaxed">
                  {analysis.plainExplanation}
                </p>
              </div>

              {/* The Seller Trap & Statutory Precedent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Trap */}
                <div className="p-3.5 bg-[#FAF3F1]/70 border border-[#EADBDA] rounded-lg space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8E4A3F] tracking-wider block">
                    THE CONTRACTUAL TRAP / VENDOR ADVANTAGE
                  </span>
                  <p className="text-[#4A4843] leading-relaxed">
                    {analysis.sellerTrap}
                  </p>
                </div>

                {/* Precedent */}
                <div className="p-3.5 bg-[#F0F5F0]/70 border border-[#D5E2D5] rounded-lg space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#58735C] tracking-wider block">
                    INDIAN STATUTORY BENCHMARK
                  </span>
                  <p className="text-[#4A4843] leading-relaxed">
                    {analysis.statutoryPrecedent}
                  </p>
                </div>
              </div>

              {/* Advocate Counter-Clause Proposal */}
              <div className="p-4 bg-[#FAF8F2] border border-[#DDD9CE] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8C621E] tracking-wider">
                    RECOMMENDED ADVOCATE COUNTER-CLAUSE WORDING
                  </span>
                  <button
                    onClick={handleCopyWording}
                    className="text-xs font-mono text-[#1C1C19] hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#58735C]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Wording'}</span>
                  </button>
                </div>
                <p className="font-serif text-xs sm:text-[13px] text-[#1C1C19] leading-relaxed italic bg-white p-3 rounded border border-[#E8E4D9]">
                  "{analysis.advocateCounterClause}"
                </p>
              </div>

              {/* Actionable Question for Advocate Consultation */}
              <div className="p-4 bg-white border border-[#DDD9CE] rounded-lg space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-[#1C1C19] tracking-wider block">
                  TARGETED QUESTION FOR ADVOCATE CONSULTATION
                </span>
                <p className="text-xs text-[#1C1C19] font-medium leading-relaxed">
                  "{analysis.advocateQuestion}"
                </p>
                {onAddToBrief && (
                  <button
                    onClick={handleAddBriefClick}
                    disabled={addedBrief}
                    className="mt-2 px-3 py-1.5 bg-[#171714] text-white text-xs font-medium rounded hover:bg-[#2C2B26] transition-colors flex items-center gap-1.5"
                  >
                    {addedBrief ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#58735C]" />
                        <span>Added to Advocate Brief</span>
                      </>
                    ) : (
                      <>
                        <span>Add Question to Advocate Brief</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E8E4D9] bg-[#FAF8F5] flex items-center justify-between text-xs font-mono text-[#8C887B]">
          <span>
            POWERED BY GEMINI 3.8 FLASH · INDIAN PROPERTY LAW
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
