import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ArrowRight,
  Check,
  Plus,
  ExternalLink,
  Layers,
  AlertTriangle,
  Highlighter,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Sparkles,
  Tag as TagIcon,
  Search,
} from 'lucide-react';
import {
  Language,
  DocumentInfo,
  Finding,
  Severity,
  ViewMode,
  DocumentAnnotation,
  HighlightColor,
  FullClauseExplanation,
} from '../types';
import { ClauseByClauseView } from './ClauseByClauseView';
import { SourceSpanCitation } from './SourceSpanCitation';
import { UncertaintyBadge } from './UncertaintyBadge';
import { DisclaimerBanner } from './DisclaimerBanner';
import { AnnotationModal } from './AnnotationModal';
import { DocumentAnnotationsPanel } from './DocumentAnnotationsPanel';
import { AIClauseModal } from './AIClauseModal';
import { deedPages, DocumentLine, DocumentPage } from '../data/documentPagesData';
import { initialDocumentAnnotations } from '../data/mockData';

interface DocumentReviewViewProps {
  documentInfo: DocumentInfo;
  findings: Finding[];
  pages?: DocumentPage[];
  clauses?: FullClauseExplanation[];
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onSelectFinding: (finding: Finding) => void;
  onOpenAdvocateBrief: () => void;
  onToggleBrief: (findingId: string) => void;
  onOpenDownloadReport: () => void;
  onOpenHistory?: () => void;
  initialSeverityFilter?: 'ALL' | Severity;
  annotations?: DocumentAnnotation[];
  onSaveAnnotation?: (annotation: DocumentAnnotation) => void;
  onDeleteAnnotation?: (id: string) => void;
}

const colorBgMap: Record<HighlightColor, { lineBg: string; border: string; label: string }> = {
  yellow: { lineBg: 'bg-amber-100/70 border-l-4 border-amber-400', border: 'border-amber-400', label: 'Yellow' },
  amber: { lineBg: 'bg-orange-100/70 border-l-4 border-orange-400', border: 'border-orange-400', label: 'Amber' },
  rose: { lineBg: 'bg-rose-100/70 border-l-4 border-rose-400', border: 'border-rose-400', label: 'Rose' },
  green: { lineBg: 'bg-emerald-100/70 border-l-4 border-emerald-400', border: 'border-emerald-400', label: 'Green' },
  blue: { lineBg: 'bg-sky-100/70 border-l-4 border-sky-400', border: 'border-sky-400', label: 'Blue' },
  purple: { lineBg: 'bg-purple-100/70 border-l-4 border-purple-400', border: 'border-purple-400', label: 'Purple' },
};

