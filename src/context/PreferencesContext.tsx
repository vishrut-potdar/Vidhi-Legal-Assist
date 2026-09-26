import React, { createContext, useContext, useEffect, useState } from 'react';

export type ReadingLevel = 'simple' | 'standard' | 'detailed';

export const READING_LEVELS: Array<{ value: ReadingLevel; label: string; labelHindi: string; description: string }> = [
  { value: 'simple', label: 'Simple', labelHindi: 'सरल', description: 'Short sentences, everyday words' },
  { value: 'standard', label: 'Standard', labelHindi: 'सामान्य', description: 'Clear plain language' },
  { value: 'detailed', label: 'Detailed', labelHindi: 'विस्तृत', description: 'Includes laws and reasoning' },
];

interface PreferencesValue {
  readingLevel: ReadingLevel;
  setReadingLevel: (level: ReadingLevel) => void;
}

const PreferencesContext = createContext<PreferencesValue>({
  readingLevel: 'standard',
  setReadingLevel: () => {},
});

const STORAGE_KEY = 'vidhi_reading_level';

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only the display preference is remembered — never any document content.
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'simple' || saved === 'standard' || saved === 'detailed') return saved;
    } catch {}
    return 'standard';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, readingLevel);
    } catch {}
  }, [readingLevel]);

  return <PreferencesContext.Provider value={{ readingLevel, setReadingLevel }}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => useContext(PreferencesContext);
