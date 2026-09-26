import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ArrowRight,
  Download,
  ChevronDown,
  ChevronUp,
  History,
  Info,
} from 'lucide-react';
import { Language, DocumentInfo, MissingDocument, Finding, Severity, IngestedDocument } from '../types';
import {
  learningModules,
  matterTimeline,
  askedByPeopleList,
} from '../data/mockData';
import { RiskDistributionCard } from './RiskDistributionCard';
import { ExecutiveSummarySection } from './ExecutiveSummarySection';
import { activateOnKey } from '../utils/a11y';

interface OverviewViewProps {
  documentInfo: DocumentInfo;
  findings?: Finding[];
  language: Language;
  customSummaryData?: any;
  documentLibrary?: IngestedDocument[];
  activeDocId?: string;
  onSwitchDocument?: (id: string) => void;
  onRemoveDocument?: (id: string) => void;
  onOpenReport: (severity?: 'ALL' | Severity) => void;
  onOpenBrief: () => void;
  onOpenLearn: (moduleId?: string) => void;
  onOpenUpload: () => void;
  onOpenAskQuestion: (initialQuery?: string) => void;
  onOpenDownloadReport: () => void;
  onOpenPipelineViewer?: () => void;
  onOpenHistory?: () => void;
  onOpenRubric?: () => void;
  onOpenChecklist?: () => void;
  onOpenPathways?: () => void;
  missingDocs: MissingDocument[];
  onToggleMissingDoc: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  documentInfo,
  findings = [],
  language,
  customSummaryData,
  documentLibrary = [],
  activeDocId,
  onSwitchDocument,
  onRemoveDocument,
  onOpenReport,
  onOpenBrief,
  onOpenLearn,
  onOpenUpload,
  onOpenAskQuestion,
  onOpenDownloadReport,
  onOpenPipelineViewer,
  onOpenHistory,
  onOpenRubric,
  onOpenChecklist,
  onOpenPathways,
  missingDocs,
  onToggleMissingDoc,
}) => {
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* 1. Header with Date, Greeting and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#6F6D65] font-medium">
            SATURDAY, 12 SEPTEMBER 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1C19] font-normal tracking-tight">
            Good evening, Rohan.
          </h1>
          <p className="text-sm sm:text-base text-[#6F6D65] max-w-2xl leading-normal">
            One document is awaiting your review before the sub-registrar appointment on 19 September.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 pt-1">
          <button
            onClick={() => onOpenAskQuestion()}
            className="px-4 py-2 text-xs font-medium text-[#1C1C19] bg-[#FCFBF7] border border-[#DDD9CE] rounded-md hover:bg-[#F7F4EC] transition-colors shadow-xs"
          >
            Ask a question
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 text-xs font-medium text-white bg-[#171714] rounded-md hover:bg-[#2C2B26] transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Check a document</span>
          </button>
        </div>
      </div>

      {/* 2. Persistent Legal Disclaimer Banner */}
      <div className="bg-[#F6EFE3] border border-[#E9DFCE] rounded-lg p-3.5 flex items-start gap-3 text-xs text-[#5D5745] leading-relaxed">
        <div className="w-4 h-4 rounded-full border border-[#5D5745] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-serif font-bold">
          i
        </div>
        <p className="flex-1">
          Vidhi explains documents and procedure in plain language. It is not a law firm and does not give legal advice. Every review ends with questions to put to an advocate before you sign or file.
        </p>
      </div>

      {/* 3. AI Document Intelligence & Executive Synthesis */}
      <ExecutiveSummarySection
        language={language}
        customSummaryData={customSummaryData}
        onOpenAdvocateBrief={onOpenBrief}
        onOpenDocument={() => onOpenReport()}
        onOpenPipelineViewer={onOpenPipelineViewer}
      />

      {/* 4. Main Split 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Documents Under Review & Continue Learning */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: DOCUMENTS UNDER REVIEW */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold">
                DOCUMENTS UNDER REVIEW
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenUpload}
                  className="text-xs text-[#8C621E] hover:underline font-medium"
                >
                  + Upload Document
                </button>
                <span className="text-[#DDD9CE]">·</span>
                <button
                  onClick={() => onOpenReport()}
                  className="text-xs text-[#1C1C19] hover:underline font-medium"
                >
                  View Active Report
                </button>
              </div>
            </div>

            <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg divide-y divide-[#EFECE3] shadow-xs overflow-hidden">
              {/* Dynamic Document Library List */}
              {documentLibrary && documentLibrary.length > 0 ? (
                documentLibrary.map((doc) => {
                  const isActive = doc.id === (activeDocId || documentInfo.id);
                  const docInfo = isActive ? documentInfo : doc.documentInfo;
                  const docFindings = isActive ? findings : doc.findings;

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isActive ? 'bg-[#FCFBF7]' : 'hover:bg-[#FAF9F5] opacity-90'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-11 rounded border border-[#DDD9CE] bg-white flex flex-col items-center justify-center gap-1 shrink-0 p-1 shadow-2xs">
                          <div className={`w-5 h-0.5 rounded-full ${isActive ? 'bg-[#171714]' : 'bg-[#8C887B]'}`} />
                          <div className="w-5 h-0.5 bg-[#8C887B] rounded-full" />
                          <div className="w-3.5 h-0.5 bg-[#C9C4B7] rounded-full self-start ml-0.5" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-serif text-base sm:text-lg font-medium text-[#1C1C19] leading-snug">
                              {docInfo.title}
                            </h2>
                            {isActive ? (
                              <span className="text-[9px] font-mono bg-[#EAE6DB] text-[#1C1C19] px-1.5 py-0.2 rounded font-semibold uppercase">
                                ACTIVE DRAFT
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono bg-[#F0EDE6] text-[#6F6D65] px-1.5 py-0.2 rounded font-medium">
                                Ingested
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6F6D65]">
                            Reviewed {docInfo.reviewedTimeAgo || doc.uploadedAt} · {docInfo.pageCount} pages · {docFindings.length} points flagged
                          </p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              onClick={() => {
                                if (!isActive && onSwitchDocument) onSwitchDocument(doc.id);
                                onOpenReport('HIGH');
                              }}
                              className="inline-flex items-center text-[10px] font-mono font-semibold bg-[#FAF3F1] hover:bg-[#F5ECE8] text-[#8E4A3F] border border-[#EADBDA] px-2 py-0.5 rounded transition-colors cursor-pointer"
                              title="Filter by High severity"
                            >
                              {docInfo.highCount} HIGH
                            </button>
                            <button
                              onClick={() => {
                                if (!isActive && onSwitchDocument) onSwitchDocument(doc.id);
                                onOpenReport('MEDIUM');
                              }}
                              className="inline-flex items-center text-[10px] font-mono font-semibold bg-[#F3ECD7] hover:bg-[#EFE6CC] text-[#B08427] border border-[#E8DAB7] px-2 py-0.5 rounded transition-colors cursor-pointer"
                              title="Filter by Medium severity"
                            >
                              {docInfo.mediumCount} MEDIUM
                            </button>
                            <button
                              onClick={() => {
                                if (!isActive && onSwitchDocument) onSwitchDocument(doc.id);
                                onOpenReport('LOW');
                              }}
                              className="inline-flex items-center text-[10px] font-mono font-semibold bg-[#E6EEE6] hover:bg-[#DEE8DE] text-[#58735C] border border-[#D5E2D5] px-2 py-0.5 rounded transition-colors cursor-pointer"
                              title="Filter by Low severity"
                            >
                              {docInfo.lowCount} LOW
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Score and Switch / Open Report Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span
                            className={`font-mono text-xl sm:text-2xl font-bold leading-none ${
                              docInfo.riskScore < 70
                                ? 'text-[#8E4A3F]'
                                : docInfo.riskScore < 85
                                ? 'text-[#B08427]'
                                : 'text-[#58735C]'
                            }`}
                          >
                            {docInfo.riskScore}
                          </span>
                          <span className="text-xs text-[#8C887B] font-mono">/100</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <button
                              onClick={() => onOpenReport()}
                              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#171714] rounded hover:bg-[#2C2B26] transition-colors shadow-xs cursor-pointer"
                            >
                              Open report
                            </button>
                          ) : (
                            <button
                              onClick={() => onSwitchDocument && onSwitchDocument(doc.id)}
                              className="px-3 py-1.5 text-xs font-medium text-[#1C1C19] bg-white border border-[#DDD9CE] rounded hover:bg-[#F7F4EC] transition-colors shadow-2xs cursor-pointer"
                            >
                              Switch to this
                            </button>
                          )}
                          {onRemoveDocument && documentLibrary.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveDocument(doc.id);
                              }}
                              className="p-1.5 text-[#8C887B] hover:text-[#8E4A3F] rounded hover:bg-black/5 text-xs"
                              title="Remove from workspace"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback single document */
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-11 rounded border border-[#DDD9CE] bg-white flex flex-col items-center justify-center gap-1 shrink-0 p-1 shadow-2xs">
                      <div className="w-5 h-0.5 bg-[#171714] rounded-full" />
                      <div className="w-5 h-0.5 bg-[#8C887B] rounded-full" />
                      <div className="w-3.5 h-0.5 bg-[#C9C4B7] rounded-full self-start ml-0.5" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-serif text-base font-medium text-[#1C1C19]">
                        {documentInfo.title}
                      </h2>
                      <p className="text-xs text-[#6F6D65]">
                        {documentInfo.pageCount} pages · {findings.length} points flagged
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenReport()}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#171714] rounded hover:bg-[#2C2B26] transition-colors"
                  >
                    Open report
                  </button>
                </div>
              )}

              {/* Add document / check another document dashed callout */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                onClick={onOpenUpload}
                className="m-3 p-3.5 rounded border border-dashed border-[#DDD9CE] hover:border-[#171714] bg-[#FAF8F2] flex items-center gap-3.5 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded border border-dashed border-[#96938A] flex items-center justify-center text-[#6F6D65] shrink-0 bg-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-[#1C1C19]">
                    Analyze another deed or contract
                  </h4>
                  <p className="text-[11px] text-[#6F6D65] leading-snug mt-0.5">
                    Upload any PDF agreement, draft deed, or paste clauses to run statutory Gemini AI scrutiny
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access: LEGAL INTELLIGENCE SUITE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold">
                LEGAL TECH INTELLIGENCE SUITE
              </span>
              <span className="text-[10px] font-mono text-[#8C887B]">
                4 SPECIALIZED MODULES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Red-Flag Rubric */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                onClick={onOpenRubric}
                className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-3.5 hover:border-[#8E4A3F] cursor-pointer transition-all shadow-2xs space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#8E4A3F] bg-[#FAF3F1] px-1.5 py-0.5 rounded border border-[#EADBDA]">
                    16 CHECKS · 7 DETECTED
                  </span>
                  <span className="text-xs text-[#8C887B] group-hover:text-[#1C1C19] group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1C1C19]">
                  Red-Flag / Risk Rubric
                </h4>
                <p className="text-[11px] text-[#6F6D65] leading-relaxed">
                  Benchmarks deed against 16 common property traps with legal statutory precedents and remedies.
                </p>
              </div>

              {/* Card 2: Actionable Checklist */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                onClick={onOpenChecklist}
                className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-3.5 hover:border-[#C38A2E] cursor-pointer transition-all shadow-2xs space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#8C621E] bg-[#F3ECD7] px-1.5 py-0.5 rounded border border-[#E8DAB7]">
                    11 ITEMS · PRINTABLE
                  </span>
                  <span className="text-xs text-[#8C887B] group-hover:text-[#1C1C19] group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1C1C19]">
                  Pre-Signing Checklist &amp; Punch List
                </h4>
                <p className="text-[11px] text-[#6F6D65] leading-relaxed">
                  Downloadable and printable verification protocol and negotiation punch list for 19 Sep registration.
                </p>
              </div>

              {/* Card 3: Dispute Pathways */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                onClick={onOpenPathways}
                className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-3.5 hover:border-[#58735C] cursor-pointer transition-all shadow-2xs space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#58735C] bg-[#F0F5F0] px-1.5 py-0.5 rounded border border-[#D5E2D5]">
                    DISPUTE PATHWAYS
                  </span>
                  <span className="text-xs text-[#8C887B] group-hover:text-[#1C1C19] group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1C1C19]">
                  Dispute &amp; Negotiation Pathways
                </h4>
                <p className="text-[11px] text-[#6F6D65] leading-relaxed">
                  Neutral breakdown of how Clause 14 arbitration, specific performance suits, and Lok Adalat play out.
                </p>
              </div>

              {/* Card 4: Document Comparison Diff */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                onClick={onOpenHistory}
                className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-3.5 hover:border-[#171714] cursor-pointer transition-all shadow-2xs space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#1C1C19] bg-[#EAE6DB] px-1.5 py-0.5 rounded">
                    SIDE-BY-SIDE DIFF
                  </span>
                  <span className="text-xs text-[#8C887B] group-hover:text-[#1C1C19] group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1C1C19]">
                  Contract Comparison &amp; Audit Trail
                </h4>
                <p className="text-[11px] text-[#6F6D65] leading-relaxed">
                  Side-by-side contract diff between Draft v1.0 and Draft v2.1 tracking -16 risk point reduction.
                </p>
              </div>
            </div>
          </div>

          {/* Card: CONTINUE LEARNING */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold">
                CONTINUE LEARNING
              </span>
              <button
                onClick={() => onOpenLearn()}
                className="text-xs text-[#1C1C19] hover:underline font-medium"
              >
                All modules
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Module 1: How property title passes in India */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                onClick={() => onOpenLearn('mod-02')}
                className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#C9C4B7] cursor-pointer transition-all shadow-2xs min-h-[110px]"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C887B] font-medium">
                    MODULE 02 · 4 OF 6
                  </span>
                  <h4 className="font-serif text-sm font-medium text-[#1C1C19] mt-1.5 leading-snug">
                    How property title passes in India
                  </h4>
                </div>
                {/* Amber Progress Bar */}
                <div className="w-full bg-[#EAE6DB] h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#C38A2E] h-full w-2/3 rounded-full" />
                </div>
              </div>

              {/* Module 2: Which court hears which dispute */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                onClick={() => onOpenLearn('mod-05')}
                className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#C9C4B7] cursor-pointer transition-all shadow-2xs min-h-[110px]"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C887B] font-medium">
                    MODULE 05 · NOT STARTED
                  </span>
                  <h4 className="font-serif text-sm font-medium text-[#1C1C19] mt-1.5 leading-snug">
                    Which court hears which dispute
                  </h4>
                </div>
                {/* Grey Inactive Bar */}
                <div className="w-full bg-[#EAE6DB] h-1 rounded-full overflow-hidden mt-3" />
              </div>

              {/* Module 3: Stamp duty and registration */}
              <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                onClick={() => onOpenLearn('mod-07')}
                className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#C9C4B7] cursor-pointer transition-all shadow-2xs min-h-[110px]"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C887B] font-medium">
                    MODULE 07 · NOT STARTED
                  </span>
                  <h4 className="font-serif text-sm font-medium text-[#1C1C19] mt-1.5 leading-snug">
                    Stamp duty and registration, step by step
                  </h4>
                </div>
                {/* Grey Inactive Bar */}
                <div className="w-full bg-[#EAE6DB] h-1 rounded-full overflow-hidden mt-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Next Step, Risk Distribution Donut, FAQs, Matter Timeline */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: NEXT STEP */}
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C38A2E] font-semibold block">
              NEXT STEP
            </span>
            <h3 className="font-serif text-xl font-medium text-[#1C1C19] leading-snug">
              Take four questions to your advocate
            </h3>
            <p className="text-xs text-[#6F6D65] leading-relaxed">
              Vidhi has drafted a one-page brief from the flagged clauses in your sale deed — each question with the reason it matters and the clause it comes from.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={onOpenBrief}
                className="px-4 py-2 text-xs font-medium text-white bg-[#171714] rounded hover:bg-[#2C2B26] transition-colors shadow-xs"
              >
                Open the brief
              </button>
              <button
                onClick={onOpenBrief}
                className="px-3.5 py-2 text-xs font-medium text-[#1C1C19] bg-white border border-[#DDD9CE] rounded hover:bg-[#F7F4EC] transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Card 2: RISK DISTRIBUTION (Requested Donut Chart Summary Card) */}
          <RiskDistributionCard
            documentInfo={documentInfo}
            findings={findings}
            language={language}
            onOpenReport={onOpenReport}
          />

          {/* Card 3: ASKED BY PEOPLE LIKE YOU */}
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">
              ASKED BY PEOPLE LIKE YOU
            </span>

            <div className="divide-y divide-[#EFECE3]">
              {askedByPeopleList.map((item) => {
                const isExpanded = expandedFaqId === item.id;
                return (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                    <button
                      onClick={() => toggleFaq(item.id)}
                      className="w-full text-left flex items-start justify-between gap-2 text-xs font-normal text-[#1C1C19] hover:text-[#C38A2E] transition-colors"
                    >
                      <span className="leading-snug">{item.question}</span>
                      <span className="text-[#96938A] shrink-0 mt-0.5">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                    <div className="text-[10px] font-mono text-[#8C887B] uppercase tracking-wider">
                      {item.topic} · {item.readTime}
                    </div>

                    {isExpanded && (
                      <div className="mt-2 text-xs text-[#5D5745] bg-[#FAF8F2] p-2.5 rounded border border-[#E8E4D9] leading-relaxed">
                        <p>{item.summary}</p>
                        <button
                          onClick={() => onOpenAskQuestion(item.question)}
                          className="mt-2 text-[#C38A2E] hover:underline font-medium text-[11px] flex items-center gap-1"
                        >
                          <span>Ask a question about this</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: YOUR MATTER */}
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 shadow-xs space-y-3.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">
              YOUR MATTER
            </span>

            <div className="relative pl-5 space-y-3.5 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#DDD9CE]">
              {matterTimeline.map((item) => {
                const isCurrent = item.status === 'CURRENT';
                const isCompleted = item.status === 'COMPLETED';

                return (
                  <div key={item.id} className="relative text-xs">
                    {/* Circle Dot */}
                    <div
                      className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full transition-all ${
                        isCurrent
                          ? 'border-2 border-[#C38A2E] bg-white ring-2 ring-[#F3ECD7]'
                          : isCompleted
                          ? 'bg-[#171714] border border-[#171714]'
                          : 'bg-[#96938A] border border-[#96938A]'
                      }`}
                    />

                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`font-medium ${
                          isCurrent
                            ? 'text-[#C38A2E] font-semibold'
                            : 'text-[#1C1C19]'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono shrink-0 uppercase tracking-wider ${
                          isCurrent
                            ? 'text-[#C38A2E] font-semibold'
                            : 'text-[#8C887B]'
                        }`}
                      >
                        {item.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