const tagMetaMap: Record<NonNullable<DocumentAnnotation['tag']>, { label: string; bg: string }> = {
  ADVOCATE_QUERY: { label: 'Advocate Query', bg: 'bg-purple-100 text-purple-900 border-purple-300' },
  ACTION_ITEM: { label: 'Action Item', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
  BANK_CHECK: { label: 'Bank Check', bg: 'bg-sky-100 text-sky-900 border-sky-300' },
  RED_FLAG: { label: 'Red Flag Trap', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
  GENERAL_NOTE: { label: 'Personal Note', bg: 'bg-stone-100 text-stone-900 border-stone-300' },
};

export const DocumentReviewView: React.FC<DocumentReviewViewProps> = ({
  documentInfo,
  findings,
  pages,
  clauses,
  language,
  onLanguageChange,
  onSelectFinding,
  onOpenAdvocateBrief,
  onToggleBrief,
  initialSeverityFilter = 'ALL',
  annotations: propAnnotations,
  onSaveAnnotation: propOnSaveAnnotation,
  onDeleteAnnotation: propOnDeleteAnnotation,
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'plain'>('document');
  const [mobileColumn, setMobileColumn] = useState<'findings' | 'paper'>('findings');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<
    'ALL' | Severity
  >(initialSeverityFilter);
  const [activeFindingId, setActiveFindingId] = useState<string>('f-1');

  // Page navigation & Annotate state
  const activePages = pages && pages.length > 0 ? pages : deedPages;
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(() =>
    activePages.length > 0 ? activePages[0].pageNumber : 1
  );
  const [isAnnotateMode, setIsAnnotateMode] = useState<boolean>(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColor>('yellow');
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState<boolean>(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Partial<DocumentAnnotation> | null>(null);
  const [isAnnotationsPanelOpen, setIsAnnotationsPanelOpen] = useState<boolean>(false);
  const [flashingLineNumber, setFlashingLineNumber] = useState<number | null>(null);
  const [selectedAIClause, setSelectedAIClause] = useState<{
    clauseNumber: number;
    pageNumber: number;
    originalText: string;
    clauseTitle: string;
  } | null>(null);

  // Fallback local annotations state if not provided via props
  const [localAnnotations, setLocalAnnotations] = useState<DocumentAnnotation[]>(initialDocumentAnnotations);
  const currentAnnotations = propAnnotations !== undefined ? propAnnotations : localAnnotations;

  const handleSave = (annotation: DocumentAnnotation) => {
    if (propOnSaveAnnotation) {
      propOnSaveAnnotation(annotation);
    } else {
      setLocalAnnotations((prev) => {
        const idx = prev.findIndex((a) => a.id === annotation.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = annotation;
          return updated;
        }
        return [annotation, ...prev];
      });
    }
  };

  const handleDelete = (id: string) => {
    if (propOnDeleteAnnotation) {
      propOnDeleteAnnotation(id);
    } else {
      setLocalAnnotations((prev) => prev.filter((a) => a.id !== id));
    }
  };

  useEffect(() => {
    if (initialSeverityFilter) {
      setSelectedSeverityFilter(initialSeverityFilter);
    }
  }, [initialSeverityFilter]);

  const filteredFindings = findings.filter((f) => {
    if (selectedSeverityFilter === 'ALL') return true;
    return f.severity === selectedSeverityFilter;
  });

  const briefCount = findings.filter((f) => f.inAdvocateBrief).length;

  useEffect(() => {
    if (pages && pages.length > 0) {
      if (!pages.some((p) => p.pageNumber === currentPageNumber)) {
        setCurrentPageNumber(pages[0].pageNumber);
      }
    }
  }, [pages]);

  // Find page data
  const currentPage =
    activePages.find((p) => p.pageNumber === currentPageNumber) ||
    activePages.find((p) => p.pageNumber === 7) ||
    activePages[0] || {
      pageNumber: 1,
      headerTitle: 'PAGE 1',
      lines: [],
    };
  const pageAnnotations = currentAnnotations.filter((a) => a.pageNumber === currentPageNumber);

  const handleLineClick = (line: DocumentLine) => {
    const existing = pageAnnotations.find((a) => a.lineNumber === line.lineNumber);
    if (existing) {
      setEditingAnnotation(existing);
    } else {
      setEditingAnnotation({
        documentId: documentInfo.id,
        pageNumber: currentPageNumber,
        lineNumber: line.lineNumber,
        clauseNumber: line.clauseNumber,
        lineText: line.text,
        color: activeHighlightColor,
        tag: line.isFlaggedFinding ? 'RED_FLAG' : 'ADVOCATE_QUERY',
      });
    }
    setIsAnnotationModalOpen(true);
  };

  const handleJumpToLine = (pageNumber: number, lineNumber: number) => {
    setCurrentPageNumber(pageNumber);
    setFlashingLineNumber(lineNumber);
    setTimeout(() => {
      const el = document.getElementById(`doc-line-${lineNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => {
      setFlashingLineNumber(null);
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto -mt-2">
      {/* 1. Top Navbar matching 1b-risk-report.png */}
      <div className="bg-[#161513] text-[#FAF8F5] px-4 sm:px-6 py-3 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg tracking-[0.08em] text-[#FAF8F5] font-normal">
            VIDHI
          </span>
          <span className="text-[#3A3831] select-none">|</span>
          <span className="text-sm font-medium text-[#FAF8F5] truncate max-w-xs sm:max-w-md" title={documentInfo.title}>
            {documentInfo.title}
          </span>
          <span className="border border-[#38352E] px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#A8A49A] uppercase tracking-wider shrink-0">
            {activePages.length} PAGES · {documentInfo.version || 'AI REVIEWED'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Multilingual Switcher: EN / हिंदी / मराठी */}
          <div className="flex items-center gap-1 text-xs font-mono bg-[#22201C] px-2 py-1 rounded border border-[#33302A]">
            <button
              onClick={() => onLanguageChange && onLanguageChange('EN')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'EN'
                  ? 'bg-[#FAF8F5] text-[#171714] font-bold shadow-xs'
                  : 'text-[#A8A49A] hover:text-white'
              }`}
            >
              EN
            </button>
            <span className="text-[#55524A]">/</span>
            <button
              onClick={() => onLanguageChange && onLanguageChange('HI')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'HI'
                  ? 'bg-[#FAF8F5] text-[#171714] font-bold shadow-xs'
                  : 'text-[#A8A49A] hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <span className="text-[#55524A]">/</span>
            <button
              onClick={() => onLanguageChange && onLanguageChange('MR')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'MR'
                  ? 'bg-[#FAF8F5] text-[#171714] font-bold shadow-xs'
                  : 'text-[#A8A49A] hover:text-white'
              }`}
            >
              मराठी
            </button>
          </div>

          <button
            onClick={onOpenAdvocateBrief}
            className="bg-[#C38A2E] text-[#161513] font-medium text-xs px-3.5 py-1.5 rounded hover:bg-[#B57D24] transition-colors shadow-xs"
          >
            Questions for my advocate
          </button>
        </div>
      </div>

      {/* Compliance Disclaimer & Uncertainty Signaling Thread */}
      <DisclaimerBanner language={language} />

      {/* 2. Sub-header Bar: Toggle [Document | Plain-language] and Annotation / Page Toolbar */}
      <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-md p-0.5 bg-[#EAE6DB] border border-[#DDD9CE] text-xs">
            <button
              onClick={() => setActiveTab('document')}
              className={`px-3 py-1 rounded transition-all font-medium ${
                activeTab === 'document'
                  ? 'bg-white text-[#171714] shadow-xs'
                  : 'text-[#6F6D65] hover:text-[#171714]'
              }`}
            >
              Document Paper
            </button>
            <button
              onClick={() => setActiveTab('plain')}
              className={`px-3 py-1 rounded transition-all font-medium ${
                activeTab === 'plain'
                  ? 'bg-white text-[#171714] shadow-xs'
                  : 'text-[#6F6D65] hover:text-[#171714]'
              }`}
            >
              Clause-by-Clause Translation
            </button>
          </div>

          {activeTab === 'document' && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#DDD9CE]">
              <span className="text-[11px] font-mono text-[#6F6D65] uppercase">Page:</span>
              <button
                onClick={() => {
                  const pagesList = activePages.map((p) => p.pageNumber);
                  const currIdx = pagesList.indexOf(currentPageNumber);
                  if (currIdx > 0) setCurrentPageNumber(pagesList[currIdx - 1]);
                }}
                disabled={activePages.length === 0 || currentPageNumber === activePages[0].pageNumber}
                className="p-1 rounded bg-[#EAE6DB] text-[#1C1C19] disabled:opacity-40 hover:bg-[#DDD9CE]"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <select
                value={currentPageNumber}
                onChange={(e) => setCurrentPageNumber(Number(e.target.value))}
                className="text-xs font-mono font-semibold bg-white border border-[#DDD9CE] rounded px-2 py-1 text-[#1C1C19]"
              >
                {activePages.map((p) => (
                  <option key={p.pageNumber} value={p.pageNumber}>
                    Page {p.pageNumber} of {activePages.length} {p.lines.some((l) => l.isFlaggedFinding) ? '(! Flagged)' : ''}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const pagesList = activePages.map((p) => p.pageNumber);
                  const currIdx = pagesList.indexOf(currentPageNumber);
                  if (currIdx < pagesList.length - 1) setCurrentPageNumber(pagesList[currIdx + 1]);
                }}
                disabled={activePages.length === 0 || currentPageNumber === activePages[activePages.length - 1].pageNumber}
                className="p-1 rounded bg-[#EAE6DB] text-[#1C1C19] disabled:opacity-40 hover:bg-[#DDD9CE]"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Annotate Feature Controls */}
        {activeTab === 'document' && (
          <div className="flex items-center gap-2">
            {/* Annotate Mode Toggle */}
            <button
              onClick={() => setIsAnnotateMode(!isAnnotateMode)}
              className={`text-xs font-mono px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-all ${
                isAnnotateMode
                  ? 'bg-[#1C1C19] text-[#FAF8F5] border-[#1C1C19] shadow-sm font-semibold'
                  : 'bg-white text-[#1C1C19] border-[#DDD9CE] hover:border-[#1C1C19]'
              }`}
              title="Toggle Annotate Mode to easily click and add notes/highlights to any line"
            >
              <Highlighter className={`w-3.5 h-3.5 ${isAnnotateMode ? 'text-[#FBBF24]' : 'text-[#8C621E]'}`} />
              <span>{isAnnotateMode ? 'Annotate Mode: ON' : 'Annotate Mode'}</span>
            </button>

            {/* Quick Color Picker */}
            <div className="hidden sm:flex items-center gap-1 bg-white border border-[#DDD9CE] rounded-md px-2 py-1">
              <span className="text-[10px] font-mono text-[#6F6D65] mr-1">Color:</span>
              {(['yellow', 'amber', 'rose', 'green', 'blue', 'purple'] as HighlightColor[]).map((c) => {
                const isSelected = activeHighlightColor === c;
                const dotColor =
                  c === 'yellow' ? 'bg-[#FBBF24]' :
                  c === 'amber' ? 'bg-[#F97316]' :
                  c === 'rose' ? 'bg-[#F43F5E]' :
                  c === 'green' ? 'bg-[#10B981]' :
                  c === 'blue' ? 'bg-[#0EA5E9]' : 'bg-[#A855F7]';
                return (
                  <button
                    key={c}
                    onClick={() => setActiveHighlightColor(c)}
                    className={`w-4 h-4 rounded-full ${dotColor} transition-transform ${
                      isSelected ? 'ring-2 ring-offset-1 ring-[#1C1C19] scale-110' : 'hover:scale-110 opacity-80'
                    }`}
                    title={`Set default color: ${c}`}
                  />
                );
              })}
            </div>

            {/* Sticky Notes Panel Drawer Button */}
            <button
              onClick={() => setIsAnnotationsPanelOpen(true)}
              className="relative text-xs font-mono bg-[#FAF3E0] border border-[#E8D499] text-[#8C621E] hover:bg-[#F5ECCB] px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
            >
              <span>Sticky Notes</span>
              <span className="bg-[#8C621E] text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                {currentAnnotations.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Column View Switcher (Visible on < lg screens) */}
      {activeTab === 'document' && (
        <div className="lg:hidden flex items-center bg-[#EAE6DB] p-1 rounded-md text-xs font-medium">
          <button
            onClick={() => setMobileColumn('findings')}
            className={`flex-1 py-1.5 rounded transition-all text-center ${
              mobileColumn === 'findings'
                ? 'bg-white text-[#171714] shadow-xs font-semibold'
                : 'text-[#6F6D65]'
            }`}
          >
            Risk Claims &amp; Findings ({findings.length})
          </button>
          <button
            onClick={() => setMobileColumn('paper')}
            className={`flex-1 py-1.5 rounded transition-all text-center ${
              mobileColumn === 'paper'
                ? 'bg-white text-[#171714] shadow-xs font-semibold'
                : 'text-[#6F6D65]'
            }`}
          >
            Original Deed Paper (Page {currentPageNumber})
          </button>
        </div>
      )}

      {/* When Plain-language version is active: Full Clause-by-Clause Engine */}
      {activeTab === 'plain' ? (
        <ClauseByClauseView
          findings={findings}
          clauses={clauses}
          language={language}
          onSelectFinding={onSelectFinding}
          onToggleBrief={onToggleBrief}
          onOpenAdvocateBrief={onOpenAdvocateBrief}
        />
      ) : (
        /* 3. Main Split Grid (Left: Document Paper with Line-by-Line Annotations, Right: Risk HUD & Flagged Findings) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Document Paper */}
        <div className={`${mobileColumn === 'paper' ? 'block' : 'hidden lg:block'} lg:col-span-6 space-y-3`}>
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 sm:p-7 shadow-xs font-serif leading-relaxed text-[#1C1C19] text-[13px] sm:text-[13.5px] min-h-[640px] flex flex-col justify-between relative">
            <div className="space-y-5">
              {/* Header on page */}
              <div className="border-b border-[#EFECE3] pb-2.5">
                <div className="flex items-center justify-between text-xs font-mono text-[#8C887B] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1C1C19]">{currentPage.headerTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const pageText = currentPage.lines.map((l) => l.text).join(' ');
                        setSelectedAIClause({
                          clauseNumber: currentPage.lines[0]?.clauseNumber || currentPage.pageNumber,
                          pageNumber: currentPage.pageNumber,
                          originalText: pageText,
                          clauseTitle: `${currentPage.headerTitle} (Page ${currentPage.pageNumber})`,
                        });
                      }}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-[#C38A2E]/50 bg-[#F3ECD7]/60 text-[#8C621E] hover:bg-[#F3ECD7] transition-colors"
                      title="Run AI scrutiny on entire page content"
                    >
                      AI Scrutiny
                    </button>
                    <span className="bg-[#EAE6DB] px-2 py-0.5 rounded text-[#1C1C19] font-bold">
                      PAGE {currentPage.pageNumber} OF {activePages.length}
                    </span>
                  </div>
                </div>
                {currentPage.stampDutyNote && (
                  <div className="mt-1 text-[10px] font-mono text-[#8C621E] flex items-center gap-1.5 bg-[#FAF3E0] px-2 py-0.5 rounded border border-[#E8D499]">
                    <span className="font-semibold uppercase tracking-wider">Stamp Duty:</span>
                    <span>{currentPage.stampDutyNote}</span>
                  </div>
                )}
                {isAnnotateMode && (
                  <div className="mt-2 bg-[#1C1C19] text-[#FAF8F5] text-[11px] font-mono px-2.5 py-1 rounded flex items-center justify-between">
                    <span>Annotate Mode Active: Click any line to add notes or highlight</span>
                    <span className="text-[#C38A2E] cursor-pointer underline" onClick={() => setIsAnnotateMode(false)}>Done</span>
                  </div>
                )}
              </div>

              {/* Line by Line Render with Annotate capability */}
              <div className="space-y-2">
                {currentPage.lines.map((line) => {
                  const lineAnnotation = pageAnnotations.find((a) => a.lineNumber === line.lineNumber);
                  const isFlashing = flashingLineNumber === line.lineNumber;
                  const highlightStyle = lineAnnotation ? colorBgMap[lineAnnotation.color] : null;

                  return (
                    <div
                      key={line.lineNumber}
                      id={`doc-line-${line.lineNumber}`}
                      className={`group relative rounded-md transition-all ${
                        isFlashing ? 'ring-2 ring-[#C38A2E] bg-amber-50' : ''
                      }`}
                    >
                      {/* Line content row */}
                      <div
                        onClick={() => {
                          if (line.isFlaggedFinding && line.findingId && !isAnnotateMode) {
                            setActiveFindingId(line.findingId);
                            const f = findings.find((item) => item.id === line.findingId);
                            if (f) onSelectFinding(f);
                          } else {
                            handleLineClick(line);
                          }
                        }}
                        className={`flex items-start gap-2.5 p-2 rounded cursor-pointer transition-colors relative ${
                          highlightStyle ? highlightStyle.lineBg : 'hover:bg-[#F6F3EB]'
                        } ${
                          line.isFlaggedFinding && line.findingId === activeFindingId
                            ? 'ring-2 ring-[#8E4A3F]/50'
                            : ''
                        }`}
                      >
                        {/* Gutter Line Number */}
                        <div className="shrink-0 w-6 text-right select-none pt-0.5">
                          <span className="text-[10px] font-mono text-[#8C887B] group-hover:text-[#1C1C19]">
                            {line.lineNumber.toString().padStart(2, '0')}
                          </span>
                        </div>

                        {/* Line Text & Clause Badges */}
                        <div className="flex-1 leading-relaxed">
                          <p className="inline">
                            {line.isFlaggedFinding ? (
                              <span
                                className={`border-b-2 font-medium px-1 rounded transition-colors ${
                                  line.findingSeverity === 'HIGH'
                                    ? 'border-[#8E4A3F] bg-[#FAF3F1] text-[#8E4A3F]'
                                    : line.findingSeverity === 'MEDIUM'
                                    ? 'border-[#C38A2E] bg-[#F3ECD7] text-[#8C621E]'
                                    : 'border-[#58735C] bg-[#F0F5F0] text-[#3A4E3E]'
                                }`}
                                title={line.findingTitle || 'Flagged legal finding'}
                              >
                                {line.text}
                              </span>
                            ) : (
                              <span>{line.text}</span>
                            )}
                          </p>

                          {/* Flagged Finding Tag */}
                          {line.isFlaggedFinding && line.findingTitle && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/90 border shadow-2xs border-[#DDD9CE] text-[#8E4A3F]">
                              <span>Flag: {line.findingTitle}</span>
                            </span>
                          )}
                        </div>

                        {/* Quick Annotate Trigger Button on hover */}
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLineClick(line);
                            }}
                            className="text-[10px] font-mono bg-white border border-[#DDD9CE] text-[#1C1C19] hover:bg-[#FAF8F5] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1"
                            title="Add sticky note or change highlight"
                          >
                            <Highlighter className="w-3 h-3 text-[#C38A2E]" />
                            <span>{lineAnnotation ? 'Edit Note' : '+ Note'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Attached Sticky Note Card (Rendered directly under the line) */}
                      {lineAnnotation && (
                        <div className="ml-8 my-2 mr-2">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLineClick(line);
                            }}
                            className="bg-gradient-to-b from-[#FFFDF0] to-[#FEF9C3] border border-amber-300/90 rounded-md p-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative group/note"
                          >
                            {/* Sticky Pin & Tag bar */}
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono uppercase font-bold text-[#8C621E]">
                                  Sticky Note · Line {line.lineNumber}
                                </span>
                                {lineAnnotation.tag && (
                                  <span
                                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                      tagMetaMap[lineAnnotation.tag]?.bg || 'bg-amber-100'
                                    }`}
                                  >
                                    {tagMetaMap[lineAnnotation.tag]?.label}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-80 group-hover/note:opacity-100">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLineClick(line);
                                  }}
                                  className="p-1 text-[#6F6D65] hover:text-[#1C1C19] hover:bg-black/5 rounded"
                                  title="Edit note"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(lineAnnotation.id);
                                  }}
                                  className="p-1 text-[#8E4A3F] hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Delete note"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Note body text */}
                            {lineAnnotation.note ? (
                              <p className="text-xs font-sans text-[#1C1C19] leading-relaxed whitespace-pre-line bg-white/60 p-2 rounded border border-amber-200/60">
                                {lineAnnotation.note}
                              </p>
                            ) : (
                              <p className="text-[11px] font-mono italic text-[#8C887B]">
                                (Color highlight only — click to attach sticky note text)
                              </p>
                            )}

                            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-[#8C887B]">
                              <span>Saved locally</span>
                              <span className="text-[#8C621E] hover:underline">Click note to edit</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Highlight Key matching legal intelligence requirements */}
            <div className="mt-8 pt-4 border-t border-[#EFECE3] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#6F6D65]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold uppercase tracking-wider text-[#1C1C19]">
                  DOCUMENT KEY:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8E4A3F]" />
                  <span>High risk trap</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C38A2E]" />
                  <span>Needs check</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#58735C]" />
                  <span>Standard clause</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] border border-amber-500" />
                  <span className="font-semibold text-[#8C621E]">Your Sticky Notes</span>
                </div>
              </div>
              <button
                onClick={() => setIsAnnotateMode(true)}
                className="text-[#8C621E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Click any line to annotate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Risk Assessment & Flagged Points List */}
        <div className={`${mobileColumn === 'findings' ? 'block' : 'hidden lg:block'} lg:col-span-6 space-y-4`}>
          {/* Card 1: Score Circle HUD & Verdict */}
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 sm:p-6 shadow-xs">
            <div className="flex items-start gap-5">
              {/* Circular Gauge */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#EAE6DB]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#8E4A3F]"
                    strokeDasharray="62, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-xl font-bold text-[#8E4A3F] leading-none">
                    62
                  </span>
                  <span className="text-[9px] font-mono text-[#8C887B] uppercase mt-0.5">
                    OF 100
                  </span>
                </div>
              </div>

              {/* Verdict Text */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8C887B] font-semibold block">
                  RISK TO YOU AS PURCHASER
                </span>
                <h3 className="font-serif text-xl font-medium text-[#8E4A3F]">
                  Sign only after changes
                </h3>
                <p className="text-xs text-[#6F6D65] leading-relaxed">
                  Two clauses shift ordinary seller obligations onto you. Both are commonly negotiated.
                </p>
              </div>
            </div>

            {/* WHERE THE RISK SITS Bar Breakdown */}
            <div className="mt-5 pt-4 border-t border-[#EFECE3] space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">
                WHERE THE RISK SITS
              </span>

              <div className="space-y-2 text-xs">
                {/* 1. Payment & encumbrances */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1C1C19]">Payment &amp; encumbrances</span>
                    <span className="font-mono font-semibold text-[#8E4A3F]">HIGH</span>
                  </div>
                  <div className="w-full bg-[#EAE6DB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#8E4A3F] h-full w-full rounded-full" />
                  </div>
                </div>

                {/* 2. Possession & outgoings */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1C1C19]">Possession &amp; outgoings</span>
                    <span className="font-mono font-semibold text-[#8E4A3F]">HIGH</span>
                  </div>
                  <div className="w-full bg-[#EAE6DB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#8E4A3F] h-full w-full rounded-full" />
                  </div>
                </div>

                {/* 3. Title & disclosure */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1C1C19]">Title &amp; disclosure</span>
                    <span className="font-mono font-semibold text-[#B08427]">MEDIUM</span>
                  </div>
                  <div className="w-full bg-[#EAE6DB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#C38A2E] h-full w-3/5 rounded-full" />
                  </div>
                </div>

                {/* 4. Costs & stamp duty */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1C1C19]">Costs &amp; stamp duty</span>
                    <span className="font-mono font-semibold text-[#B08427]">MEDIUM</span>
                  </div>
                  <div className="w-full bg-[#EAE6DB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#C38A2E] h-full w-1/2 rounded-full" />
                  </div>
                </div>

                {/* 5. Dispute resolution */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1C1C19]">Dispute resolution</span>
                    <span className="font-mono font-semibold text-[#58735C]">LOW</span>
                  </div>
                  <div className="w-full bg-[#EAE6DB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#58735C] h-full w-1/4 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: FLAGGED POINTS · 7 with Severity Filter & Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold">
                FLAGGED POINTS · {findings.length}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8C887B] text-[11px]">Sort:</span>
                <select
                  value={selectedSeverityFilter}
                  onChange={(e) =>
                    setSelectedSeverityFilter(e.target.value as 'ALL' | Severity)
                  }
                  className="bg-[#FCFBF7] border border-[#DDD9CE] text-[#1C1C19] text-xs rounded px-2 py-0.5 font-medium"
                >
                  <option value="ALL">All severities</option>
                  <option value="HIGH">High risk</option>
                  <option value="MEDIUM">Medium risk</option>
                  <option value="LOW">Low risk</option>
                </select>
              </div>
            </div>

            {/* Findings List matching 1b-risk-report.png cards */}
            <div className="space-y-3">
              {filteredFindings.map((finding, idx) => {
                const isHigh = finding.severity === 'HIGH';
                const isMedium = finding.severity === 'MEDIUM';

                return (
                  <div
                    key={finding.id}
                    className={`bg-[#FCFBF7] border rounded-lg p-4 sm:p-5 shadow-xs space-y-2.5 transition-all ${
                      activeFindingId === finding.id
                        ? 'border-[#C38A2E] ring-1 ring-[#C38A2E]/40'
                        : 'border-[#DDD9CE] hover:border-[#C9C4B7]'
                    }`}
                  >
                    {/* Header badge and numbering */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isHigh
                            ? 'bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA]'
                            : isMedium
                            ? 'bg-[#F3ECD7] text-[#B08427] border border-[#E8DAB7]'
                            : 'bg-[#E6EEE6] text-[#58735C] border border-[#D5E2D5]'
                        }`}
                      >
                        {finding.severity} · CLAUSE {finding.clauseNumber}, PAGE {finding.pageNumber}
                      </span>
                      <span className="text-[10px] font-mono text-[#8C887B]">
                        {idx + 1} OF {findings.length}
                      </span>
                    </div>

                    {/* Headline and plain explanation */}
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm sm:text-base font-semibold text-[#1C1C19] leading-snug">
                        {language === 'HI' && finding.shortTitleHindi
                          ? finding.shortTitleHindi
                          : language === 'MR' && finding.shortTitleMarathi
                          ? finding.shortTitleMarathi
                          : finding.shortTitle}
                      </h4>
                      <p className="text-xs text-[#6F6D65] leading-relaxed">
                        {language === 'HI' && finding.plainLanguageExplanationHindi
                          ? finding.plainLanguageExplanationHindi
                          : language === 'MR' && finding.plainLanguageExplanationMarathi
                          ? finding.plainLanguageExplanationMarathi
                          : finding.plainLanguageExplanation}
                      </p>
                    </div>

                    {/* Source-Span Citation on Claim (Differentiator from generic AI) */}
                    {finding.sourceSpan && (
                      <SourceSpanCitation
                        span={finding.sourceSpan}
                        language={language}
                        onJumpToSpan={(span) => {
                          setActiveTab('document');
                          setMobileColumn('paper');
                          setActiveFindingId(finding.id);
                        }}
                      />
                    )}

                    {/* Uncertainty Signal (Information not Advice compliance) */}
                    {finding.uncertaintySignal && (
                      <UncertaintyBadge
                        signal={finding.uncertaintySignal}
                        language={language}
                      />
                    )}

                    {/* Action buttons: Read the detail & In your brief */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => {
                          setActiveFindingId(finding.id);
                          onSelectFinding(finding);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#171714] rounded hover:bg-[#2C2B26] transition-colors shadow-2xs"
                      >
                        Read the detail
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAIClause({
                            clauseNumber: finding.clauseNumber,
                            pageNumber: finding.pageNumber,
                            originalText: finding.sourceSpan?.exactQuote || finding.sourceQuote || finding.plainLanguageExplanation,
                            clauseTitle: finding.shortTitle,
                          });
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium rounded border border-[#C38A2E]/50 bg-[#F3ECD7]/60 text-[#8C621E] hover:bg-[#F3ECD7] transition-colors"
                      >
                        AI Clause Analysis
                      </button>

                      <button
                        onClick={() => onToggleBrief(finding.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 ${
                          finding.inAdvocateBrief
                            ? 'bg-[#FAF8F2] text-[#1C1C19] border-[#DDD9CE]'
                            : 'bg-white text-[#6F6D65] border-[#DDD9CE] hover:text-[#1C1C19]'
                        }`}
                      >
                        {finding.inAdvocateBrief ? (
                          <>
                            <span>In your brief</span>
                            <Check className="w-3.5 h-3.5 text-[#58735C]" />
                          </>
                        ) : (
                          <>
                            <span>Add to brief</span>
                            <Plus className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Bottom Summary Bar matching 1b-risk-report.png */}
            <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-3.5 flex items-center justify-between shadow-xs">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#1C1C19]">
                {briefCount} OF {findings.length} IN YOUR ADVOCATE BRIEF
              </span>
              <button
                onClick={onOpenAdvocateBrief}
                className="px-4 py-2 text-xs font-medium text-white bg-[#171714] rounded hover:bg-[#2C2B26] transition-colors shadow-xs"
              >
                Open the brief
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Annotation Creation / Edit Modal */}
      <AnnotationModal
        isOpen={isAnnotationModalOpen}
        onClose={() => {
          setIsAnnotationModalOpen(false);
          setEditingAnnotation(null);
        }}
        annotation={editingAnnotation}
        onSave={(savedAnno) => {
          handleSave(savedAnno);
          setIsAnnotationModalOpen(false);
          setEditingAnnotation(null);
        }}
        onDelete={(id) => {
          handleDelete(id);
          setIsAnnotationModalOpen(false);
          setEditingAnnotation(null);
        }}
        language={language}
      />

      {/* Sticky Notes & Highlights Drawer Panel */}
      <DocumentAnnotationsPanel
        isOpen={isAnnotationsPanelOpen}
        onClose={() => setIsAnnotationsPanelOpen(false)}
        annotations={currentAnnotations}
        onSelectAnnotation={(anno) => {
          setEditingAnnotation(anno);
          setIsAnnotationModalOpen(true);
        }}
        onDeleteAnnotation={handleDelete}
        onJumpToLine={handleJumpToLine}
        onOpenAdvocateBrief={onOpenAdvocateBrief}
        language={language}
      />

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
            const matched = findings.find(
              (f) => f.clauseNumber === selectedAIClause.clauseNumber
            );
            if (matched) {
              onToggleBrief(matched.id);
            }
          }}
        />
      )}
    </div>
  );
};
