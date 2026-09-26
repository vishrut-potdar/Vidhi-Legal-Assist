import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Bookmark,
  Check,
  Tag,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Palette,
} from 'lucide-react';
import { DocumentAnnotation, HighlightColor, Language } from '../types';
import { useDialogA11y } from '../hooks/useDialogA11y';

interface AnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  annotation: Partial<DocumentAnnotation> | null;
  onSave: (annotation: DocumentAnnotation) => void;
  onDelete?: (id: string) => void;
  language?: Language;
}

const colorStyles: Record<
  HighlightColor,
  {
    name: string;
    bgBadge: string;
    border: string;
    dot: string;
    lightBg: string;
    label: string;
  }
> = {
  yellow: {
    name: 'Legal Yellow',
    bgBadge: 'bg-amber-50 text-amber-900 border-amber-300',
    border: 'border-amber-400',
    dot: 'bg-[#FBBF24]',
    lightBg: 'bg-[#FEF9C3]',
    label: 'Standard Highlight',
  },
  amber: {
    name: 'Amber Warning',
    bgBadge: 'bg-orange-50 text-orange-900 border-orange-300',
    border: 'border-orange-400',
    dot: 'bg-[#F97316]',
    lightBg: 'bg-[#FFEDD5]',
    label: 'Caution / Review',
  },
  rose: {
    name: 'Rose Red Flag',
    bgBadge: 'bg-rose-50 text-rose-900 border-rose-300',
    border: 'border-rose-400',
    dot: 'bg-[#F43F5E]',
    lightBg: 'bg-[#FFE4E6]',
    label: 'High Concern',
  },
  green: {
    name: 'Sage Verified',
    bgBadge: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    border: 'border-emerald-400',
    dot: 'bg-[#10B981]',
    lightBg: 'bg-[#DCFCE7]',
    label: 'Agreed / Verified',
  },
  blue: {
    name: 'Formal Blue',
    bgBadge: 'bg-sky-50 text-sky-900 border-sky-300',
    border: 'border-sky-400',
    dot: 'bg-[#0EA5E9]',
    lightBg: 'bg-[#E0F2FE]',
    label: 'Bank / Procedure',
  },
  purple: {
    name: 'Advocate Purple',
    bgBadge: 'bg-purple-50 text-purple-900 border-purple-300',
    border: 'border-purple-400',
    dot: 'bg-[#A855F7]',
    lightBg: 'bg-[#F3E8FF]',
    label: 'Lawyer Query',
  },
};

const tagOptions: Array<{
  value: NonNullable<DocumentAnnotation['tag']>;
  label: string;
  labelHindi: string;
  labelMarathi: string;
}> = [
  {
    value: 'ADVOCATE_QUERY',
    label: 'Ask Advocate',
    labelHindi: 'वकील से पूछें',
    labelMarathi: 'वकिलांना विचारा',
  },
  {
    value: 'ACTION_ITEM',
    label: 'Action before Signing',
    labelHindi: 'हस्ताक्षर से पहले की कार्रवाई',
    labelMarathi: 'स्वाक्षरीपूर्वीची कृती',
  },
  {
    value: 'BANK_CHECK',
    label: 'Bank / Loan Check',
    labelHindi: 'बैंक / लोन शर्त',
    labelMarathi: 'बँक / कर्ज तपासणी',
  },
  {
    value: 'RED_FLAG',
    label: 'One-Sided Trap',
    labelHindi: 'एकतरफा शर्त',
    labelMarathi: 'एकतर्फी अट',
  },
  {
    value: 'GENERAL_NOTE',
    label: 'Personal Note',
    labelHindi: 'व्यक्तिगत नोट',
    labelMarathi: 'वैयक्तिक नोंद',
  },
];

const quickSuggestions = [
  'Ask advocate: Is this enforceable without joint execution?',
  'Demand seller provide original property tax clearance receipt.',
  'Bank condition: Require mortgage discharge letter prior to cheque.',
  'Request amendment: Replace "reasonable time" with fixed 7-day period.',
  'Double check municipal assessment records for any pending arrears.',
];

