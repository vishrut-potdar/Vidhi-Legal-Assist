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
import { usePreferences } from '../context/PreferencesContext';
import { ReadingLevelToggle } from './ReadingLevelToggle';
import { readNdjson } from '../utils/analyzeDocument';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  notice?: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  initialQuestion?: string;
  documentContext?: string;
  documentTitle?: string;
  onAddQuestionToBrief?: (question: string) => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  initialQuestion,
  documentContext,
  documentTitle,
  onAddQuestionToBrief,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Welcome to Vidhi Legal Assistant. Ask me about any clause in your document, Indian property law (RERA, stamp duty, registration, encumbrance certificates), one-sided terms to watch for, or what to ask your advocate before signing.',
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
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const { readingLevel } = usePreferences();

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

  // Escape closes the chat panel
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = documentContext
    ? [
        'Summarise the biggest risks in my document in plain language.',
        'Which clauses should I ask my advocate to change before signing?',
        'What documents should I collect before registration?',
        'What is the difference between Form 15 and Form 16 in an Encumbrance Certificate?',
      ]
    : [
        'What is the difference between Form 15 and Form 16 in an Encumbrance Certificate?',
        'What questions should I ask my lawyer before signing at the Sub-Registrar?',
        'How is stamp duty calculated for a flat purchase in Maharashtra?',
        'What should a fair possession clause say?',
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

    const botId = `bot-${Date.now()}`;
    const appendToBot = (text: string) =>
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, content: m.content + text } : m)));

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          documentContext,
          language: activeLang,
          modelRole,
          readingLevel,
        }),
      });

      if (!res.ok) {
        let message = `Server returned ${res.status}`;
        try {
          const data = await res.json();
          message = data.message || data.error || message;
        } catch {}
        throw new Error(message);
      }

      let started = false;
      await readNdjson(res, (event) => {
        if (event.type === 'delta' && typeof event.text === 'string') {
          if (!started) {
            started = true;
            setMessages((prev) => [
              ...prev,
              {
                id: botId,
                role: 'assistant',
                content: '',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                modelUsed: modelRole === 'deep' ? 'gemini-3.1-pro-preview' : modelRole === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash',
              },
            ]);
            setStreamingId(botId);
          }
          appendToBot(event.text);
        } else if (event.type === 'done') {
          setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, modelUsed: event.modelUsed, notice: event.notice } : m)));
        } else if (event.type === 'error') {
          throw new Error(event.message || 'Chat failed');
        }
      });
      if (!started) throw new Error('Empty response');
    } catch (err: any) {
      console.warn('Chat request failed:', err);
      setMessages((prev) => [
        ...prev.filter((m) => !(m.id === botId && !m.content)),
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content:
            err?.message && /rate limit|too many/i.test(err.message)
              ? err.message
              : 'Sorry, the assistant could not be reached. Please check your connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Connection error',
        },
      ]);
    } finally {
      setStreamingId(null);
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
          'Conversation reset. Ask me to explain a clause, check a legal requirement, or prepare questions for your advocate.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
      },
    ]);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="vidhi-chat-title"
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-3 sm:inset-6'
          : 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:h-[640px] sm:max-h-[85vh]'
      }`}
    >
      <div className="w-full h-full bg-[#FCFBF7] border border-[#DDD9CE] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#1C1C19]">
        {/* Header Bar */}
        <header className="px-3 sm:px-4 py-3 bg-[#FAF8F5] border-b border-[#DDD9CE] flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#58735C]" aria-hidden="true" />
            <div>
              <div className="flex items-center gap-2">
                <span id="vidhi-chat-title" className="font-serif font-semibold text-sm tracking-tight text-[#1C1C19]">
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
              className="text-[11px] font-mono bg-white border border-[#DDD9CE] rounded px-1.5 py-1 text-[#1C1C19] max-w-[9.5rem]"
              title="Select Gemini intelligence level"
              aria-label="AI model"
            >
              <option value="general">Gemini 3.8 Flash (General)</option>
              <option value="deep">Gemini 3.1 Pro (Deep Scrutiny)</option>
              <option value="fast">Gemini 3.1 Flash-Lite (Fast)</option>
            </select>

            {/* Language Selector */}
            <div role="group" aria-label="Answer language" className="flex items-center text-[11px] font-mono bg-white border border-[#DDD9CE] rounded p-0.5">
              {(['EN', 'HI', 'MR'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  aria-pressed={activeLang === lang}
                  lang={lang === 'EN' ? 'en' : lang === 'HI' ? 'hi' : 'mr'}
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
              className="hidden sm:block p-1.5 rounded text-[#8C887B] hover:text-[#1C1C19] transition-colors"
              title={isExpanded ? 'Restore window size' : 'Expand window'}
              aria-label={isExpanded ? 'Restore chat window size' : 'Expand chat window'}
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
              className="p-1.5 rounded text-[#8C887B] hover:text-[#1C1C19] transition-colors"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#8C887B] hover:text-[#1C1C19] transition-colors"
              title="Close chat"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Reading level for answers */}
        <div className="px-3 sm:px-4 py-1.5 bg-[#FAF8F5] border-b border-[#E8E4D9] flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C887B]">Answer detail</span>
          <ReadingLevelToggle language={activeLang} compact />
        </div>

        {/* Grounding Context Indicator */}
        <div className="px-4 py-2 bg-[#F6F3EB] border-b border-[#E8E4D9] flex items-center justify-between text-[11px] font-mono text-[#6F6D65]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C38A2E]" />
            <span className="truncate">{documentTitle ? `Active document: ${documentTitle}` : 'No document uploaded — general questions only'}</span>
          </div>
          <span className="shrink-0 text-[10px] text-[#8C887B] uppercase tracking-wider">
            PII Redacted
          </span>
        </div>

        {/* Scrollable Message Thread */}
        <div
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 font-sans text-xs"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-busy={isLoading}
          aria-label="Conversation"
        >
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
                  <p className="whitespace-pre-line leading-relaxed" lang={isUser ? undefined : activeLang === 'HI' ? 'hi' : activeLang === 'MR' ? 'mr' : 'en'}>
                    {msg.content}
                    {streamingId === msg.id && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-[#C38A2E] motion-safe:animate-pulse" aria-hidden="true" />}
                  </p>
                  {msg.notice && (
                    <p role="note" className="mt-2 text-[11px] font-sans px-2 py-1.5 rounded bg-[#FAF3E0] border border-[#E8D499] text-[#6B5217]">
                      {msg.notice}
                    </p>
                  )}

                  {/* Actions for Assistant Messages */}
                  {!isUser && streamingId !== msg.id && (
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
          {isLoading && !streamingId && (
            <div className="flex flex-col items-start space-y-1" role="status">
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
              aria-label="Your question"
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
            <span>Enter to send · Shift+Enter for new line · Esc to close</span>
            <span className="hidden sm:inline">Personal details are masked before sending</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
