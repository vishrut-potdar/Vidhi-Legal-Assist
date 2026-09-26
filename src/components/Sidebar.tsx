import React from 'react';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  GraduationCap,
  CalendarClock,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
} from 'lucide-react';
import { Language } from '../types';
import { uiTranslations } from '../data/mockData';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenPipelineViewer: () => void;
  advocateBriefCount: number;
  onOpenUpload?: () => void;
  onOpenAskQuestion?: () => void;
  onOpenChatbot?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageChange,
  isCollapsed,
  onToggleCollapse,
  onOpenPipelineViewer,
  advocateBriefCount,
  onOpenUpload,
  onOpenAskQuestion,
  onOpenChatbot,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const t = uiTranslations[language];

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      badge: null,
    },
    {
      id: 'documents',
      label: 'Document & Clauses',
      badge: null,
    },
    {
      id: 'rubric',
      label: 'Red-Flag Rubric (16)',
      badge: '16',
    },
    {
      id: 'checklist',
      label: 'Pre-Signing Checklist',
      badge: null,
    },
    {
      id: 'history',
      label: 'Version Comparison',
      badge: null,
    },
    {
      id: 'pathways',
      label: 'Dispute Pathways',
      badge: null,
    },
    {
      id: 'brief',
      label: 'Advocate Brief',
      badge: advocateBriefCount > 0 ? advocateBriefCount.toString() : null,
    },
    {
      id: 'learn',
      label: 'Legal Literacy',
      badge: null,
    },
    {
      id: 'ask',
      label: 'Grounded Q&A',
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-[#161513] text-[#FAF8F5] flex flex-col justify-between h-screen border-r border-[#262420] transition-all duration-300 font-sans ${
          /* Desktop sticky sidebar */
          'hidden md:flex md:sticky md:top-0 md:z-30 shrink-0'
        } ${isCollapsed ? 'md:w-16' : 'md:w-64'} ${
          /* Mobile Drawer */
          mobileOpen
            ? '!flex fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left'
            : ''
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="p-5 pb-4 border-b border-[#262420]">
            <div className="flex items-start justify-between">
              {!isCollapsed || mobileOpen ? (
                <div className="space-y-1">
                  <h1 className="font-serif text-2xl tracking-[0.08em] text-[#FAF8F5] font-normal leading-none">
                    VIDHI
                  </h1>
                  <p className="text-[9px] tracking-[0.18em] text-[#8C887B] font-mono uppercase font-medium">
                    DOCUMENT REVIEW &amp; LEGAL LITERACY
                  </p>
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <span className="font-serif text-lg tracking-wider text-[#FAF8F5] font-semibold">
                    V
                  </span>
                </div>
              )}

              {mobileOpen ? (
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded text-[#8C887B] hover:text-[#FAF8F5] hover:bg-[#282622] transition-colors shrink-0 md:hidden"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              ) : (
                <button
                  onClick={onToggleCollapse}
                  className="p-1 rounded text-[#8C887B] hover:text-[#FAF8F5] hover:bg-[#282622] transition-colors shrink-0 hidden md:block"
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center rounded-md text-xs font-normal transition-all text-left ${
                  isCollapsed
                    ? 'justify-center p-2.5'
                    : 'justify-between px-3.5 py-2'
                } ${
                  isActive
                    ? 'bg-[#282622] text-[#FAF8F5] font-medium'
                    : 'text-[#A8A49A] hover:text-[#FAF8F5] hover:bg-[#201F1B]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-base leading-none select-none ${isActive ? 'text-[#FAF8F5]' : 'text-[#7A766E]'}`}>
                    •
                  </span>
                  {!isCollapsed && (
                    <span className="tracking-wide text-[13px]">{item.label}</span>
                  )}
                </div>
                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    item.id === 'brief'
                      ? 'bg-[#B44738] text-white'
                      : 'bg-[#2E2C27] text-[#C38A2E]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Quick Brief, AI Pipeline, Language Selector & Profile */}
      <div className="p-4 border-t border-[#262420] space-y-3">
        {/* Gemini Chatbot Trigger */}
        {onOpenChatbot && (!isCollapsed ? (
          <button
            onClick={onOpenChatbot}
            className="w-full flex items-center justify-between px-3 py-2 rounded border border-[#C38A2E]/50 bg-[#232019] text-xs text-[#E8C274] hover:bg-[#2C271E] transition-all font-medium shadow-xs"
            title="Open Gemini AI Legal Assistant Chat"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#58735C]" />
              <span>Vidhi AI Chat</span>
            </div>
            <span className="text-[10px] bg-[#C38A2E]/20 text-[#E8C274] px-1.5 py-0.5 rounded font-mono">
              Gemini 3.8
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenChatbot}
            className="w-full flex items-center justify-center p-2 rounded border border-[#C38A2E]/50 bg-[#232019] text-[#E8C274]"
            title="Open Vidhi AI Chat"
          >
            <span className="font-mono text-xs font-bold">AI</span>
          </button>
        ))}

        {/* Backend Pipeline Architecture Trigger */}
        {!isCollapsed ? (
          <button
            onClick={onOpenPipelineViewer}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded border border-[#2E2C27] bg-[#1E1D19] text-[11px] text-[#C38A2E] hover:border-[#C38A2E]/40 transition-all font-mono"
            title="Inspect Backend AI Processing Architecture & Pipeline Trace"
          >
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Pipeline Trace</span>
            </div>
            <span className="text-[9px] bg-[#C38A2E]/20 text-[#C38A2E] px-1.5 py-0.5 rounded">
              Active
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenPipelineViewer}
            className="w-full flex items-center justify-center p-2 rounded border border-[#2E2C27] bg-[#1E1D19] text-[#C38A2E]"
            title="AI Pipeline Trace"
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Language Segmented Control */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between bg-[#1D1C18] border border-[#2A2823] p-1 rounded-md">
            {(['EN', 'HI', 'MR'] as Language[]).map((lang) => {
              const active = language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`flex-1 py-1 text-xs text-center rounded transition-all ${
                    active
                      ? 'bg-[#FAF8F5] text-[#171714] font-semibold shadow-xs'
                      : 'text-[#9A968D] hover:text-[#FAF8F5]'
                  }`}
                >
                  {lang === 'EN' ? 'EN' : lang === 'HI' ? 'हिंदी' : 'मराठी'}
                </button>
              );
            })}
          </div>
        ) : (
          <button
            onClick={() =>
              onLanguageChange(
                language === 'EN' ? 'HI' : language === 'HI' ? 'MR' : 'EN'
              )
            }
            className="w-full py-1 text-[10px] font-mono text-[#FAF8F5] bg-[#22211C] border border-[#2A2823] rounded text-center"
            title="Switch Language"
          >
            {language}
          </button>
        )}

        {/* User Profile */}
        <div className={`flex items-center gap-3 pt-1 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[#C38A2E] text-[#171714] font-bold text-xs flex items-center justify-center shrink-0 select-none">
            RM
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-[#FAF8F5] leading-tight">
                Rohan Mehta
              </p>
              <p className="text-[10px] text-[#8C887B] tracking-wider uppercase font-mono mt-0.5">
                PUNE, MH
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};