export const AnnotationModal: React.FC<AnnotationModalProps> = ({
  isOpen,
  onClose,
  annotation,
  onSave,
  onDelete,
  language = 'EN',
}) => {
  const [color, setColor] = useState<HighlightColor>('yellow');
  const [note, setNote] = useState<string>('');
  const [tag, setTag] = useState<NonNullable<DocumentAnnotation['tag']>>('ADVOCATE_QUERY');

  useEffect(() => {
    if (annotation) {
      setColor(annotation.color || 'yellow');
      setNote(annotation.note || '');
      setTag(annotation.tag || 'ADVOCATE_QUERY');
    }
  }, [annotation]);

  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen && !!annotation, onClose);

  if (!isOpen || !annotation) return null;

  const isEditing = Boolean(annotation.id);

  const handleSave = () => {
    const savedAnnotation: DocumentAnnotation = {
      id: annotation.id || `anno-${Date.now()}`,
      documentId: annotation.documentId || 'doc-sale-deed-402',
      pageNumber: annotation.pageNumber || 7,
      lineNumber: annotation.lineNumber || 1,
      clauseNumber: annotation.clauseNumber,
      lineText: annotation.lineText || '',
      selectedSnippet: annotation.selectedSnippet || annotation.lineText?.slice(0, 80),
      color,
      note: note.trim() || undefined,
      tag,
      createdAt: annotation.createdAt || new Date().toISOString(),
      updatedAt: isEditing ? new Date().toISOString() : undefined,
    };
    onSave(savedAnnotation);
    onClose();
  };

  const handleQuickInsert = (text: string) => {
    if (!note) {
      setNote(text);
    } else {
      setNote((prev) => `${prev} ${text}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-[#FCFBF7] border border-[#D5D0C3] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="annotation-title"
      >
        {/* Header with sticky-note accent */}
        <div
          className={`px-5 py-4 border-b border-[#E8E4D8] flex items-center justify-between transition-colors ${
            colorStyles[color].lightBg
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/5 text-[#1C1C19] font-bold">
              NOTE
            </span>
            <div>
              <h3
                id="annotation-title"
                className="font-serif text-base font-semibold text-[#1C1C19]"
              >
                {isEditing ? 'Edit Annotation & Sticky Note' : 'Add Sticky Note & Highlight'}
              </h3>
              <p className="text-[11px] font-mono text-[#6F6D65]">
                PAGE {annotation.pageNumber || 7} • LINE {annotation.lineNumber || 1}
                {annotation.clauseNumber ? ` • CLAUSE ${annotation.clauseNumber}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6F6D65] hover:text-[#1C1C19] hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Target Line Reference */}
          <div className="bg-[#FAF8F5] border border-[#E5E0D3] rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8C887B]">
              <span>TARGET LINE TEXT</span>
              <span>Line #{annotation.lineNumber}</span>
            </div>
            <p className="font-serif italic text-xs text-[#1C1C19] leading-relaxed border-l-2 border-[#C38A2E] pl-2.5 my-1">
              "{annotation.lineText}"
            </p>
          </div>

          {/* Color Chooser */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-medium text-[#1C1C19] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#C38A2E]" />
                HIGHLIGHT COLOR
              </label>
              <span className="text-[11px] font-mono text-[#6F6D65]">
                {colorStyles[color].name}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {(Object.keys(colorStyles) as HighlightColor[]).map((c) => {
                const conf = colorStyles[c];
                const isSelected = color === c;
                return (
                  <button aria-label={`${conf.name} (${conf.label})`} aria-pressed={isSelected}
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-9 rounded-lg border-2 flex items-center justify-center transition-all ${
                      conf.lightBg
                    } ${
                      isSelected
                        ? 'border-[#1C1C19] ring-2 ring-black/10 scale-105 shadow-xs'
                        : 'border-transparent hover:border-black/20'
                    }`}
                    title={`${conf.name} (${conf.label})`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${conf.dot} shadow-xs flex items-center justify-center`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag / Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-[#1C1C19] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#C38A2E]" />
              PURPOSE &amp; TAG
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tagOptions.map((t) => (
                <button aria-pressed={tag === t.value}
                  key={t.value}
                  type="button"
                  onClick={() => setTag(t.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-sans transition-all flex items-center gap-1.5 border ${
                    tag === t.value
                      ? 'bg-[#1C1C19] text-[#FAF8F5] border-[#1C1C19] shadow-xs font-medium'
                      : 'bg-white text-[#4A4843] border-[#DDD9CE] hover:border-[#8C887B]'
                  }`}
                >
                  <span>
                    {language === 'HI'
                      ? t.labelHindi
                      : language === 'MR'
                      ? t.labelMarathi
                      : t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sticky Note Content Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-medium text-[#1C1C19] flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#C38A2E]" />
                YOUR PERSONAL STICKY NOTE
              </label>
              <span className="text-[10px] font-mono text-[#8C887B]">
                {note.length}/300 chars
              </span>
            </div>

            <div className="relative rounded-lg p-1 bg-[#FEF9C3]/50 border border-amber-300 shadow-inner">
              <textarea aria-label="Note text"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                placeholder="Write your note, question for your lawyer, or reminder for registration day..."
                rows={3}
                className="w-full bg-transparent p-2.5 text-xs sm:text-sm font-sans text-[#1C1C19] placeholder:text-[#8C887B] focus:outline-hidden resize-none leading-relaxed"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Helper Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#8C887B] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C38A2E]" />
              QUICK LAWYER / BANK PROMPTS:
            </span>
            <div className="flex flex-wrap gap-1">
              {quickSuggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickInsert(prompt)}
                  className="text-[11px] text-[#4A4843] bg-white border border-[#DDD9CE] hover:border-[#C38A2E] hover:text-[#1C1C19] px-2 py-0.5 rounded text-left transition-colors"
                >
                  + {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#E8E4D8] flex items-center justify-between gap-3">
          <div>
            {isEditing && onDelete && annotation.id && (
              <button
                type="button"
                onClick={() => {
                  onDelete(annotation.id!);
                  onClose();
                }}
                className="text-xs font-mono text-[#8E4A3F] hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-mono text-[#6F6D65] hover:text-[#1C1C19] hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded text-xs font-medium bg-[#1C1C19] text-[#FAF8F5] hover:bg-[#33312B] shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#C38A2E]" />
              {isEditing ? 'Update Note' : 'Save Sticky Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
