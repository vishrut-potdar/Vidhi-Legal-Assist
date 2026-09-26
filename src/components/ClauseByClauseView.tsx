import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Filter,
} from 'lucide-react';
import { fullDocumentClauses } from '../data/legalIntelligenceData';
import { FullClauseExplanation, Finding, Severity, Language } from '../types';
import { SourceSpanCitation } from './SourceSpanCitation';
import { UncertaintyBadge } from './UncertaintyBadge';
import { AIClauseModal } from './AIClauseModal';
import { BilingualText } from './BilingualText';
import { activateOnKey } from '../utils/a11y';

interface ClauseByClauseViewProps {
  findings: Finding[];
  clauses?: FullClauseExplanation[];
  language?: Language;
  onSelectFinding?: (finding: Finding) => void;
  onToggleBrief: (findingId: string) => void;
  onOpenAdvocateBrief: () => void;
}

export const ClauseByClauseView: React.FC<ClauseByClauseViewProps> = ({
  findings,
  clauses,
  language = 'EN',
  onSelectFinding,
  onToggleBrief,
  onOpenAdvocateBrief,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedAIClause, setSelectedAIClause] = useState<{
    clauseNumber: number;
    pageNumber: number;
    originalText: string;
    clauseTitle: string;
  } | null>(null);
  const [expandedClauses, setExpandedClauses] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const activeClauses = clauses && clauses.length > 0 ? clauses : fullDocumentClauses;

  const categories = [
    'ALL',
    'Parties & Title',
    'Financial & Consideration',
    'Possession & Handover',
    'Taxes & Outgoings',
    'Warranties & Indemnity',
    'Dispute Resolution & General',
  ];

  const toggleExpand = (clauseNumber: number) => {
    setExpandedClauses((prev) => ({
      ...prev,
      [clauseNumber]: !prev[clauseNumber],
    }));
  };

  const filteredClauses = activeClauses.filter((clause) => {
    const matchesSearch =
      clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.plainExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.originalLegalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.clauseNumber.toString().includes(searchQuery);

    const matchesCategory =
      selectedCategory === 'ALL' || clause.category === selectedCategory;

    const matchesRisk =
      selectedRiskFilter === 'ALL' ||
      (selectedRiskFilter === 'FLAGGED' && clause.isFlagged) ||
      clause.riskLevel === selectedRiskFilter;

    return matchesSearch && matchesCategory && matchesRisk;
  });

  const flaggedCount = activeClauses.filter((c) => c.isFlagged).length;
  const highRiskCount = activeClauses.filter((c) => c.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Intro Header & Concept Card */}
      <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] font-semibold text-[#8C621E] bg-[#F3ECD7] px-2 py-0.5 rounded">
              CLAUSE-BY-CLAUSE ENGINE
            </span>
            <span className="text-xs font-mono text-[#6F6D65]">
              {activeClauses.length} CLAUSES ANALYZED · {flaggedCount} FLAGGED RISKS
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1C19]">
            Plain-Language Translation &amp; Obligation Mapping
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6D65] max-w-3xl leading-relaxed">
            Every legal clause from the reviewed document mapped side-by-side with its exact original text, practical citizen explanation, and party obligation duties.
          </p>
        </div>

        <button
          onClick={onOpenAdvocateBrief}
          className="shrink-0 px-4 py-2 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26] transition-colors shadow-xs flex items-center gap-1.5"
        >
          <span>Open Advocate Brief →</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C887B] absolute left-3 top-2.5" />
            <input aria-label="Search clauses"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clause by number, title, or legal term (e.g., 'possession', 'loan', 'tax')..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded border border-[#C9C4B7] bg-white text-[#1C1C19] focus:outline-none focus:ring-1 focus:ring-[#171714]"
            />
          </div>

          {/* Quick Risk Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button aria-pressed={selectedRiskFilter === 'ALL'}
              onClick={() => setSelectedRiskFilter('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors shrink-0 ${
                selectedRiskFilter === 'ALL'
                  ? 'bg-[#171714] text-white'
                  : 'bg-white border border-[#DDD9CE] text-[#6F6D65] hover:text-[#1C1C19]'
              }`}
            >
              All Clauses ({activeClauses.length})
            </button>
            <button aria-pressed={selectedRiskFilter === 'FLAGGED'}
              onClick={() => setSelectedRiskFilter('FLAGGED')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                selectedRiskFilter === 'FLAGGED'
                  ? 'bg-[#8E4A3F] text-white'
                  : 'bg-[#FAF3F1] border border-[#EADBDA] text-[#8E4A3F] hover:bg-[#F5ECE8]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>Flagged Risks ({flaggedCount})</span>
            </button>
            <button aria-pressed={selectedRiskFilter === 'HIGH'}
              onClick={() => setSelectedRiskFilter('HIGH')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors shrink-0 ${
                selectedRiskFilter === 'HIGH'
                  ? 'bg-[#8E4A3F] text-white'
                  : 'bg-white border border-[#DDD9CE] text-[#8E4A3F]'
              }`}
            >
              High Only (2)
            </button>
            <button aria-pressed={selectedRiskFilter === 'STANDARD'}
              onClick={() => setSelectedRiskFilter('STANDARD')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors shrink-0 ${
                selectedRiskFilter === 'STANDARD'
                  ? 'bg-[#58735C] text-white'
                  : 'bg-white border border-[#DDD9CE] text-[#58735C]'
              }`}
            >
              Standard Safe
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] font-mono">
          <span className="text-[#8C887B] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Topic:
          </span>
          {categories.map((cat) => (
            <button aria-pressed={selectedCategory === cat}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#EAE6DB] text-[#1C1C19] font-semibold border border-[#C9C4B7]'
                  : 'bg-white text-[#6F6D65] hover:text-[#1C1C19] border border-[#DDD9CE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clauses Accordion List */}
      <div className="space-y-4">
        {filteredClauses.map((clause) => {
          const isExpanded = !!expandedClauses[clause.clauseNumber];
          const isHigh = clause.riskLevel === 'HIGH';
          const isMedium = clause.riskLevel === 'MEDIUM';
          const isStandard = clause.riskLevel === 'STANDARD';

          const matchingFinding = clause.findingId
            ? findings.find((f) => f.id === clause.findingId)
            : null;

          return (
            <div
              key={clause.clauseNumber}
              className={`bg-[#FCFBF7] border rounded-lg overflow-hidden transition-all shadow-xs ${
                isHigh
                  ? 'border-[#E5C4BE] ring-1 ring-[#8E4A3F]/20'
                  : isMedium
                  ? 'border-[#EADBB7]'
                  : 'border-[#DDD9CE]'
              }`}
            >
              {/* Header Row */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey} aria-expanded={isExpanded}
                onClick={() => toggleExpand(clause.clauseNumber)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer bg-gradient-to-r from-[#FAF8F5] to-[#FCFBF7] hover:bg-[#F5F2EA] transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-sm ${
                      isHigh
                        ? 'bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA]'
                        : isMedium
                        ? 'bg-[#F3ECD7] text-[#8C621E] border border-[#E8DAB7]'
                        : 'bg-[#F0F5F0] text-[#58735C] border border-[#D5E2D5]'
                    }`}
                  >
                    {clause.clauseNumber.toString().padStart(2, '0')}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-sm sm:text-base text-[#1C1C19]">
                        Clause {clause.clauseNumber}: {clause.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isHigh
                            ? 'bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA]'
                            : isMedium
                            ? 'bg-[#F3ECD7] text-[#8C621E] border border-[#E8DAB7]'
                            : 'bg-[#F0F5F0] text-[#58735C] border border-[#D5E2D5]'
                        }`}
                      >
                        {clause.riskLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#6F6D65] mt-1 font-mono">
                      <span>PAGE {clause.pageNumber}</span>
                      <span>·</span>
                      <span>{clause.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAIClause({
                        clauseNumber: clause.clauseNumber,
                        pageNumber: clause.pageNumber,
                        originalText: clause.originalLegalText,
                        clauseTitle: clause.title,
                      });
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-[#C38A2E]/50 bg-[#F3ECD7]/60 text-[#8C621E] hover:bg-[#F3ECD7] transition-colors"
                  >
                    AI Clause Analysis
                  </button>

                  {matchingFinding && (
                    <button aria-pressed={matchingFinding.inAdvocateBrief}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBrief(matchingFinding.id);
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 ${
                        matchingFinding.inAdvocateBrief
                          ? 'bg-[#FAF8F2] text-[#1C1C19] border-[#DDD9CE]'
                          : 'bg-white text-[#6F6D65] border-[#DDD9CE] hover:text-[#1C1C19]'
                      }`}
                    >
                      {matchingFinding.inAdvocateBrief ? (
                        <>
                          <Check className="w-3 h-3 text-[#58735C]" />
                          <span>In Brief</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add to Brief</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="p-1 rounded text-[#8C887B] hover:text-[#1C1C19]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content: Side-by-Side Original vs Plain Language */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-[#DDD9CE] space-y-5 bg-[#FCFBF7]">
                  {/* Two-Column Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Original Legal Draft Text */}
                    <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#6F6D65] uppercase font-semibold">
                        <span>Original Legal Text (Page {clause.pageNumber})</span>
                        <span>AS DRAFTED</span>
                      </div>
                      <p className="font-serif text-xs sm:text-[13px] text-[#1C1C19] leading-relaxed italic bg-white p-3 rounded border border-[#EFECE3]">
                        "{clause.originalLegalText}"
                      </p>
                    </div>

                    {/* Right: Plain Language Translation */}
                    <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#6F6D65] uppercase font-semibold">
                        <span>Plain-Language Explanation</span>
                        <span className="text-[#C38A2E]">WHAT THIS MEANS TO YOU</span>
                      </div>
                      <BilingualText
                        language={language}
                        en={matchingFinding?.plainLanguageExplanation || clause.plainExplanation}
                        hi={matchingFinding?.plainLanguageExplanationHindi}
                        mr={matchingFinding?.plainLanguageExplanationMarathi}
                        className="text-xs sm:text-[13px] text-[#1C1C19] leading-relaxed bg-white p-3 rounded border border-[#EFECE3] font-sans"
                        secondaryClassName="block mt-2 pt-2 border-t border-[#EFECE3] text-xs text-[#6F6D65]"
                      />
                    </div>
                  </div>

                  {/* Verbatim Source Span Citation (Trust Standard) */}
                  <SourceSpanCitation
                    span={
                      matchingFinding?.sourceSpan || {
                        documentId: 'doc-sale-deed-402',
                        clauseNumber: clause.clauseNumber,
                        pageNumber: clause.pageNumber,
                        startLine: 1,
                        endLine: 8,
                        exactQuote: clause.originalLegalText,
                        anchorId: `clause-${clause.clauseNumber}-citation`,
                      }
                    }
                    language={language}
                  />

                  {/* Uncertainty Signal if present */}
                  {matchingFinding?.uncertaintySignal && (
                    <UncertaintyBadge
                      signal={matchingFinding.uncertaintySignal}
                      language={language}
                    />
                  )}

                  {/* Obligations Grid: Buyer vs Seller */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white rounded border border-[#DDD9CE] space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#8C621E] tracking-wider block">
                        Purchaser Obligation / Duty
                      </span>
                      <p className="text-xs text-[#4A4843] leading-relaxed">
                        {clause.buyerObligation}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded border border-[#DDD9CE] space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#58735C] tracking-wider block">
                        Vendor Obligation / Duty
                      </span>
                      <p className="text-xs text-[#4A4843] leading-relaxed">
                        {clause.sellerObligation}
                      </p>
                    </div>
                  </div>

                  {/* Risk Note & Recommended Revision if Flagged */}
                  {clause.isFlagged && (
                    <div className="p-4 bg-[#FAF3F1] border border-[#EADBDA] rounded-lg space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-mono font-bold text-[#8E4A3F]">
                        <span className="w-2 h-2 rounded-full bg-[#8E4A3F]" />
                        <span>WHY THIS IS FLAGGED · ACTION RECOMMENDED</span>
                      </div>
                      <p className="text-[#8E4A3F] leading-relaxed">
                        {clause.riskReason}
                      </p>
                      {clause.recommendedRevision && (
                        <div className="pt-2 border-t border-[#EADBDA]/60">
                          <span className="font-semibold text-[#1C1C19] block mb-1 font-mono text-[11px]">
                            PROPOSED COUNTER-AMENDMENT FOR ADVOCATE:
                          </span>
                          <p className="font-serif italic text-[#1C1C19] bg-white p-2.5 rounded border border-[#EADBDA]">
                            "{clause.recommendedRevision}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Link to Full Deep Dive */}
                  {matchingFinding && onSelectFinding && (
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => onSelectFinding(matchingFinding)}
                        className="text-xs font-medium text-[#1C1C19] hover:text-[#8E4A3F] flex items-center gap-1.5 transition-colors underline underline-offset-2"
                      >
                        <span>Open Complete Finding &amp; Audio Explanation →</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredClauses.length === 0 && (
          <div className="p-8 text-center bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg text-[#8C887B] text-xs">
            No clauses matched your filter criteria. Try clearing the search or selecting "All Clauses".
          </div>
        )}
      </div>

      {/* AI Deep Clause Analysis Modal */}
      {selectedAIClause && (
        <AIClauseModal
          isOpen={true}
          onClose={() => setSelectedAIClause(null)}
          clauseNumber={selectedAIClause.clauseNumber}
          pageNumber={selectedAIClause.pageNumber}
          originalText={selectedAIClause.originalText}
          clauseTitle={selectedAIClause.clauseTitle}
          language={language}
          onAddToBrief={() => {
            if (onToggleBrief) {
              const matched = findings.find(
                (f) => f.clauseNumber === selectedAIClause.clauseNumber
              );
              if (matched) {
                onToggleBrief(matched.id);
              }
            }
          }}
        />
      )}
    </div>
  );
};
