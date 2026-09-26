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
import { UploadModal } from './components/UploadModal';
import { AskQuestionModal } from './components/AskQuestionModal';
import { DownloadReportModal } from './components/DownloadReportModal';
import { PipelineViewerModal } from './components/PipelineViewerModal';
import { GeminiChatbot } from './components/GeminiChatbot';

export default function App() {
  const [language, setLanguage] = useState<Language>('EN');
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>(initialDocumentInfo);
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [missingDocs, setMissingDocs] = useState<MissingDocument[]>(missingDocumentsList);
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

  // Upload new document success handler
  const handleUploadSuccess = (docTitle: string) => {
    setDocumentInfo((prev) => ({
      ...prev,
      title: docTitle,
      reviewedTimeAgo: 'Just now',
    }));
    setCurrentTab('documents');
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

      {/* Collapsible Sidebar */}
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
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAskQuestion={() => handleOpenAskQuestion()}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenPipelineViewer={() => setIsPipelineViewerOpen(true)}
        advocateBriefCount={advocateBriefCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Content Area - expands when sidebar is collapsed */}
      <main
        className={`flex-1 p-4 sm:p-6 md:p-8 w-full overflow-y-auto transition-all duration-300 pb-24 md:pb-8 ${
          isSidebarCollapsed ? 'max-w-[1600px] mx-auto' : 'max-w-7xl mx-auto'
        }`}
      >
        {currentTab === 'overview' && (
          <OverviewView
            documentInfo={documentInfo}
            findings={findings}
            language={language}
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
      </main>

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
