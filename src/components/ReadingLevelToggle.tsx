import React from 'react';
import { READING_LEVELS, usePreferences } from '../context/PreferencesContext';
import type { Language } from '../types';

interface ReadingLevelToggleProps {
  variant?: 'dark' | 'light';
  language?: Language;
  compact?: boolean;
  className?: string;
}

/** Segmented control for the plain-language reading level used by every AI explanation. */
export const ReadingLevelToggle: React.FC<ReadingLevelToggleProps> = ({ variant = 'light', language = 'EN', compact = false, className = '' }) => {
  const { readingLevel, setReadingLevel } = usePreferences();
  const dark = variant === 'dark';

  return (
    <div
      role="radiogroup"
      aria-label="Explanation reading level"
      className={`flex items-center rounded-md p-0.5 border ${
        dark ? 'bg-[#1D1C18] border-[#2A2823]' : 'bg-white border-[#DDD9CE]'
      } ${className}`}
    >
      {READING_LEVELS.map((level) => {
        const active = readingLevel === level.value;
        const label = language === 'EN' ? level.label : level.labelHindi;
        return (
          <button
            key={level.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={`${level.label}: ${level.description}`}
            onClick={() => setReadingLevel(level.value)}
            className={`flex-1 rounded transition-colors whitespace-nowrap ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'} ${
              active
                ? dark
                  ? 'bg-[#FAF8F5] text-[#171714] font-semibold'
                  : 'bg-[#1C1C19] text-white font-semibold'
                : dark
                ? 'text-[#9A968D] hover:text-[#FAF8F5]'
                : 'text-[#6F6D65] hover:text-[#1C1C19]'
            }`}
          >
            {/* Devanagari labels are already short; truncating them would split syllables. */}
            {compact && language === 'EN' ? label.slice(0, 4) : label}
            {compact && <span className="sr-only">{` reading level`}</span>}
          </button>
        );
      })}
    </div>
  );
};
