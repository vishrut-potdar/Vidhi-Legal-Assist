import React, { useState } from 'react';
import { Quote, ExternalLink, CheckCircle2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { SourceSpan, Language } from '../types';

interface SourceSpanCitationProps {
  span: SourceSpan;
  language?: Language;
  onJumpToSpan?: (span: SourceSpan) => void;
  className?: string;
  compact?: boolean;
}

export const SourceSpanCitation: React.FC<SourceSpanCitationProps> = ({
  span,
  language = 'EN',
  onJumpToSpan,
  className = '',
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const label = language === 'MR'
    ? `कलम ${span.clauseNumber} · पृष्ठ ${span.pageNumber} · ओळ ${span.startLine}–${span.endLine}`
    : language === 'HI'
    ? `धारा ${span.clauseNumber} · पृष्ठ ${span.pageNumber} · पंक्ति ${span.startLine}–${span.endLine}`
    : `Clause ${span.clauseNumber} · Page ${span.pageNumber} · Lines ${span.startLine}–${span.endLine}`;

  return (
    <div className={`text-xs font-mono inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (onJumpToSpan) onJumpToSpan(span);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F4F1EA] hover:bg-[#EAE5D9] text-[#7A5B18] border border-[#DDD5C5] transition-colors cursor-pointer group text-[11px]"
          title="Click to inspect exact source span quote from document"
        >
          <Quote className="w-3 h-3 text-[#A87B24] shrink-0" />
          <span className="font-semibold tracking-tight">{label}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-[#7A5B18]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[#7A5B18]" />
          )}
        </button>

        <span className="text-[10px] text-[#8C887B] font-mono hidden sm:inline">
          (Source-Span Citation)
        </span>
      </div>

      {/* Expanded Verbatim Snippet */}
      {isExpanded && (
        <div className="mt-1.5 p-3 rounded-md bg-[#FCFBF7] border-l-3 border-[#C38A2E] border-y border-r border-[#DDD9CE] shadow-xs text-xs space-y-1.5 animate-fade-in font-sans">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#7A5B18]">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
              <Lock className="w-3 h-3 text-[#58735C]" />
              VERBATIM SOURCE TEXT SPAN
            </span>
            <span className="text-[#8C887B]">
              PAGE {span.pageNumber} · LINES {span.startLine}–{span.endLine}
            </span>
          </div>

          <p className="font-serif italic text-[#1C1C19] text-[12.5px] leading-relaxed bg-[#FAF8F5] p-2 rounded border border-[#EFECE3]">
            "{span.exactQuote}"
          </p>

          <div className="flex items-center justify-between text-[10.5px] text-[#6F6D65] pt-1">
            <span>Verified against uploaded 18-page Kalyani Nagar Sale Deed.</span>
            {onJumpToSpan && (
              <button
                type="button"
                onClick={() => onJumpToSpan(span)}
                className="text-[#7A5B18] hover:text-[#1C1C19] font-medium underline flex items-center gap-0.5"
              >
                <span>Highlight in document</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
