import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  AlertCircle,
  FileCheck2,
  Printer,
  Copy,
  Check,
  Download,
  Filter,
  ArrowRight,
  ShieldCheck,
  Scale,
  Building,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { preSigningChecklist } from '../data/legalIntelligenceData';
import { ChecklistItem, DocumentInfo, Language } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface PreSigningChecklistViewProps {
  documentInfo: DocumentInfo;
  language?: Language;
  onOpenReport?: () => void;
  onOpenBrief?: () => void;
}

export const PreSigningChecklistView: React.FC<PreSigningChecklistViewProps> = ({
  documentInfo,
  language = 'EN',
  onOpenReport,
  onOpenBrief,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(preSigningChecklist);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'DOCUMENTS_VERIFICATION' | 'NEGOTIATION_PUNCH_LIST' | 'REGISTRATION_DAY'>('ALL');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'CRITICAL'>('ALL');
  const [copied, setCopied] = useState(false);

  const toggleItemStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === 'VERIFIED'
              ? 'PENDING'
              : item.status === 'PENDING'
              ? 'FLAGGED_FOR_ADVOCATE'
              : 'VERIFIED';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    let matchesFilter = true;
    if (selectedFilter === 'PENDING') matchesFilter = item.status === 'PENDING';
    if (selectedFilter === 'VERIFIED') matchesFilter = item.status === 'VERIFIED';
    if (selectedFilter === 'CRITICAL') matchesFilter = item.importance === 'CRITICAL_BLOCKER';

    return matchesCategory && matchesFilter;
  });

  const verifiedCount = items.filter((i) => i.status === 'VERIFIED').length;
  const criticalCount = items.filter((i) => i.importance === 'CRITICAL_BLOCKER' && i.status !== 'VERIFIED').length;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textOutput = `VIDHI PRE-SIGNING VERIFICATION & NEGOTIATION PROTOCOL
Property: Flat 402, Kalyani Nagar, Pune
Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
Progress: ${verifiedCount} of ${items.length} Completed

1. VERIFICATION CHECKLIST:
${items
  .filter((i) => i.category === 'DOCUMENTS_VERIFICATION')
  .map((i) => `[${i.status === 'VERIFIED' ? 'X' : ' '}] ${i.title} (${i.importance})\n    Step: ${i.actionableStep}\n    Authority: ${i.authorityOrSource}`)
  .join('\n\n')}

2. NEGOTIATION PUNCH LIST (AMENDMENTS):
${items
  .filter((i) => i.category === 'NEGOTIATION_PUNCH_LIST')
  .map((i) => `[${i.status === 'VERIFIED' ? 'X' : ' '}] ${i.title} (${i.relevantClause || ''})\n    Action: ${i.actionableStep}`)
  .join('\n\n')}

3. REGISTRATION DAY PROTOCOL:
${items
  .filter((i) => i.category === 'REGISTRATION_DAY')
  .map((i) => `[${i.status === 'VERIFIED' ? 'X' : ' '}] ${i.title}\n    Action: ${i.actionableStep}`)
  .join('\n\n')}
`;

    navigator.clipboard.writeText(textOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Banner (Hidden on Print) */}
      <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-5 sm:p-7 shadow-xs space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] font-semibold text-[#8C621E] bg-[#F3ECD7] px-2.5 py-0.5 rounded border border-[#E8DAB7]">
              ACTIONABLE CITIZEN PROTOCOL
            </span>
            <span className="text-xs font-mono text-[#6F6D65]">
              PRE-SIGNING DUE DILIGENCE &amp; PUNCH LIST
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-white border border-[#DDD9CE] text-[#1C1C19] rounded text-xs font-medium hover:bg-[#F3F0E8] transition-colors shadow-2xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#58735C]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1C19]">
            Pre-Signing Checklist &amp; Negotiation Punch List
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6D65] mt-1 leading-relaxed">
            A concrete, item-by-item verification protocol before executing your registered sale deed on 19 September 2026 at Haveli Sub-Registrar.
          </p>
        </div>

        <DisclaimerBanner language={language} className="no-print" />

        {/* Progress Bar & Blocker Alert */}
        <div className="space-y-2 pt-2 border-t border-[#EFECE3]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#1C1C19] font-semibold">
              COMPLETION: {verifiedCount} OF {items.length} ITEMS VERIFIED
            </span>
            <span className="text-[#8E4A3F] font-bold">
              {criticalCount} CRITICAL BLOCKERS REMAINING
            </span>
          </div>
          <div className="w-full bg-[#EAE6DB] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#58735C] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(verifiedCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-[#FCFBF7] border border-[#DDD9CE] p-3 rounded-lg">
        {/* Category Tabs */}
        <div className="inline-flex rounded-md p-0.5 bg-[#EAE6DB] border border-[#DDD9CE] text-xs">
          <button aria-pressed={selectedCategory === 'ALL'}
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded transition-all font-medium ${
              selectedCategory === 'ALL'
                ? 'bg-white text-[#171714] shadow-xs'
                : 'text-[#6F6D65] hover:text-[#171714]'
            }`}
          >
            All Items ({items.length})
          </button>
          <button aria-pressed={selectedCategory === 'DOCUMENTS_VERIFICATION'}
            onClick={() => setSelectedCategory('DOCUMENTS_VERIFICATION')}
            className={`px-3 py-1 rounded transition-all font-medium ${
              selectedCategory === 'DOCUMENTS_VERIFICATION'
                ? 'bg-white text-[#171714] shadow-xs'
                : 'text-[#6F6D65] hover:text-[#171714]'
            }`}
          >
            1. Documents Verification (5)
          </button>
          <button aria-pressed={selectedCategory === 'NEGOTIATION_PUNCH_LIST'}
            onClick={() => setSelectedCategory('NEGOTIATION_PUNCH_LIST')}
            className={`px-3 py-1 rounded transition-all font-medium ${
              selectedCategory === 'NEGOTIATION_PUNCH_LIST'
                ? 'bg-white text-[#171714] shadow-xs'
                : 'text-[#6F6D65] hover:text-[#171714]'
            }`}
          >
            2. Negotiation Punch List (4)
          </button>
          <button aria-pressed={selectedCategory === 'REGISTRATION_DAY'}
            onClick={() => setSelectedCategory('REGISTRATION_DAY')}
            className={`px-3 py-1 rounded transition-all font-medium ${
              selectedCategory === 'REGISTRATION_DAY'
                ? 'bg-white text-[#171714] shadow-xs'
                : 'text-[#6F6D65] hover:text-[#171714]'
            }`}
          >
            3. Registration Day Protocol (2)
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[#8C887B]">Filter:</span>
          <select aria-label="Filter checklist by status"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="bg-white border border-[#C9C4B7] text-[#1C1C19] text-xs rounded px-2.5 py-1 font-medium"
          >
            <option value="ALL">Show All</option>
            <option value="CRITICAL">Critical Blockers Only</option>
            <option value="PENDING">Pending Only</option>
            <option value="VERIFIED">Verified Only</option>
          </select>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="bg-white border border-[#DDD9CE] rounded-lg p-6 sm:p-8 shadow-xs space-y-6 print:border-0 print:p-0 print:shadow-none">
        {/* Printable Header */}
        <div className="border-b-2 border-[#171714] pb-3 flex items-start justify-between">
          <div>
            <span className="font-serif font-bold text-lg text-[#171714]">
              VIDHI
            </span>
            <h2 className="font-serif text-xl font-bold text-[#1C1C19] mt-0.5">
              Citizen Pre-Signing &amp; Negotiation Protocol
            </h2>
            <p className="text-xs text-[#6F6D65]">
              Target: {documentInfo.title} · {documentInfo.property}
            </p>
          </div>
          <div className="text-right text-xs font-mono text-[#6F6D65] space-y-0.5">
            <div>REGISTRATION: 19 SEP 2026</div>
            <div>STATUS: {verifiedCount}/{items.length} VERIFIED</div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-4">
          {filteredItems.map((item, idx) => {
            const isVerified = item.status === 'VERIFIED';
            const isFlagged = item.status === 'FLAGGED_FOR_ADVOCATE';
            const isCritical = item.importance === 'CRITICAL_BLOCKER';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border transition-all ${
                  isVerified
                    ? 'bg-[#F9FAF9] border-[#D5E2D5]'
                    : isCritical
                    ? 'bg-[#FAF3F1]/50 border-[#EADBDA]'
                    : 'bg-[#FCFBF7] border-[#DDD9CE]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Interactive Checkbox */}
                  <button aria-label={`${item.title}: ${isVerified ? 'verified' : isFlagged ? 'flagged for advocate' : 'pending'}. Press to change status`}
                    onClick={() => toggleItemStatus(item.id)}
                    className="mt-0.5 shrink-0 transition-transform active:scale-95 no-print"
                    title="Click to cycle status: Verified -> Pending -> Flagged for Advocate"
                  >
                    {isVerified ? (
                      <CheckSquare className="w-5 h-5 text-[#58735C]" />
                    ) : (
                      <Square className="w-5 h-5 text-[#8C887B] hover:text-[#1C1C19]" />
                    )}
                  </button>

                  {/* Print checkbox */}
                  <div className="hidden print:block w-4 h-4 border border-black mt-1 shrink-0" />

                  {/* Item Content */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#8C621E]">
                          {(idx + 1).toString().padStart(2, '0')}.
                        </span>
                        <h3 className={`font-serif text-sm font-bold ${
                          isVerified ? 'text-[#58735C] line-through' : 'text-[#1C1C19]'
                        }`}>
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCritical && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E4A3F] bg-[#FAF3F1] px-2 py-0.5 rounded border border-[#EADBDA]">
                            CRITICAL BLOCKER
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isVerified
                              ? 'bg-[#E6EEE6] text-[#58735C] border border-[#D5E2D5]'
                              : isFlagged
                              ? 'bg-[#F3ECD7] text-[#8C621E] border border-[#E8DAB7]'
                              : 'bg-white text-[#6F6D65] border border-[#DDD9CE]'
                          }`}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#4A4843] leading-relaxed">
                      {item.description}
                    </p>

                    <div className="bg-white/80 p-2.5 rounded border border-[#EFECE3] text-xs space-y-1 font-sans">
                      <div className="flex items-start gap-1.5">
                        <strong className="text-[#1C1C19] font-medium shrink-0 font-mono text-[11px]">
                          ACTION STEP:
                        </strong>
                        <span className="text-[#1C1C19]">{item.actionableStep}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#6F6D65] pt-0.5">
                        <span>SOURCE: {item.authorityOrSource}</span>
                        {item.relevantClause && (
                          <>
                            <span>·</span>
                            <span className="text-[#8E4A3F] font-semibold">{item.relevantClause}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Printable Footer */}
        <div className="pt-6 border-t border-[#DDD9CE] flex items-center justify-between text-[11px] font-mono text-[#8C887B]">
          <span>GENERATED BY VIDHI CITIZEN PROTOCOL</span>
          <span>SIGN ONLY AFTER COMPLETE TITLE &amp; LOAN CLEARANCE</span>
        </div>
      </div>
    </div>
  );
};
