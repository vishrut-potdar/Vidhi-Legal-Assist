import React from 'react';
import type { Language } from '../types';

interface BilingualTextProps {
  language: Language;
  en: string;
  hi?: string;
  mr?: string;
  as?: 'p' | 'span' | 'h2' | 'h4';
  className?: string;
  /** Classes for the English line shown under the regional text. */
  secondaryClassName?: string;
}

/**
 * Shows the regional-language text with the English original directly beneath it,
 * so citizens can read Hindi / Marathi while matching terms to the English document.
 */
export const BilingualText: React.FC<BilingualTextProps> = ({
  language,
  en,
  hi,
  mr,
  as: Tag = 'p',
  className = '',
  secondaryClassName = 'block mt-1 text-[0.85em] text-[#6F6D65] font-normal',
}) => {
  const regional = language === 'HI' ? hi : language === 'MR' ? mr : undefined;

  if (!regional) {
    return <Tag className={className}>{en}</Tag>;
  }

  return (
    <Tag className={className}>
      <span lang={language === 'HI' ? 'hi' : 'mr'}>{regional}</span>
      <span lang="en" className={secondaryClassName}>
        <span className="sr-only">English: </span>
        {en}
      </span>
    </Tag>
  );
};
