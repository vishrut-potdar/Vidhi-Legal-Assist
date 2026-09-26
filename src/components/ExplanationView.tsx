import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Download,
  Info,
} from 'lucide-react';
import { Finding, Language } from '../types';
import { BilingualText } from './BilingualText';

interface ExplanationViewProps {
  finding: Finding;
  allFindings: Finding[];
  language: Language;
  onBackToReport: () => void;
  onSelectFinding: (finding: Finding) => void;
  onToggleBrief: (findingId: string) => void;
  onOpenLearnModule: (moduleId: string) => void;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  finding,
  allFindings,
  language,
  onBackToReport,
  onSelectFinding,
  onToggleBrief,
  onOpenLearnModule,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentIndex = allFindings.findIndex((f) => f.id === finding.id);
  const prevFinding = currentIndex > 0 ? allFindings[currentIndex - 1] : null;
  const nextFinding =
    currentIndex < allFindings.length - 1 ? allFindings[currentIndex + 1] : null;

  const isHigh = finding.severity === 'HIGH';
  const isMedium = finding.severity === 'MEDIUM';

  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak =
        language === 'HI' || language === 'MR'
          ? finding.audioScriptHindi
          : finding.audioScriptEnglish;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = language === 'HI' ? 'hi-IN' : 'en-IN';

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={onBackToReport}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1C19] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to document review</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C887B]">
            {currentIndex + 1} OF {allFindings.length} FINDINGS
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={!prevFinding}
              onClick={() => prevFinding && onSelectFinding(prevFinding)}
              className="w-7 h-7 flex items-center justify-center rounded bg-[#FCFBF7] border border-[#DDD9CE] disabled:opacity-30 text-[#1C1C19] hover:bg-[#F3F0E8] text-xs font-mono"
              title="Previous finding"
            >
              ‹
            </button>
            <button
              disabled={!nextFinding}
              onClick={() => nextFinding && onSelectFinding(nextFinding)}
              className="w-7 h-7 flex items-center justify-center rounded bg-[#FCFBF7] border border-[#DDD9CE] disabled:opacity-30 text-[#1C1C19] hover:bg-[#F3F0E8] text-xs font-mono"
              title="Next finding"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split matching 1c-clause-detail.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Clause Detail */}
        <div className="lg:col-span-6 bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-6 sm:p-7 shadow-xs space-y-5">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                  isHigh
                    ? 'bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA]'
                    : isMedium
                    ? 'bg-[#F3ECD7] text-[#B08427] border border-[#E8DAB7]'
                    : 'bg-[#E6EEE6] text-[#58735C] border border-[#D5E2D5]'
                }`}
              >
                {finding.severity} RISK
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6F6D65]">
                CLAUSE {finding.clauseNumber} · PAGE {finding.pageNumber} · {finding.theme}
              </span>
            </div>

            {/* Audio Listen */}
            <button aria-pressed={isPlayingAudio}
              onClick={handlePlayAudio}
              className={`p-1.5 rounded border text-xs transition-colors flex items-center gap-1 ${
                isPlayingAudio
                  ? 'bg-[#C38A2E] text-black border-[#C38A2E]'
                  : 'bg-white text-[#6F6D65] border-[#DDD9CE] hover:text-[#1C1C19]'
              }`}
              title="Listen to audio explanation in Indian accent"
            >
              {isPlayingAudio ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span className="text-[10px] font-mono font-medium">Listen</span>
            </button>
          </div>

          {/* Large Headline Title */}
          <BilingualText
            as="h2"
            language={language}
            en={finding.plainHeadline}
            hi={finding.plainHeadlineHindi}
            mr={finding.plainHeadlineMarathi}
            className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1C19] leading-snug"
            secondaryClassName="block mt-1 text-sm font-sans font-normal text-[#6F6D65]"
          />

          {/* Source Quote Box with thick left red border */}
          <div className="border-l-4 border-[#8E4A3F] bg-[#FAF8F5] p-3.5 rounded-r">
            <p className="font-serif italic text-xs sm:text-sm text-[#1C1C19] leading-relaxed">
              "{finding.sourceQuote}"
            </p>
          </div>

          {/* IN PLAIN LANGUAGE */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">
              IN PLAIN LANGUAGE
            </span>
            <BilingualText
              language={language}
              en={finding.plainLanguageExplanation}
              hi={finding.plainLanguageExplanationHindi}
              mr={finding.plainLanguageExplanationMarathi}
              className="text-xs sm:text-sm text-[#1C1C19] leading-relaxed"
              secondaryClassName="block mt-1.5 text-xs text-[#6F6D65]"
            />
          </div>

          {/* WHY IT MATTERS IN PRACTICE */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">
              WHY IT MATTERS IN PRACTICE
            </span>
            <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-3.5 space-y-2 text-xs text-[#1C1C19] leading-relaxed">
              {finding.practicalConsequences.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#8E4A3F] font-bold leading-tight">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LEARN MORE */}
          <div className="space-y-2 pt-2 border-t border-[#EFECE3]">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">
              LEARN MORE
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onOpenLearnModule('mod-02')}
                className="px-3 py-1.5 rounded border border-[#DDD9CE] bg-white hover:bg-[#FAF8F5] text-xs text-[#1C1C19] transition-colors"
              >
                What is an encumbrance certificate?
              </button>
              <button
                onClick={() => onOpenLearnModule('mod-02')}
                className="px-3 py-1.5 rounded border border-[#DDD9CE] bg-white hover:bg-[#FAF8F5] text-xs text-[#1C1C19] transition-colors"
              >
                How title passes on registration
              </button>
              <button
                onClick={() => onOpenLearnModule('mod-05')}
                className="px-3 py-1.5 rounded border border-[#DDD9CE] bg-white hover:bg-[#FAF8F5] text-xs text-[#1C1C19] transition-colors"
              >
                Where a property suit is filed
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): BRIEF FOR YOUR ADVOCATE */}
        <div className="lg:col-span-6 bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-6 sm:p-7 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C38A2E] font-semibold block">
                BRIEF FOR YOUR ADVOCATE
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1C1C19] leading-snug mt-1">
                Four questions, and why each one is being asked
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <button
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#171714] rounded hover:bg-[#2C2B26] transition-colors shadow-2xs"
              >
                Download PDF
              </button>
              <span className="text-[9px] font-mono text-[#8C887B] uppercase tracking-wider">
                ONE PAGE · EN / हिंदी
              </span>
            </div>
          </div>

          {/* 4 Numbered Question Cards matching 1c-clause-detail.png */}
          <div className="space-y-3">
            {/* Card 01 */}
            <div className="bg-white border border-[#DDD9CE] rounded-lg p-4 space-y-2 shadow-2xs">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xl font-bold text-[#C38A2E] leading-none shrink-0 pt-0.5">
                  01
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-serif text-sm font-semibold text-[#1C1C19] leading-snug">
                    "Can we make the balance payment conditional on the encumbrance being discharged, or place it in escrow until then?"
                  </h4>
                  <p className="text-xs text-[#6F6D65] leading-relaxed">
                    Why — clause 4 unlinks payment from the seller clearing the recorded charge. Ask what protection is realistic here and what it would cost.
                  </p>
                  <div className="text-right pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8E4A3F] bg-[#FAF3F1] px-2 py-0.5 rounded border border-[#EADBDA]">
                      FROM CLAUSE 4, PAGE 7 · HIGH
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 02 */}
            <div className="bg-white border border-[#DDD9CE] rounded-lg p-4 space-y-2 shadow-2xs">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xl font-bold text-[#C38A2E] leading-none shrink-0 pt-0.5">
                  02
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-serif text-sm font-semibold text-[#1C1C19] leading-snug">
                    "Should possession carry a fixed date, and should outgoings start only from that date?"
                  </h4>
                  <p className="text-xs text-[#6F6D65] leading-relaxed">
                    Why — clause 6 says "reasonable time" while charging me maintenance and tax from the date of the deed.
                  </p>
                  <div className="text-right pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8E4A3F] bg-[#FAF3F1] px-2 py-0.5 rounded border border-[#EADBDA]">
                      FROM CLAUSE 6, PAGE 7 · HIGH
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 03 */}
            <div className="bg-white border border-[#DDD9CE] rounded-lg p-4 space-y-2 shadow-2xs">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xl font-bold text-[#C38A2E] leading-none shrink-0 pt-0.5">
                  03
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-serif text-sm font-semibold text-[#1C1C19] leading-snug">
                    "Schedule III is referenced but not attached — what does it disclose, and does it cut down the clear-title declaration?"
                  </h4>
                  <p className="text-xs text-[#6F6D65] leading-relaxed">
                    Why — clause 5 declares clear title except as in Schedule III, which is missing from this draft.
                  </p>
                  <div className="text-right pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#B08427] bg-[#F3ECD7] px-2 py-0.5 rounded border border-[#E8DAB7]">
                      FROM CLAUSE 5, PAGE 7 · MEDIUM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 04 */}
            <div className="bg-white border border-[#DDD9CE] rounded-lg p-4 space-y-2 shadow-2xs">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xl font-bold text-[#C38A2E] leading-none shrink-0 pt-0.5">
                  04
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-serif text-sm font-semibold text-[#1C1C19] leading-snug">
                    "The records show two co-owners but only one is a party. Do we need the second owner to sign or give a power of attorney?"
                  </h4>
                  <p className="text-xs text-[#6F6D65] leading-relaxed">
                    Why — clause 11 names only one owner as Vendor.
                  </p>
                  <div className="text-right pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#B08427] bg-[#F3ECD7] px-2 py-0.5 rounded border border-[#E8DAB7]">
                      FROM CLAUSE 11, PAGE 12 · MEDIUM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Information Note matching 1c-clause-detail.png */}
          <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-3 flex items-start gap-2.5 text-xs text-[#6F6D65] leading-relaxed">
            <div className="w-4 h-4 rounded-full border border-[#6F6D65] flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-serif font-bold">
              i
            </div>
            <p>
              These are questions, not conclusions. An advocate who sees the full title chain may answer some of them in a sentence — that is a good outcome, and it is the point of taking the list with you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
