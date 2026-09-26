import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  Edit2,
  ExternalLink,
  Plus,
  Tag as TagIcon,
  HelpCircle,
  FileText,
  Share2,
} from 'lucide-react';
import { DocumentAnnotation, HighlightColor, Language } from '../types';

interface DocumentAnnotationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  annotations: DocumentAnnotation[];
  onSelectAnnotation: (annotation: DocumentAnnotation) => void;
  onDeleteAnnotation: (id: string) => void;
  onJumpToLine: (pageNumber: number, lineNumber: number) => void;
  onOpenAdvocateBrief?: () => void;
  language?: Language;
}

const colorDots: Record<HighlightColor, string> = {
  yellow: 'bg-[#FBBF24] border-amber-500',
  amber: 'bg-[#F97316] border-orange-500',
  rose: 'bg-[#F43F5E] border-rose-500',
  green: 'bg-[#10B981] border-emerald-500',
  blue: 'bg-[#0EA5E9] border-sky-500',
  purple: 'bg-[#A855F7] border-purple-500',
};

const tagLabels: Record<
  NonNullable<DocumentAnnotation['tag']>,
  { label: string; bg: string; text: string }
> = {
  ADVOCATE_QUERY: {
    label: 'Advocate Query',
    bg: 'bg-purple-50',
    text: 'text-purple-800 border-purple-200',
  },
  ACTION_ITEM: {
    label: 'Action Item',
    bg: 'bg-amber-50',
    text: 'text-amber-800 border-amber-200',
  },
  BANK_CHECK: {
    label: 'Bank Condition',
    bg: 'bg-sky-50',
    text: 'text-sky-800 border-sky-200',
  },
  RED_FLAG: {
    label: 'Red Flag Trap',
    bg: 'bg-rose-50',
    text: 'text-rose-800 border-rose-200',
  },
  GENERAL_NOTE: {
    label: 'Personal Note',
    bg: 'bg-stone-50',
    text: 'text-stone-800 border-stone-200',
  },
};

