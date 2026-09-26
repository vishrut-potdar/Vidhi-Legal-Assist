import React, { useState } from 'react';
import { AlertCircle, HelpCircle, ChevronDown, ChevronUp, Scale, ShieldAlert } from 'lucide-react';
import { UncertaintySignal, UncertaintyLevel, Language } from '../types';

interface UncertaintyBadgeProps {
  signal?: UncertaintySignal;
  language?: Language;
  showComplianceNote?: boolean;
  className?: string;
}

export const UncertaintyBadge: React.FC<UncertaintyBadgeProps> = ({
  signal,
  language = 'EN',
  showComplianceNote = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!signal) return null;

  const getTierStyles = (level: UncertaintyLevel) => {
    switch (level) {
      case 'HIGH_CERTAINTY':
        return {
          badgeBg: 'bg-[#F2F6F3] text-[#3D5C43] border-[#CDE0D2]',
          dotColor: 'bg-[#3D5C43]',
          defaultLabel: 'High Textual Certainty (Express contractual clause)',
          defaultLabelHi: 'उच्च निश्चितता (दस्तावेज़ में स्पष्ट रूप से लिखित)',
          defaultLabelMr: 'उच्च खात्रीशीरता (दस्तऐवजात स्पष्ट नमूद अट)',
        };
      case 'MEDIUM_UNCERTAINTY':
        return {
          badgeBg: 'bg-[#FAF5E8] text-[#8C621E] border-[#EBDCBA]',
          dotColor: 'bg-[#C38A2E]',
          defaultLabel: 'Medium Uncertainty (Ambiguous phrasing / Subject to court interpretation)',
          defaultLabelHi: 'मध्यम अनिश्चितता (अस्पष्ट शब्द / अदालती व्याख्या पर निर्भर)',
          defaultLabelMr: 'मध्यम अनिश्चितता (अस्पष्ट शब्द / न्यायालयीन अर्थनिर्णयावर अवलंबून)',
        };
      case 'HIGH_UNCERTAINTY':
      default:
        return {
          badgeBg: 'bg-[#FAF1F0] text-[#933D31] border-[#E8CECA]',
          dotColor: 'bg-[#B44738]',
          defaultLabel: 'High Uncertainty (Missing schedule / Dependent on external bank records)',
          defaultLabelHi: 'उच्च अनिश्चितता (अनुपस्थित अनुसूची / बैंक रिकॉर्ड पर निर्भर)',
          defaultLabelMr: 'उच्च अनिश्चितता (गहाळ परिशिष्ट / बँकेच्या दाखल्यावर अवलंबून)',
        };
    }
  };

  const styles = getTierStyles(signal.level);

  const displayLabel = language === 'MR'
    ? (signal.labelMarathi || styles.defaultLabelMr)
    : language === 'HI'
    ? (signal.labelHindi || styles.defaultLabelHi)
    : (signal.label || styles.defaultLabel);

  const displayReason = language === 'MR'
    ? (signal.reasonMarathi || signal.reason)
    : language === 'HI'
    ? (signal.reasonHindi || signal.reason)
    : signal.reason;

  return (
    <div className={`space-y-1.5 text-xs ${className}`}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-medium transition-colors cursor-pointer ${styles.badgeBg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${styles.dotColor}`} />
          <span>{displayLabel}</span>
          {isOpen ? (
            <ChevronUp className="w-3 h-3 opacity-70" />
          ) : (
            <ChevronDown className="w-3 h-3 opacity-70" />
          )}
        </button>

        <span className="text-[10px] text-[#8C887B] font-mono hidden sm:inline">
          (Uncertainty Signal)
        </span>
      </div>

      {isOpen && (
        <div className="p-3 bg-[#FCFBF7] border border-[#DDD9CE] rounded-md space-y-2 text-xs shadow-xs animate-fade-in">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#6F6D65] block mb-0.5">
              WHY THIS IS UNCERTAIN / LIMITATION OF ANALYSIS:
            </span>
            <p className="text-[#3A3834] leading-relaxed">
              {displayReason}
            </p>
          </div>

          <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#EFECE3] space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#8C621E] block">
              ADVOCATE ACTION REQUIRED:
            </span>
            <p className="text-[#1C1C19] text-[11.5px] leading-relaxed">
              {signal.counselRequiredAction}
            </p>
          </div>

          {showComplianceNote && (
            <div className="pt-1.5 border-t border-[#EFECE3] text-[10.5px] text-[#7A766E] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#8C887B] shrink-0" />
              <span>
                Compliance thread: Vidhi provides information, not legal advice. Final construction of clauses requires a licensed advocate.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
