import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ChevronDown,
} from 'lucide-react';
import { Language } from '../types';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  initialQuestion?: string;
  documentContext?: string;
  onAddQuestionToBrief?: (question: string) => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  initialQuestion,
  documentContext,
  onAddQuestionToBrief,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Welcome to Vidhi Legal Assistant. I can help you inspect your Flat 402 Kalyani Nagar Sale Deed, explain statutory conveyancing rules under the Maharashtra Ownership Flats Act and RERA, identify unilateral vendor traps, or prepare clear questions for your property advocate. What would you like to review?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelRole, setModelRole] = useState<'general' | 'deep' | 'fast'>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeLang, setActiveLang] = useState<Language>(language);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync prop language
  useEffect(() => {
    setActiveLang(language);
  }, [language]);

  // Handle incoming initial question
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim().length > 0 && isOpen) {
      sendMessage(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Explain Clause 4 regarding mortgage clearance in plain language.',
    'What is the difference between Form 15 and Form 16 in an Encumbrance Certificate?',
    'What questions should I ask my lawyer before signing at the Sub-Registrar?',
    'Is the 12-month defect liability sufficient for a 10-year-old flat?',
  ];

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const serverPayloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: serverPayloadMessages,
          documentContext,
          language: activeLang,
          modelRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessageItem = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'No response generated.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed || 'gemini-3.8-flash',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err) {
      console.warn('Chat request failed, providing local legal guidance:', err);
      const fallbackMsg: ChatMessageItem = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          'Under standard Indian conveyancing practice (Registration Act 1908 & Transfer of Property Act 1882), all terms in the Sale Deed become non-negotiable once registered. We strongly recommend having an advocate draft a specific clause requiring physical vacant possession and an SBI Mortgage Release Deed as conditions precedent to final consideration release.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash (Offline Mode)',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Conversation reset. You are examining the 18-page Kalyani Nagar Sale Deed draft. Ask me to break down any clause, check legal compliance, or prepare advocate queries.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
      },
    ]);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-3 sm:inset-6'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[85vh]'
      }`}
    >
      <div className="w-full h-full bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#1C1C19]">
        {/* Header Bar */}
        <header className="px-4 py-3 bg-[#FAF8F5] border-b border-[#DDD9CE] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#58735C]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-sm tracking-tight text-[#1C1C19]">
                  Vidhi AI Legal Counsel
                </span>
                <span className="text-[10px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded bg-[#F0EBE0] text-[#73716A] border border-[#DDD9CE]">
                  {modelRole === 'deep'
                    ? 'Pro Reasoning'
                    : modelRole === 'fast'
                    ? 'Flash-Lite'
                    : 'Gemini 3.8 Flash'}
                </span>
              </div>
              <p className="text-[11px] text-[#8C887B] font-mono leading-none mt-0.5">
                Strict Information Boundary · Not Formal Representation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Model Role Selector */}
            <select
              value={modelRole}
              onChange={(e) => setModelRole(e.target.value as any)}
              className="text-[11px] font-mono bg-white border border-[#DDD9CE] rounded px-1.5 py-1 text-[#1C1C19] focus:outline-none"
              title="Select Gemini intelligence level"
            >
              <option value="general">Gemini 3.8 Flash (General)</option>
              <option value="deep">Gemini 3.1 Pro (Deep Scrutiny)</option>
              <option value="fast">Gemini 3.1 Flash-Lite (Fast)</option>
            </select>

            {/* Language Selector */}
            <div className="flex items-center text-[11px] font-mono bg-white border border-[#DDD9CE] rounded p-0.5">
              {(['EN', 'HI', 'MR'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setActiveLang(lang);
                    if (onLanguageChange) onLanguageChange(lang);
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    activeLang === lang
                      ? 'bg-[#1C1C19] text-white font-bold'
                      : 'text-[#8C887B] hover:text-[#1C1C19]'
                  }`}
                >
                  {lang === 'EN' ? 'EN' : lang === 'HI' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>

            {/* Expand / Minimize */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-[#8C887B] hover:text-[#1C1C19] transition-colors"
              title={isExpanded ? 'Restore window size' : 'Expand window'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Reset */}
            <button
              onClick={handleResetChat}
              className="p-1 rounded text-[#8C887B] hover:text-[#1C1C19] transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1 rounded text-[#8C887B] hover:text-[#1C1C19] transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Grounding Context Indicator */}
        <div className="px-4 py-2 bg-[#F6F3EB] border-b border-[#E8E4D9] flex items-center justify-between text-[11px] font-mono text-[#6F6D65]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C38A2E]" />
            <span className="truncate">Active Context: Flat 402 Kalyani Nagar Sale Deed (18 Pages)</span>
          </div>
          <span className="shrink-0 text-[10px] text-[#8C887B] uppercase tracking-wider">
            PII Redacted
          </span>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1 font-mono text-[10px] text-[#8C887B]">
                  <span>{isUser ? 'You (Citizen)' : 'Vidhi Assistant'}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.modelUsed && (
                    <>
                      <span>·</span>
                      <span className="text-[#6F6D65]">{msg.modelUsed}</span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-[88%] rounded-lg p-3.5 leading-relaxed text-xs sm:text-[13px] ${
                    isUser
                      ? 'bg-[#1C1C19] text-[#FAF8F5] rounded-tr-none'
                      : 'bg-white border border-[#DDD9CE] text-[#1C1C19] shadow-2xs rounded-tl-none font-serif'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                  {/* Actions for Assistant Messages */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-[11px] font-mono text-[#8C887B]">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-[#1C1C19] transition-colors flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#58735C]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {onAddQuestionToBrief && (
                        <button
                          onClick={() => onAddQuestionToBrief(msg.content)}
                          className="text-[#8C621E] hover:underline"
                        >
                          + Send to Advocate Brief
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="px-1 font-mono text-[10px] text-[#8C887B]">
                Vidhi Assistant · Formulating Plain-Language Scrutiny...
              </div>
              <div className="bg-white border border-[#DDD9CE] rounded-lg rounded-tl-none p-3 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C38A2E] animate-ping" />
                <span className="text-xs font-mono text-[#6F6D65]">
                  Analyzing statutory precedents with {modelRole === 'deep' ? 'Gemini 3.1 Pro' : modelRole === 'fast' ? 'Gemini 3.1 Flash-Lite' : 'Gemini 3.8 Flash'}...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Queries */}
        <div className="px-4 py-2 bg-[#FAF8F5] border-t border-[#DDD9CE]/60 overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-none">
          <span className="text-[10px] font-mono text-[#8C887B] uppercase shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="text-[11px] font-sans px-2.5 py-1 bg-white border border-[#DDD9CE] rounded text-[#4A4843] hover:text-[#1C1C19] hover:border-[#1C1C19] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <footer className="p-3 bg-white border-t border-[#DDD9CE] shrink-0">
          <div className="flex items-end gap-2 border border-[#C9C4B7] focus-within:border-[#1C1C19] focus-within:ring-1 focus-within:ring-[#1C1C19] rounded-lg p-2 bg-[#FCFBF7]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any question about your deed, clauses, or Indian property laws..."
              rows={2}
              className="flex-1 bg-transparent resize-none text-xs sm:text-[13px] text-[#1C1C19] placeholder-[#8C887B] focus:outline-none leading-relaxed"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="px-3 py-1.5 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26] transition-colors shadow-xs disabled:opacity-40 flex items-center gap-1 shrink-0"
              title="Send question (Enter)"
            >
              <span>Ask</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[#8C887B] px-1">
            <span>Press Enter to send · Shift+Enter for new line</span>
            <span>Strict Legal Literacy Mode</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