export const DocumentAnnotationsPanel: React.FC<DocumentAnnotationsPanelProps> = ({
  isOpen,
  onClose,
  annotations,
  onSelectAnnotation,
  onDeleteAnnotation,
  onJumpToLine,
  onOpenAdvocateBrief,
  language = 'EN',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filtered = annotations.filter((anno) => {
    if (selectedTag !== 'ALL' && anno.tag !== selectedTag) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (anno.note && anno.note.toLowerCase().includes(q)) ||
      anno.lineText.toLowerCase().includes(q) ||
      `line ${anno.lineNumber}`.includes(q) ||
      `page ${anno.pageNumber}`.includes(q)
    );
  });

  const handleCopyAll = () => {
    if (annotations.length === 0) return;
    const text = annotations
      .map(
        (a, idx) =>
          `[Note #${idx + 1}] Page ${a.pageNumber}, Line ${a.lineNumber} (Clause ${
            a.clauseNumber || 'N/A'
          })\n` +
          `Tag: ${a.tag || 'General'}\n` +
          `Draft Quote: "${a.lineText}"\n` +
          `My Note: ${a.note || '(Highlight only)'}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(
      `VIDHI SALE DEED NOTES & STICKY ANNOTATIONS\nDate: ${new Date().toLocaleDateString()}\n\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#FCFBF7] border-l border-[#D5D0C3] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E4D8] bg-[#FAF8F5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EAE6DB] text-[#1C1C19]">
            NOTES
          </span>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#1C1C19] flex items-center gap-2">
              <span>My Sticky Notes &amp; Highlights</span>
              <span className="text-xs font-mono font-normal bg-[#EAE6DB] px-1.5 py-0.5 rounded text-[#4A4843]">
                {annotations.length}
              </span>
            </h3>
            <p className="text-[11px] font-mono text-[#6F6D65]">
              Saved locally to your session state
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-[#6F6D65] hover:text-[#1C1C19] hover:bg-black/5 transition-colors"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="p-4 border-b border-[#E8E4D8] space-y-3 bg-white">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C887B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, quotes, or line numbers..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD9CE] rounded-md text-[#1C1C19] placeholder:text-[#8C887B] focus:outline-hidden focus:border-[#C38A2E]"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono">
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-2 py-0.5 rounded transition-all whitespace-nowrap ${
              selectedTag === 'ALL'
                ? 'bg-[#1C1C19] text-white font-medium'
                : 'bg-[#F4F1EA] text-[#6F6D65] hover:text-[#1C1C19]'
            }`}
          >
            All ({annotations.length})
          </button>
          {Object.keys(tagLabels).map((key) => {
            const t = tagLabels[key as keyof typeof tagLabels];
            const count = annotations.filter((a) => a.tag === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedTag(key)}
                className={`px-2 py-0.5 rounded transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedTag === key
                    ? 'bg-[#1C1C19] text-white font-medium'
                    : 'bg-[#F4F1EA] text-[#6F6D65] hover:text-[#1C1C19]'
                }`}
              >
                <span>{t.label} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Annotations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF3E0] text-[#C38A2E] flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-[#C38A2E]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-sm font-semibold text-[#1C1C19]">
                {annotations.length === 0 ? 'No annotations yet' : 'No matching notes'}
              </h4>
              <p className="text-xs text-[#6F6D65] max-w-xs mx-auto leading-relaxed">
                Click any line in the Deed document paper to highlight it or attach a personal sticky note for your advocate.
              </p>
            </div>
          </div>
        ) : (
          filtered.map((anno, index) => {
            const tagMeta = anno.tag ? tagLabels[anno.tag] : tagLabels.GENERAL_NOTE;
            const dotStyle = colorDots[anno.color] || colorDots.yellow;

            return (
              <div
                key={anno.id}
                className="bg-[#FEFCE8] border border-[#FEF08A] rounded-lg p-3.5 shadow-xs hover:shadow-md transition-shadow space-y-2 relative group"
              >
                {/* Top line location & tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border ${dotStyle}`}
                      title={`Color: ${anno.color}`}
                    />
                    <button
                      onClick={() => onJumpToLine(anno.pageNumber, anno.lineNumber)}
                      className="text-xs font-mono font-semibold text-[#1C1C19] hover:text-[#C38A2E] flex items-center gap-1"
                    >
                      <span>PAGE {anno.pageNumber} • LINE {anno.lineNumber}</span>
                      {anno.clauseNumber && (
                        <span className="text-[#8C887B] font-normal">
                          (Clause {anno.clauseNumber})
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Tag badge */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tagMeta.bg} ${tagMeta.text}`}
                  >
                    <span>{tagMeta.label}</span>
                  </span>
                </div>

                {/* Quoted Document Snippet */}
                <div className="border-l-2 border-[#C38A2E] pl-2 text-[11px] font-serif italic text-[#4A4843] bg-white/70 p-1.5 rounded-r">
                  "{anno.lineText}"
                </div>

                {/* Personal Sticky Note Text */}
                {anno.note ? (
                  <div className="text-xs font-sans text-[#1C1C19] leading-relaxed bg-white/90 p-2.5 rounded border border-amber-200/80 shadow-inner">
                    <span className="text-[10px] font-mono text-[#8C621E] uppercase tracking-wider block mb-0.5 font-bold">
                      MY NOTE:
                    </span>
                    {anno.note}
                  </div>
                ) : (
                  <div className="text-[11px] font-mono italic text-[#8C887B]">
                    (Highlight without note text)
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-xs font-mono text-[#6F6D65]">
                  <span className="text-[10px] text-[#8C887B]">
                    {new Date(anno.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onJumpToLine(anno.pageNumber, anno.lineNumber)}
                      className="p-1 hover:text-[#1C1C19] hover:bg-black/5 rounded text-[11px] flex items-center gap-1"
                      title="Jump to line in document"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Jump</span>
                    </button>

                    <button
                      onClick={() => onSelectAnnotation(anno)}
                      className="p-1 hover:text-[#1C1C19] hover:bg-black/5 rounded text-[11px] flex items-center gap-1"
                      title="Edit note"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onDeleteAnnotation(anno.id)}
                      className="p-1 text-[#8E4A3F] hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with Bulk Copy & Advocate Brief Link */}
      <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E4D8] space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            disabled={annotations.length === 0}
            className="flex-1 bg-white border border-[#DDD9CE] hover:border-[#1C1C19] text-[#1C1C19] text-xs font-mono py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied All Notes!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6F6D65]" />
                <span>Copy All Notes</span>
              </>
            )}
          </button>

          {onOpenAdvocateBrief && (
            <button
              onClick={() => {
                onClose();
                onOpenAdvocateBrief();
              }}
              className="flex-1 bg-[#1C1C19] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-mono py-2 rounded-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Advocate Brief</span>
              <ExternalLink className="w-3 h-3 text-[#C38A2E]" />
            </button>
          )}
        </div>
        <p className="text-[10px] font-mono text-[#8C887B] text-center">
          Tip: You can take these notes directly to your advocate consultation.
        </p>
      </div>
    </div>
  );
};
