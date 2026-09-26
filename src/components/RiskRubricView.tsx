import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Scale,
  Download,
  Info,
} from 'lucide-react';
import { redFlagRubricList } from '../data/legalIntelligenceData';
import { RedFlagRubricItem, Severity, Language } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';
import { activateOnKey } from '../utils/a11y';

interface RiskRubricViewProps {
  language?: Language;
  onOpenReport?: () => void;
  onOpenBrief?: () => void;
  onOpenChecklist?: () => void;
}

export const RiskRubricView: React.FC<RiskRubricViewProps> = ({
  language = 'EN',
  onOpenReport,
  onOpenBrief,
  onOpenChecklist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'DETECTED' | 'WATCHLIST' | 'SAFE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedRubricIds, setExpandedRubricIds] = useState<Record<string, boolean>>({
    'rubric-01': true,
    'rubric-02': true,
  });

  const categories = [
    'ALL',
    'Financial & Payment',
    'Possession & Handover',
    'Title & Encumbrances',
    'Dispute Resolution',
    'Liabilities & Outgoings',
    'Contractual Balance',
  ];

  const toggleExpand = (id: string) => {
    setExpandedRubricIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredRubrics = redFlagRubricList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.benchmarkStandard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.clauseReference && item.clauseReference.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'ALL' || item.status === selectedStatus;

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const detectedCount = redFlagRubricList.filter((r) => r.status === 'DETECTED').length;
  const watchlistCount = redFlagRubricList.filter((r) => r.status === 'WATCHLIST').length;
  const safeCount = redFlagRubricList.filter((r) => r.status === 'SAFE').length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-5 sm:p-7 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] font-semibold text-[#8E4A3F] bg-[#FAF3F1] px-2.5 py-0.5 rounded border border-[#EADBDA]">
              RED-FLAG &amp; RISK RUBRIC AUDIT
            </span>
            <span className="text-xs font-mono text-[#6F6D65]">
              16 BENCHMARK INDIAN CONVEYANCING CHECKS
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBrief && (
              <button
                onClick={onOpenBrief}
                className="px-3 py-1.5 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26] transition-colors shadow-xs"
              >
                Advocate Intake Brief
              </button>
            )}
            {onOpenChecklist && (
              <button
                onClick={onOpenChecklist}
                className="px-3 py-1.5 bg-[#C38A2E] text-[#161513] rounded text-xs font-medium hover:bg-[#B57D24] transition-colors shadow-xs font-sans"
              >
                Pre-Signing Checklist
              </button>
            )}
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1C19]">
          Conveyancing Red-Flag Audit Matrix
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6D65] max-w-3xl leading-relaxed">
          Standardized scrutiny of your sale deed against 16 common one-sided clauses, liability transfers, and statutory waivers identified under Indian property law, the Transfer of Property Act, 1882, and MahaRERA.
        </p>

        <DisclaimerBanner language={language} />

        {/* 3 Metric Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div role="button" tabIndex={0} onKeyDown={activateOnKey} aria-pressed={selectedStatus === 'DETECTED'}
            onClick={() => setSelectedStatus('DETECTED')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
              selectedStatus === 'DETECTED'
                ? 'bg-[#FAF3F1] border-[#8E4A3F] ring-1 ring-[#8E4A3F]'
                : 'bg-white border-[#DDD9CE] hover:border-[#C9C4B7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E4A3F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8E4A3F]" />
                DETECTED IN DEED
              </span>
              <span className="text-xl font-mono font-bold text-[#8E4A3F]">
                {detectedCount}
              </span>
            </div>
            <p className="text-[11px] text-[#6F6D65] mt-1">
              Clauses in your draft that shift burden or expose you to risk.
            </p>
          </div>

          <div role="button" tabIndex={0} onKeyDown={activateOnKey} aria-pressed={selectedStatus === 'WATCHLIST'}
            onClick={() => setSelectedStatus('WATCHLIST')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
              selectedStatus === 'WATCHLIST'
                ? 'bg-[#F3ECD7] border-[#C38A2E] ring-1 ring-[#C38A2E]'
                : 'bg-white border-[#DDD9CE] hover:border-[#C9C4B7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C621E] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C38A2E]" />
                WATCHLIST / PARTIAL
              </span>
              <span className="text-xl font-mono font-bold text-[#8C621E]">
                {watchlistCount}
              </span>
            </div>
            <p className="text-[11px] text-[#6F6D65] mt-1">
              Ambiguous provisions requiring society or deed clarification.
            </p>
          </div>

          <div role="button" tabIndex={0} onKeyDown={activateOnKey} aria-pressed={selectedStatus === 'SAFE'}
            onClick={() => setSelectedStatus('SAFE')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
              selectedStatus === 'SAFE'
                ? 'bg-[#F0F5F0] border-[#58735C] ring-1 ring-[#58735C]'
                : 'bg-white border-[#DDD9CE] hover:border-[#C9C4B7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#58735C] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#58735C]" />
                CLEAR / PROTECTED
              </span>
              <span className="text-xl font-mono font-bold text-[#58735C]">
                {safeCount}
              </span>
            </div>
            <p className="text-[11px] text-[#6F6D65] mt-1">
              Standard consumer traps that have been successfully avoided or cured.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C887B] absolute left-3 top-2.5" />
            <input aria-label="Search rubric"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rubric by title, legal principle, trap, or clause (e.g. 'mortgage', 'limitation', 'arbitration')..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded border border-[#C9C4B7] bg-white text-[#1C1C19] focus:outline-none focus:ring-1 focus:ring-[#171714]"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-[#8C887B] font-mono">Status:</span>
            <select aria-label="Filter rubric by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-white border border-[#C9C4B7] text-[#1C1C19] text-xs rounded px-2.5 py-1.5 font-medium"
            >
              <option value="ALL">All 16 Rubric Checks</option>
              <option value="DETECTED">Detected Only ({detectedCount})</option>
              <option value="WATCHLIST">Watchlist ({watchlistCount})</option>
              <option value="SAFE">Clear / Safe ({safeCount})</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] font-mono">
          <span className="text-[#8C887B] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Area:
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

      {/* Rubric Matrix Cards */}
      <div className="space-y-4">
        {filteredRubrics.map((item) => {
          const isExpanded = !!expandedRubricIds[item.id];
          const isDetected = item.status === 'DETECTED';
          const isWatchlist = item.status === 'WATCHLIST';
          const isSafe = item.status === 'SAFE';

          return (
            <div
              key={item.id}
              className={`bg-[#FCFBF7] border rounded-lg overflow-hidden transition-all shadow-xs ${
                isDetected
                  ? 'border-[#E5C4BE] ring-1 ring-[#8E4A3F]/20'
                  : isWatchlist
                  ? 'border-[#EADBB7]'
                  : 'border-[#DDD9CE]'
              }`}
            >
              {/* Header Accordion */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey} aria-expanded={isExpanded}
                onClick={() => toggleExpand(item.id)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer bg-gradient-to-r from-[#FAF8F5] to-[#FCFBF7] hover:bg-[#F5F2EA] transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-sm ${
                      isDetected
                        ? 'bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA]'
                        : isWatchlist
                        ? 'bg-[#F3ECD7] text-[#8C621E] border border-[#E8DAB7]'
                        : 'bg-[#F0F5F0] text-[#58735C] border border-[#D5E2D5]'
                    }`}
                  >
                    #{item.rubricNumber.toString().padStart(2, '0')}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-sm sm:text-base text-[#1C1C19]">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isDetected
                            ? 'bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA]'
                            : isWatchlist
                            ? 'bg-[#F3ECD7] text-[#8C621E] border border-[#E8DAB7]'
                            : 'bg-[#F0F5F0] text-[#58735C] border border-[#D5E2D5]'
                        }`}
                      >
                        {isDetected
                          ? `${item.severity} · DETECTED`
                          : isWatchlist
                          ? `${item.severity} · WATCHLIST`
                          : 'SAFE & VERIFIED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#6F6D65] mt-1 font-mono">
                      <span>{item.category}</span>
                      {item.clauseReference && (
                        <>
                          <span>·</span>
                          <span className="text-[#1C1C19] font-semibold underline underline-offset-2">
                            {item.clauseReference}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="text-xs font-mono text-[#8C887B]">
                    {isExpanded ? 'Hide Analysis' : 'Inspect Rubric'}
                  </span>
                  <div className="p-1 rounded text-[#8C887B]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-[#DDD9CE] space-y-4 bg-[#FCFBF7] text-xs">
                  {/* Two-Column: Why It Matters & The Benchmark Standard */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* The Trap Box */}
                    <div className="p-4 bg-white rounded-lg border border-[#DDD9CE] space-y-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#8E4A3F] tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        The Contractual Trap / Why Sellers Insert This
                      </span>
                      <p className="text-[#4A4843] leading-relaxed text-xs">
                        {item.theTrap}
                      </p>
                    </div>

                    {/* Legal Benchmark */}
                    <div className="p-4 bg-white rounded-lg border border-[#DDD9CE] space-y-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#58735C] tracking-wider flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" />
                        Statutory Benchmark / Fair Conveyancing Standard
                      </span>
                      <p className="text-[#4A4843] leading-relaxed text-xs">
                        {item.benchmarkStandard}
                      </p>
                    </div>
                  </div>

                  {/* Current Document Position */}
                  <div className="p-3.5 bg-[#FAF8F5] rounded border border-[#DDD9CE] space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#6F6D65] tracking-wider">
                      Position in Current Draft (Sale deed — Flat 402):
                    </span>
                    <p className="text-xs font-serif text-[#1C1C19]">
                      {item.currentDraftStatus}
                    </p>
                  </div>

                  {/* Recommended Remedy */}
                  <div className="p-4 bg-[#FAF3F1] border border-[#EADBDA] rounded-lg space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#8E4A3F] tracking-wider block">
                      Recommended Advocate Remedy &amp; Counter-Draft:
                    </span>
                    <p className="text-xs text-[#1C1C19] leading-relaxed font-serif italic">
                      "{item.recommendedRemedy}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredRubrics.length === 0 && (
          <div className="p-8 text-center bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg text-[#8C887B] text-xs">
            No red flags matched your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
