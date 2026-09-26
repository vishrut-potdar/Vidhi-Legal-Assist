import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  LayoutDashboard,
  FileText,
  ShieldAlert,
  CheckSquare,
  History,
  Scale,
  Briefcase,
  GraduationCap,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  PinOff,
  Cpu,
  Trash2,
  LogOut,
} from 'lucide-react';
import { Language } from '../types';
import { uiTranslations } from '../data/mockData';
import { ReadingLevelToggle } from './ReadingLevelToggle';

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
  activeDocTitle?: string;
  hasActiveDoc?: boolean;
  onClearData?: () => void;
  signedInEmail?: string;
  onSignOut?: () => void;
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
  activeDocTitle,
  hasActiveDoc = false,
  onClearData,
  signedInEmail,
  onSignOut,
}) => {
  const t = uiTranslations[language];
  const [isHoverExpanded, setIsHoverExpanded] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(!isCollapsed);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Escape closes the mobile navigation drawer
  useEffect(() => {
    if (!mobileOpen || !onCloseMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  // Sync external collapse changes
  useEffect(() => {
    setIsPinned(!isCollapsed);
  }, [isCollapsed]);

  // Global screen-edge hover detector
  // Opens the taskbar when cursor is within 25px of the left edge of the screen
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // If taskbar is pinned, no hover toggle needed
      if (isPinned) return;

      // Trigger zone: near the left edge of the screen
      if (e.clientX <= 25) {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        setIsHoverExpanded(true);
      } else if (e.clientX > 280) {
        // Cursor moved away from taskbar area
        if (isHoverExpanded && !hoverTimeoutRef.current) {
          hoverTimeoutRef.current = setTimeout(() => {
            setIsHoverExpanded(false);
            hoverTimeoutRef.current = null;
          }, 320);
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isPinned, isHoverExpanded]);

  // Handle edge & sidebar hover enter
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!isPinned) {
      setIsHoverExpanded(true);
    }
  };

  // Handle edge & sidebar hover leave
  const handleMouseLeave = () => {
    if (!isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoverExpanded(false);
        hoverTimeoutRef.current = null;
      }, 320);
    }
  };

  // Toggle pinning
  const togglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    if (!nextPinned) {
      if (!isCollapsed) onToggleCollapse();
    } else {
      if (isCollapsed) onToggleCollapse();
      setIsHoverExpanded(false);
    }
  };

  // Effectively expanded if pinned OR if hover-expanded
  const isEffectivelyExpanded = isPinned || isHoverExpanded;

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    if (onCloseMobile) onCloseMobile();
    if (!isPinned) setIsHoverExpanded(false);
  };

  const documentNavItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'documents',
      label: 'Document & Clauses',
      icon: FileText,
      badge: null,
    },
    {
      id: 'rubric',
      label: 'Red-Flag Rubric (16)',
      icon: ShieldAlert,
      badge: '16',
    },
    {
      id: 'checklist',
      label: 'Pre-Signing Checklist',
      icon: CheckSquare,
      badge: null,
    },
    {
      id: 'history',
      label: 'Version Comparison',
      icon: History,
      badge: null,
    },
    {
      id: 'pathways',
      label: 'Dispute Pathways',
      icon: Scale,
      badge: null,
    },
    {
      id: 'brief',
      label: 'Advocate Brief',
      icon: Briefcase,
      badge: advocateBriefCount > 0 ? advocateBriefCount.toString() : null,
    },
    {
      id: 'learn',
      label: 'Legal Literacy',
      icon: GraduationCap,
      badge: null,
    },
    {
      id: 'ask',
      label: 'Grounded Q&A',
      icon: HelpCircle,
      badge: null,
    },
  ];

  return (
    <>
      {/* Screen Edge Hover Sensor (Active when taskbar is auto-hidden/unpinned) */}
      {!isPinned && (
        <div
          className="hidden md:flex fixed left-0 top-0 bottom-0 w-6 z-40 bg-transparent hover:bg-[#C38A2E]/10 transition-all cursor-pointer items-center justify-start group/edge select-none"
          onMouseEnter={handleMouseEnter}
          title="Hover cursor near screen edge to open taskbar"
        >
          <div className="w-1.5 h-24 rounded-r-md bg-[#C38A2E]/40 group-hover/edge:bg-[#C38A2E] group-hover/edge:w-2 transition-all shadow-[0_0_12px_rgba(195,138,46,0.6)] flex items-center justify-center">
            <div className="w-0.5 h-6 bg-white/60 rounded-full" />
          </div>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Vidhi navigation"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`bg-[#161513] text-[#FAF8F5] flex flex-col justify-between h-screen border-r border-[#262420] transition-all duration-300 ease-out font-sans ${
          /* Desktop sticky vs overlay */
          !isPinned && isHoverExpanded
            ? 'hidden md:flex fixed inset-y-0 left-0 z-50 w-64 shadow-2xl animate-in slide-in-from-left duration-200'
            : isEffectivelyExpanded
            ? 'hidden md:flex md:sticky md:top-0 md:z-30 shrink-0 md:w-64'
            : 'hidden md:flex md:sticky md:top-0 md:z-30 shrink-0 md:w-16'
        } ${
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
              {isEffectivelyExpanded || mobileOpen ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-2xl tracking-[0.08em] text-[#FAF8F5] font-normal leading-none">
                      VIDHI
                    </h1>
                    {!isPinned && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C38A2E]/20 text-[#C38A2E] border border-[#C38A2E]/30">
                        Auto-Hide
                      </span>
                    )}
                  </div>
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
                <div className="hidden md:flex items-center gap-1">
                  {/* Pin / Auto-Hide Toggle */}
                  <button aria-label="Keep taskbar pinned open" aria-pressed={isPinned}
                    onClick={togglePin}
                    className={`p-1.5 rounded transition-colors ${
                      isPinned
                        ? 'text-[#C38A2E] hover:bg-[#282622]'
                        : 'text-[#8C887B] hover:text-[#FAF8F5] hover:bg-[#282622]'
                    }`}
                    title={
                      isPinned
                        ? 'Taskbar is Pinned (click to enable Auto-Hide on edge hover)'
                        : 'Auto-Hide Active (click to Pin open)'
                    }
                  >
                    {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Collapse Toggle */}
                  <button aria-label={isCollapsed ? 'Expand taskbar' : 'Collapse taskbar'}
                    onClick={onToggleCollapse}
                    className="p-1.5 rounded text-[#8C887B] hover:text-[#FAF8F5] hover:bg-[#282622] transition-colors shrink-0"
                    title={isCollapsed ? 'Expand taskbar' : 'Collapse taskbar'}
                  >
                    {isCollapsed ? (
                      <PanelLeftOpen className="w-3.5 h-3.5" />
                    ) : (
                      <PanelLeftClose className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Document Card in Taskbar */}
          {activeDocTitle && (
            <div className="px-3 pt-3 pb-1">
              {isEffectivelyExpanded ? (
                <div className="p-2.5 rounded-lg bg-[#1E1D19] border border-[#2D2A24] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8C887B]">
                    <span className="uppercase tracking-wider">ACTIVE DOCUMENT</span>
                    {onOpenUpload && (
                      <button
                        onClick={() => {
                          onOpenUpload();
                          if (!isPinned) setIsHoverExpanded(false);
                        }}
                        className="text-[#C38A2E] hover:underline cursor-pointer"
                      >
                        + New
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#FAF8F5] font-serif truncate font-medium" title={activeDocTitle}>
                    {activeDocTitle}
                  </p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button aria-label={`Active document: ${activeDocTitle}. Upload a new document`}
                    onClick={() => {
                      onOpenUpload?.();
                      if (!isPinned) setIsHoverExpanded(false);
                    }}
                    className="p-2 rounded bg-[#1E1D19] text-[#C38A2E] hover:bg-[#2A2823] border border-[#2D2A24]"
                    title={`Active: ${activeDocTitle} (Click to upload new)`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

        {/* Navigation Links */}
        <nav aria-label="Workspace" className="p-3 space-y-1">
          {/* Primary Home / Upload & OCR Button */}
          <button aria-current={currentTab === 'home' ? 'page' : undefined}
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center rounded-md text-xs transition-all text-left ${
              !isEffectivelyExpanded
                ? 'justify-center p-2.5'
                : 'justify-between px-3.5 py-2.5'
            } ${
              currentTab === 'home'
                ? 'bg-[#C38A2E]/20 text-[#E8C274] font-medium border border-[#C38A2E]/40 shadow-2xs'
                : 'text-[#FAF8F5] hover:bg-[#201F1B]'
            }`}
            title="Homepage / Upload & OCR"
          >
            <div className="flex items-center gap-2.5">
              <Home className={`w-4 h-4 shrink-0 ${currentTab === 'home' ? 'text-[#C38A2E]' : 'text-[#A8A49A]'}`} />
              {isEffectivelyExpanded && (
                <span className="tracking-wide text-[13px] font-medium">Home (Upload &amp; OCR)</span>
              )}
            </div>
            {isEffectivelyExpanded && !hasActiveDoc && (
              <span className="text-[9px] font-mono bg-[#C38A2E] text-[#161513] font-bold px-1.5 py-0.5 rounded">
                START
              </span>
            )}
          </button>

          {/* After uploading, add the other options */}
          {hasActiveDoc && (
            <div className="pt-2 space-y-1">
              {isEffectivelyExpanded && (
                <div className="px-3 pt-1 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8C887B]">
                  DOCUMENT ANALYSIS
                </div>
              )}
              {documentNavItems.map((item) => {
                const isActive = currentTab === item.id;
                const IconComponent = item.icon;
                return (
                  <button aria-current={isActive ? 'page' : undefined}
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center rounded-md text-xs transition-all text-left ${
                      !isEffectivelyExpanded
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3.5 py-2'
                    } ${
                      isActive
                        ? 'bg-[#282622] text-[#FAF8F5] font-medium'
                        : 'text-[#A8A49A] hover:text-[#FAF8F5] hover:bg-[#201F1B]'
                    }`}
                    title={!isEffectivelyExpanded ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#C38A2E]' : 'text-[#8C887B]'
                        }`}
                      />
                      {isEffectivelyExpanded && (
                        <span className="tracking-wide text-[13px] truncate">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {isEffectivelyExpanded && item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          item.id === 'brief'
                            ? 'bg-[#B44738] text-white'
                            : 'bg-[#2E2C27] text-[#C38A2E]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* Footer Area: Quick Brief, AI Pipeline, Language Selector & Profile */}
      <div className="p-4 border-t border-[#262420] space-y-3">
        {/* Gemini Chatbot Trigger */}
        {onOpenChatbot && (isEffectivelyExpanded ? (
          <button
            onClick={() => {
              onOpenChatbot();
              if (!isPinned) setIsHoverExpanded(false);
            }}
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
            onClick={() => {
              onOpenChatbot();
              if (!isPinned) setIsHoverExpanded(false);
            }}
            className="w-full flex items-center justify-center p-2 rounded border border-[#C38A2E]/50 bg-[#232019] text-[#E8C274]"
            title="Open Vidhi AI Chat"
          >
            <span className="font-mono text-xs font-bold">AI</span>
          </button>
        ))}

        {/* Backend Pipeline Architecture Trigger */}
        {isEffectivelyExpanded ? (
          <button
            onClick={() => {
              onOpenPipelineViewer();
              if (!isPinned) setIsHoverExpanded(false);
            }}
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
          <button aria-label="AI Pipeline Trace"
            onClick={() => {
              onOpenPipelineViewer();
              if (!isPinned) setIsHoverExpanded(false);
            }}
            className="w-full flex items-center justify-center p-2 rounded border border-[#2E2C27] bg-[#1E1D19] text-[#C38A2E]"
            title="AI Pipeline Trace"
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Language Segmented Control */}
        {isEffectivelyExpanded ? (
          <div className="space-y-2">
          <div role="group" aria-label="Language" className="flex items-center justify-between bg-[#1D1C18] border border-[#2A2823] p-1 rounded-md">
            {(['EN', 'HI', 'MR'] as Language[]).map((lang) => {
              const active = language === lang;
              return (
                <button
                  key={lang}
                  aria-pressed={active}
                  lang={lang === 'EN' ? 'en' : lang === 'HI' ? 'hi' : 'mr'}
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
          <ReadingLevelToggle variant="dark" language={language} />
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
            aria-label={`Language: ${language}. Press to switch`}
          >
            {language}
          </button>
        )}

        {/* Clear all session data */}
        {onClearData &&
          (isEffectivelyExpanded ? (
            <button
              type="button"
              onClick={onClearData}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-xs rounded-md border border-[#4A2E2A] text-[#E7B4AB] hover:bg-[#2A1C1A] hover:text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'HI' ? 'मेरा डेटा मिटाएं' : language === 'MR' ? 'माझा डेटा पुसा' : 'Clear my data'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClearData}
              className="w-full flex items-center justify-center p-2 rounded border border-[#4A2E2A] text-[#E7B4AB] hover:bg-[#2A1C1A]"
              title="Clear my data"
              aria-label="Clear my data"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ))}

        {/* Signed-in account */}
        <div className={`flex items-center gap-3 pt-1 ${!isEffectivelyExpanded ? 'flex-col justify-center' : ''}`}>
          <div
            className="w-8 h-8 rounded-full bg-[#C38A2E] text-[#171714] font-bold text-xs flex items-center justify-center shrink-0 select-none uppercase"
            aria-hidden="true"
          >
            {(signedInEmail || '?').slice(0, 1)}
          </div>
          {isEffectivelyExpanded && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[10px] text-[#8C887B] tracking-wider uppercase font-mono">Signed in as</p>
              <p className="text-xs font-medium text-[#FAF8F5] leading-tight truncate" title={signedInEmail}>
                {signedInEmail}
              </p>
            </div>
          )}
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="p-1.5 rounded text-[#A8A49A] hover:text-white hover:bg-[#282622] shrink-0"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};
