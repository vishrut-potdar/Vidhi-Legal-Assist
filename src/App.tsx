/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Home,
  FileText,
  ShieldAlert,
  CheckSquare,
  HelpCircle,
  Briefcase,
} from 'lucide-react';
import {
  Language,
  Finding,
  DocumentInfo,
  MissingDocument,
  Severity,
  DocumentAnnotation,
} from './types';
import {
  initialDocumentInfo,
  initialFindings,
  missingDocumentsList,
  initialDocumentAnnotations,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { DocumentReviewView } from './components/DocumentReviewView';
import { ExplanationView } from './components/ExplanationView';
import { AdvocateBriefView } from './components/AdvocateBriefView';
import { LegalLiteracyView } from './components/LegalLiteracyView';
import { TimelineView } from './components/TimelineView';
import { DocumentHistoryView } from './components/DocumentHistoryView';
import { RiskRubricView } from './components/RiskRubricView';
import { PreSigningChecklistView } from './components/PreSigningChecklistView';
import { DisputePathwaysView } from './components/DisputePathwaysView';
import { UploadModal, AnalyzedDocumentResult } from './components/UploadModal';
import { AskQuestionModal } from './components/AskQuestionModal';
import { DownloadReportModal } from './components/DownloadReportModal';
import { PipelineViewerModal } from './components/PipelineViewerModal';
import { GeminiChatbot } from './components/GeminiChatbot';
import { HomepageView } from './components/HomepageView';
import { DocumentPage, deedPages } from './data/documentPagesData';
import { fullDocumentClauses } from './data/legalIntelligenceData';
import { FullClauseExplanation } from './types';

export interface IngestedDocument {
  id: string;
  documentInfo: DocumentInfo;
  pages: DocumentPage[];
  findings: Finding[];
  fullClauses: FullClauseExplanation[];
  missingDocs: MissingDocument[];
  summaryData?: any;
  uploadedAt: string;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('EN');
  const [currentTab, setCurrentTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('vidhi_doc_library_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return 'overview';
      }
    } catch (e) {}
    return 'home';
  });
  // Default to auto-hidden taskbar so hovering near screen edge reveals it immediately
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vidhi_taskbar_collapsed');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Document Library state - start empty or load saved user documents
  const [documentLibrary, setDocumentLibrary] = useState<IngestedDocument[]>(() => {
    try {
      const saved = localStorage.getItem('vidhi_doc_library_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load documents from localStorage', e);
    }
    // Clean initial state awaiting user's actual document
    return [];
  });

  const [activeDocId, setActiveDocId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('vidhi_active_doc_id_v3');
      if (savedId) return savedId;
    } catch (e) {}
    return '';
  });

  const activeDoc =
    documentLibrary.find((d) => d.id === activeDocId) ||
    documentLibrary[0] ||
    null;

  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>(() => {
    if (activeDoc) return activeDoc.documentInfo;
    return {
      ...initialDocumentInfo,
      title: 'No Document Loaded (Upload to begin)',
      riskVerdict: 'AWAITING UPLOAD',
      pageCount: 0,
      riskScore: 100,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    };
  });

  const [findings, setFindings] = useState<Finding[]>(() => activeDoc ? activeDoc.findings : []);
  const [currentPages, setCurrentPages] = useState<DocumentPage[]>(() => activeDoc ? activeDoc.pages : []);
  const [currentFullClauses, setCurrentFullClauses] = useState<FullClauseExplanation[]>(() => activeDoc ? activeDoc.fullClauses : []);
  const [missingDocs, setMissingDocs] = useState<MissingDocument[]>(() => activeDoc ? activeDoc.missingDocs : missingDocumentsList);
  const [currentSummaryData, setCurrentSummaryData] = useState<any>(() => activeDoc ? activeDoc.summaryData : null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vidhi_doc_library_v3', JSON.stringify(documentLibrary));
      localStorage.setItem('vidhi_active_doc_id_v3', activeDocId);
      localStorage.setItem('vidhi_taskbar_collapsed', JSON.stringify(isSidebarCollapsed));
    } catch (e) {
      console.error('Failed to save document library', e);
    }
  }, [documentLibrary, activeDocId, isSidebarCollapsed]);

  // Sync state when active document changes
  useEffect(() => {
    if (activeDoc) {
      setDocumentInfo(activeDoc.documentInfo);
      setFindings(activeDoc.findings);
      setCurrentPages(activeDoc.pages);
      setCurrentFullClauses(activeDoc.fullClauses);
      setMissingDocs(activeDoc.missingDocs);
      setCurrentSummaryData(activeDoc.summaryData);
    }
  }, [activeDocId]);

  // Switch to another document
  const handleSwitchDocument = (docId: string) => {
    const target = documentLibrary.find((d) => d.id === docId);
    if (target) {
      setActiveDocId(target.id);
      setDocumentInfo(target.documentInfo);
      setFindings(target.findings);
      setCurrentPages(target.pages);
      setCurrentFullClauses(target.fullClauses);
      setMissingDocs(target.missingDocs);
      setCurrentSummaryData(target.summaryData);
      setSelectedFinding(null);
    }
  };

  // Remove a document
  const handleRemoveDocument = (docId: string) => {
    const updated = documentLibrary.filter((d) => d.id !== docId);
    setDocumentLibrary(updated);
    if (activeDocId === docId) {
      if (updated.length > 0) {
        handleSwitchDocument(updated[0].id);
      } else {
        setActiveDocId('');
        setDocumentInfo({
          ...initialDocumentInfo,
          title: 'No Document Loaded (Upload to begin)',
          riskVerdict: 'AWAITING UPLOAD',
          pageCount: 0,
          riskScore: 100,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
        });
        setFindings([]);
        setCurrentPages([]);
        setCurrentFullClauses([]);
        setCurrentTab('home');
      }
    }
  };

  // Quick Load Sample Agreement
  const handleLoadSample = (sampleType: 'sale' | 'lease') => {
    if (sampleType === 'sale') {
      const sampleDoc: IngestedDocument = {
        id: `sample-sale-${Date.now()}`,
        documentInfo: {
          ...initialDocumentInfo,
          title: 'Draft Sale Deed (Flat Conveyance) — Kalyani Nagar',
          reviewedTimeAgo: 'Just now',
          riskVerdict: 'HIGH RISK DRAFT',
        },
        pages: deedPages,
        findings: initialFindings,
        fullClauses: fullDocumentClauses,
        missingDocs: missingDocumentsList,
        uploadedAt: 'Sample Demo',
      };
      setDocumentLibrary((prev) => [sampleDoc, ...prev]);
      setActiveDocId(sampleDoc.id);
      setDocumentInfo(sampleDoc.documentInfo);
      setFindings(sampleDoc.findings);
      setCurrentPages(sampleDoc.pages);
      setCurrentFullClauses(sampleDoc.fullClauses);
      setMissingDocs(sampleDoc.missingDocs);
      setCurrentTab('overview');
    } else {
      const sampleDoc: IngestedDocument = {
        id: `sample-lease-${Date.now()}`,
        documentInfo: {
          id: `sample-lease-${Date.now()}`,
          title: 'Residential Leave & License Agreement — Baner, Pune',
          property: 'Flat 204, B-Wing, Green Meadows, Baner, Pune',
          city: 'Pune',
          totalConsideration: '₹ 35,000 / month (Deposit ₹ 1.5 Lakhs)',
          reviewedTimeAgo: 'Just now',
          pageCount: 3,
          version: 'v1.0 (Sample Rental)',
          riskScore: 68,
          riskVerdict: 'CAUTION',
          highCount: 1,
          mediumCount: 2,
          lowCount: 1,
        },
        pages: [
          {
            pageNumber: 1,
            headerTitle: 'PAGE 1 — LEASE PREMISES & SECURITY DEPOSIT',
            lines: [
              { lineNumber: 1, clauseNumber: 1, text: 'LEAVE AND LICENSE AGREEMENT between Mr. Anand Kulkarni and Ms. Priya Deshmukh.' },
              { lineNumber: 2, clauseNumber: 1, text: 'Premises: Flat 204, B-Wing, Green Meadows, Baner, Pune 411045 for 11 months.' },
              { lineNumber: 3, clauseNumber: 2, text: 'Monthly compensation ₹ 35,000 payable on or before 5th of each calendar month.' },
              { lineNumber: 4, clauseNumber: 3, text: 'Security deposit: ₹ 1,50,000 paid via RTGS to the Licensor account.', isFlaggedFinding: true, findingId: 'f-lease-1', findingSeverity: 'HIGH', findingTitle: 'Arbitrary Security Deposit Deduction' },
              { lineNumber: 5, clauseNumber: 3, text: 'Licensor reserves unilateral right to deduct painting fee of ₹ 30,000 without bills.' },
            ],
          },
          {
            pageNumber: 2,
            headerTitle: 'PAGE 2 — INSPECTION & TERMINATION COVENANTS',
            lines: [
              { lineNumber: 6, clauseNumber: 4, text: 'Inspection: Licensor may enter premises at any hour without notice.', isFlaggedFinding: true, findingId: 'f-lease-2', findingSeverity: 'MEDIUM', findingTitle: 'Unrestricted Landlord Entry' },
              { lineNumber: 7, clauseNumber: 5, text: 'Termination: Licensor may terminate with 24 hours notice for perceived nuisance.' },
              { lineNumber: 8, clauseNumber: 5, text: 'Licensee must give 60 days notice or forfeit full security deposit.' },
            ],
          },
        ],
        findings: [
          {
            id: 'f-lease-1',
            clauseNumber: 3,
            pageNumber: 1,
            severity: 'HIGH',
            theme: 'Financial Liabilities & Deductions',
            themeScorePercent: 88,
            shortTitle: 'Arbitrary Painting & Renovation Deduction',
            plainHeadline: 'Landlord takes ₹30,000 without producing itemized repair receipts',
            sourceQuote: 'Licensor reserves unilateral right to deduct painting fee of ₹ 30,000 without bills.',
            plainLanguageExplanation: 'Under Maharashtra Rent Control Act precedents, security deposit deductions must be substantiated by actual repair invoices.',
            practicalConsequences: [
              'Licensee is guaranteed to lose ₹30,000 regardless of apartment handover condition.',
              'No right to inspect or contest inflated deduction figures.',
            ],
            advocateQuestion: 'Require a joint move-out inspection protocol with deductions strictly limited to actual bills for tenant-caused damage beyond normal wear and tear.',
            advocateWhy: 'Standard tenant protection against arbitrary forfeiture.',
            inAdvocateBrief: true,
            audioScriptEnglish: 'This clause allows the owner to unilaterally deduct 30,000 rupees without producing receipts.',
            audioScriptHindi: 'यह शर्त मकान मालिक को बिना बिल दिखाए 30,000 रुपये काटने की अनुमति देती है।',
            relatedModuleId: 'm-1',
          },
          {
            id: 'f-lease-2',
            clauseNumber: 4,
            pageNumber: 2,
            severity: 'MEDIUM',
            theme: 'Quiet Enjoyment & Privacy',
            themeScorePercent: 74,
            shortTitle: 'Unrestricted Landlord Inspection at Any Hour',
            plainHeadline: 'Owner can enter premises without prior notice or time restrictions',
            sourceQuote: 'Inspection: Licensor may enter premises at any hour without notice.',
            plainLanguageExplanation: 'Violates the statutory right to peaceful possession and quiet enjoyment during the license period.',
            practicalConsequences: ['Intrusion of privacy without warning.'],
            advocateQuestion: 'Mandate minimum 24 hours prior written notice during reasonable daytime hours (10 AM to 6 PM) for inspections.',
            advocateWhy: 'Standard statutory lease protection.',
            inAdvocateBrief: true,
            audioScriptEnglish: 'The landlord must provide prior written notice before entering the flat.',
            audioScriptHindi: 'फ्लैट में आने से पहले मालिक को 24 घंटे का नोटिस देना चाहिए।',
            relatedModuleId: 'm-2',
          },
        ],
        fullClauses: [
          {
            clauseNumber: 3,
            pageNumber: 1,
            title: 'Clause 3: Security Deposit & Deductions',
            category: 'Financial & Consideration',
            originalLegalText: 'Licensor reserves unilateral right to deduct painting fee of ₹ 30,000 without bills.',
            plainExplanation: 'Allows the owner to deduct a flat 30,000 from your deposit regardless of the actual condition of the flat.',
            buyerObligation: 'Pay 1.5 lakh deposit.',
            sellerObligation: 'Refund balance deposit within 7 days of handover.',
            riskLevel: 'HIGH',
            isFlagged: true,
          },
        ],
        missingDocs: [
          {
            id: 'md-l1',
            title: 'Police Verification / Tenant Clearance Certificate',
            importance: 'Critical',
            reason: 'Mandatory statutory requirement under Pune City Police commissionerate notification.',
            uploaded: false,
          },
        ],
        uploadedAt: 'Sample Lease',
      };
      setDocumentLibrary((prev) => [sampleDoc, ...prev]);
      setActiveDocId(sampleDoc.id);
      setDocumentInfo(sampleDoc.documentInfo);
      setFindings(sampleDoc.findings);
      setCurrentPages(sampleDoc.pages);
      setCurrentFullClauses(sampleDoc.fullClauses);
      setMissingDocs(sampleDoc.missingDocs);
      setCurrentTab('overview');
    }
  };

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAskOpen, setIsAskOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [chatbotInitialQuestion, setChatbotInitialQuestion] = useState<string>('');
  const [isDownloadReportOpen, setIsDownloadReportOpen] = useState<boolean>(false);
  const [isPipelineViewerOpen, setIsPipelineViewerOpen] = useState<boolean>(false);
  const [askInitialQuery, setAskInitialQuery] = useState<string>('');
  const [selectedLearnModuleId, setSelectedLearnModuleId] = useState<string | undefined>(undefined);
  const [reviewSeverityFilter, setReviewSeverityFilter] = useState<'ALL' | Severity>('ALL');

  // Personal Sticky Notes & Highlights state saved locally
  const [annotations, setAnnotations] = useState<DocumentAnnotation[]>(() => {
    try {
      const saved = localStorage.getItem('vidhi_annotations_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load annotations from localStorage', e);
    }
    return initialDocumentAnnotations;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vidhi_annotations_v1', JSON.stringify(annotations));
    } catch (e) {
      console.error('Failed to save annotations to localStorage', e);
    }
  }, [annotations]);

  const handleSaveAnnotation = (annotation: DocumentAnnotation) => {
    setAnnotations((prev) => {
      const idx = prev.findIndex((a) => a.id === annotation.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = annotation;
        return updated;
      }
      return [annotation, ...prev];
    });
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  // Toggle finding in advocate brief
  const handleToggleBrief = (findingId: string) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === findingId ? { ...f, inAdvocateBrief: !f.inAdvocateBrief } : f
      )
    );
  };

  // Toggle missing document check
  const handleToggleMissingDoc = (id: string) => {
    setMissingDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, uploaded: !d.uploaded } : d))
    );
  };

  // Open explanation view for a specific clause finding
  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setCurrentTab('explanation');
  };

  // Real Upload Document Success Handler
  const handleUploadSuccess = (analyzedDoc: AnalyzedDocumentResult) => {
    const newDoc: IngestedDocument = {
      id: analyzedDoc.id,
      documentInfo: analyzedDoc.documentInfo,
      pages: analyzedDoc.pages,
      findings: analyzedDoc.findings,
      fullClauses: analyzedDoc.fullClauses,
      missingDocs: analyzedDoc.missingDocuments,
      summaryData: analyzedDoc.summaryData,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDocumentLibrary((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    setActiveDocId(newDoc.id);
    setDocumentInfo(newDoc.documentInfo);
    setFindings(newDoc.findings);
    setMissingDocs(newDoc.missingDocs);
    setCurrentPages(newDoc.pages);
    setCurrentFullClauses(newDoc.fullClauses);
    setCurrentSummaryData(newDoc.summaryData);
    setSelectedFinding(null);
    setCurrentTab('overview');
  };

  const handleOpenAskQuestion = (initialQuery?: string) => {
    setAskInitialQuery(initialQuery || '');
    setIsAskOpen(true);
  };

  const advocateBriefCount = findings.filter((f) => f.inAdvocateBrief).length;

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C1C19] flex flex-col md:flex-row antialiased">
      {/* Mobile Top App Bar (Hidden on md+) */}
      <header className="md:hidden bg-[#161513] text-[#FAF8F5] px-4 py-2.5 flex items-center justify-between border-b border-[#262420] sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 -ml-1 text-[#A8A49A] hover:text-white rounded"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-[#FAF8F5] leading-none">
              VIDHI
            </h1>
            <p className="text-[8px] tracking-widest text-[#8C887B] font-mono uppercase">
              LEGAL INTELLIGENCE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Trilingual Switcher */}
          <div className="flex items-center gap-0.5 text-[11px] font-mono bg-[#22201C] px-1.5 py-0.5 rounded border border-[#33302A]">
            <button
              onClick={() => setLanguage('EN')}
              className={`px-1 rounded ${
                language === 'EN' ? 'bg-[#FAF8F5] text-[#171714] font-bold' : 'text-[#8C887B]'
              }`}
            >
              EN
            </button>
            <span className="text-[#444]">/</span>
            <button
              onClick={() => setLanguage('HI')}
              className={`px-1 rounded ${
                language === 'HI' ? 'bg-[#FAF8F5] text-[#171714] font-bold' : 'text-[#8C887B]'
              }`}
            >
              HI
            </button>
            <span className="text-[#444]">/</span>
            <button
              onClick={() => setLanguage('MR')}
              className={`px-1 rounded ${
                language === 'MR' ? 'bg-[#FAF8F5] text-[#171714] font-bold' : 'text-[#8C887B]'
              }`}
            >
              MR
            </button>
          </div>

          <button
            onClick={() => handleOpenAskQuestion()}
            className="bg-[#C38A2E] text-[#161513] font-medium text-xs px-2.5 py-1 rounded"
          >
            Ask Deed
          </button>
        </div>
      </header>

      {/* Collapsible Sidebar / Taskbar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'ask') {
            handleOpenAskQuestion();
          } else {
            setCurrentTab(tab);
          }
        }}
        language={language}
        onLanguageChange={setLanguage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenUpload={() => setCurrentTab('home')}
        onOpenAskQuestion={() => handleOpenAskQuestion()}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenPipelineViewer={() => setIsPipelineViewerOpen(true)}
        advocateBriefCount={advocateBriefCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        activeDocTitle={activeDoc ? activeDoc.documentInfo.title : undefined}
        hasActiveDoc={documentLibrary.length > 0 && !!activeDoc}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Floating App Bar (Desktop: Shows when taskbar is auto-hidden) */}
        {isSidebarCollapsed && (
          <header className="hidden md:flex items-center justify-between px-6 py-2.5 bg-[#FCFBF7] border-b border-[#DDD9CE] sticky top-0 z-20 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#8C887B] flex items-center gap-1.5 bg-[#F4F1EA] px-2.5 py-1 rounded border border-[#E4DFD3]">
                <span className="w-2 h-2 rounded-full bg-[#C38A2E] animate-pulse" />
                <span>Move cursor to left screen edge to open taskbar</span>
              </span>
              <span className="text-[#DDD9CE]">·</span>
              <span className="text-xs font-serif font-medium text-[#1C1C19] truncate max-w-md">
                {activeDoc ? activeDoc.documentInfo.title : 'Ready for Document Scrutiny & OCR'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('home')}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#171714] rounded hover:bg-[#2C2B26] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Upload / OCR Document</span>
              </button>
              <button
                onClick={() => handleOpenAskQuestion()}
                className="px-3 py-1.5 text-xs font-medium text-[#1C1C19] bg-white border border-[#DDD9CE] rounded hover:bg-[#F7F4EC] transition-colors shadow-2xs cursor-pointer"
              >
                Ask Deed
              </button>
            </div>
          </header>
        )}

        {/* Main Workspace Content Area */}
        <main
          className={`flex-1 p-4 sm:p-6 md:p-8 w-full overflow-y-auto transition-all duration-300 pb-24 md:pb-8 ${
            isSidebarCollapsed ? 'max-w-[1600px] mx-auto' : 'max-w-7xl mx-auto'
          }`}
        >
          {/* If on home tab or if no documents are uploaded yet, display the Homepage & OCR Hub */}
          {currentTab === 'home' || documentLibrary.length === 0 ? (
            <HomepageView
              language={language}
              onAnalysisSuccess={handleUploadSuccess}
              onLoadSample={handleLoadSample}
              hasActiveDoc={documentLibrary.length > 0 && !!activeDoc}
              activeDocTitle={activeDoc ? activeDoc.documentInfo.title : undefined}
              onGoToOverview={() => setCurrentTab('overview')}
            />
          ) : (
            <>
              {currentTab === 'overview' && (
                <OverviewView
                  documentInfo={documentInfo}
                  findings={findings}
                  language={language}
                  documentLibrary={documentLibrary}
                  activeDocId={activeDocId}
                  onSwitchDocument={handleSwitchDocument}
                  onRemoveDocument={handleRemoveDocument}
                  onOpenReport={(severity) => {
                    setReviewSeverityFilter(severity || 'ALL');
                    setCurrentTab('documents');
                  }}
                  onOpenBrief={() => setCurrentTab('brief')}
                  onOpenLearn={(moduleId) => {
                    setSelectedLearnModuleId(moduleId);
                    setCurrentTab('learn');
                  }}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onOpenAskQuestion={handleOpenAskQuestion}
                  onOpenDownloadReport={() => setIsDownloadReportOpen(true)}
                  onOpenPipelineViewer={() => setIsPipelineViewerOpen(true)}
                  onOpenHistory={() => setCurrentTab('history')}
                  onOpenRubric={() => setCurrentTab('rubric')}
                  onOpenChecklist={() => setCurrentTab('checklist')}
                  onOpenPathways={() => setCurrentTab('pathways')}
                  missingDocs={missingDocs}
                  onToggleMissingDoc={handleToggleMissingDoc}
                />
              )}

              {currentTab === 'documents' && (
                <DocumentReviewView
                  documentInfo={documentInfo}
                  findings={findings}
                  pages={currentPages}
                  clauses={currentFullClauses}
                  language={language}
                  onLanguageChange={setLanguage}
                  onSelectFinding={handleSelectFinding}
                  onOpenAdvocateBrief={() => setCurrentTab('brief')}
                  onToggleBrief={handleToggleBrief}
                  onOpenDownloadReport={() => setIsDownloadReportOpen(true)}
                  onOpenHistory={() => setCurrentTab('history')}
                  initialSeverityFilter={reviewSeverityFilter}
                  annotations={annotations}
                  onSaveAnnotation={handleSaveAnnotation}
                  onDeleteAnnotation={handleDeleteAnnotation}
                />
              )}

              {currentTab === 'rubric' && (
                <RiskRubricView
                  language={language}
                  onOpenReport={() => setCurrentTab('documents')}
                  onOpenBrief={() => setCurrentTab('brief')}
                  onOpenChecklist={() => setCurrentTab('checklist')}
                />
              )}

              {currentTab === 'checklist' && (
                <PreSigningChecklistView
                  documentInfo={documentInfo}
                  language={language}
                  onOpenReport={() => setCurrentTab('documents')}
                  onOpenBrief={() => setCurrentTab('brief')}
                />
              )}

              {currentTab === 'pathways' && (
                <DisputePathwaysView
                  language={language}
                  onBackToReport={() => setCurrentTab('documents')}
                  onOpenAdvocateBrief={() => setCurrentTab('brief')}
                />
              )}

              {currentTab === 'history' && (
                <DocumentHistoryView
                  documentInfo={documentInfo}
                  language={language}
                  onBackToOverview={() => setCurrentTab('overview')}
                  onOpenReport={() => setCurrentTab('documents')}
                  onOpenBrief={() => setCurrentTab('brief')}
                  onOpenUploadNewVersion={() => setIsUploadOpen(true)}
                />
              )}

              {currentTab === 'explanation' && selectedFinding && (
                <ExplanationView
                  finding={selectedFinding}
                  allFindings={findings}
                  language={language}
                  onBackToReport={() => setCurrentTab('documents')}
                  onSelectFinding={setSelectedFinding}
                  onToggleBrief={handleToggleBrief}
                  onOpenLearnModule={(moduleId) => {
                    setSelectedLearnModuleId(moduleId);
                    setCurrentTab('learn');
                  }}
                />
              )}

              {currentTab === 'brief' && (
                <AdvocateBriefView
                  documentInfo={documentInfo}
                  findings={findings}
                  language={language}
                  onBack={() => setCurrentTab('documents')}
                  onToggleBrief={handleToggleBrief}
                  annotations={annotations}
                />
              )}

              {currentTab === 'learn' && (
                <LegalLiteracyView
                  language={language}
                  onBackToReport={() => setCurrentTab('documents')}
                  selectedModuleId={selectedLearnModuleId}
                />
              )}

              {currentTab === 'timeline' && (
                <TimelineView
                  documentInfo={documentInfo}
                  language={language}
                  onOpenReport={() => setCurrentTab('documents')}
                  onOpenBrief={() => setCurrentTab('brief')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on md+) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#161513] text-[#FAF8F5] border-t border-[#262420] z-30 flex items-center justify-around py-2 px-1 backdrop-blur-md">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 rounded transition-colors ${
            currentTab === 'overview' ? 'text-[#C38A2E] font-medium' : 'text-[#8C887B]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('documents')}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 rounded transition-colors ${
            currentTab === 'documents' ? 'text-[#C38A2E] font-medium' : 'text-[#8C887B]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Deed</span>
        </button>

        <button
          onClick={() => setCurrentTab('rubric')}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 rounded transition-colors ${
            currentTab === 'rubric' ? 'text-[#C38A2E] font-medium' : 'text-[#8C887B]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Red Flags</span>
        </button>

        <button
          onClick={() => setCurrentTab('checklist')}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 rounded transition-colors ${
            currentTab === 'checklist' ? 'text-[#C38A2E] font-medium' : 'text-[#8C887B]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Checklist</span>
        </button>

        <button
          onClick={() => handleOpenAskQuestion()}
          className="flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 text-[#C38A2E] font-medium"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Q&amp;A</span>
        </button>
      </nav>

      {/* Global Upload & Document Scanning Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        language={language}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Global Citizen Ask Question Modal */}
      <AskQuestionModal
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        language={language}
        initialQuery={askInitialQuery}
      />

      {/* Global Download Report Modal */}
      <DownloadReportModal
        isOpen={isDownloadReportOpen}
        onClose={() => setIsDownloadReportOpen(false)}
        documentInfo={documentInfo}
        findings={findings}
        missingDocs={missingDocs}
        language={language}
      />

      {/* Backend Architecture & AI Pipeline Inspector Modal */}
      <PipelineViewerModal
        isOpen={isPipelineViewerOpen}
        onClose={() => setIsPipelineViewerOpen(false)}
        language={language}
      />

      {/* Multi-Turn Gemini AI Legal Chatbot */}
      <GeminiChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        initialQuestion={chatbotInitialQuestion}
        documentContext="Flat 402 Kalyani Nagar Sale Deed (18 pages), Consideration: ₹86 Lakhs. Critical issues: Outstanding SBI mortgage without foreclosure release, unspecific possession timeline, 12-month defect liability."
        onAddQuestionToBrief={(q) => {
          // Add custom question or finding to advocate brief
          setFindings((prev) => [
            {
              id: `custom-ai-${Date.now()}`,
              clauseNumber: 0,
              pageNumber: 0,
              severity: 'HIGH',
              theme: 'AI Question from Vidhi Chat',
              themeScorePercent: 90,
              shortTitle: 'Query from Gemini AI Chat',
              plainHeadline: q.slice(0, 80) + '...',
              sourceQuote: q,
              plainLanguageExplanation: q,
              practicalConsequences: ['Clarify directly with advocate prior to registration.'],
              advocateQuestion: q,
              advocateWhy: 'Formulated during Gemini AI legal scrutiny.',
              inAdvocateBrief: true,
              audioScriptHindi: '',
              audioScriptEnglish: '',
              relatedModuleId: 'm-1',
            },
            ...prev,
          ]);
        }}
      />

      {/* Floating Gemini AI Chat Trigger Button (Subtle, elegant, non-intrusive) */}
      {!isChatbotOpen && (
        <button
          onClick={() => {
            setChatbotInitialQuestion('');
            setIsChatbotOpen(true);
          }}
          className="fixed bottom-5 right-5 z-40 px-3.5 py-2.5 rounded-full bg-[#161513] text-[#FAF8F5] border border-[#3A3831] shadow-xl hover:bg-[#282622] transition-all flex items-center gap-2 text-xs font-medium cursor-pointer"
          title="Chat with Vidhi AI Legal Counsel"
          aria-label="Open Vidhi AI Legal Counsel"
        >
          <span className="w-2 h-2 rounded-full bg-[#58735C] ring-2 ring-[#58735C]/30 animate-pulse" />
          <span className="font-serif tracking-wide">Ask Vidhi AI</span>
          <span className="text-[10px] font-mono text-[#C38A2E] bg-[#2E2C27] px-1.5 py-0.5 rounded">
            Gemini
          </span>
        </button>
      )}
    </div>
  );
}
