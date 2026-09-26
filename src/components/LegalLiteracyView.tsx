import React, { useState } from 'react';
import {
  Scale,
  Clock,
  Coins,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  CourtStage,
  Language,
  LearningModule,
  GlossaryItem,
} from '../types';
import {
  courtLadderStages,
  learningModules,
  glossaryItems,
  uiTranslations,
} from '../data/mockData';
import { DisclaimerBanner } from './DisclaimerBanner';

interface LegalLiteracyViewProps {
  language: Language;
  onBackToReport: () => void;
  selectedModuleId?: string;
}

export const LegalLiteracyView: React.FC<LegalLiteracyViewProps> = ({
  language,
  onBackToReport,
  selectedModuleId,
}) => {
  const t = uiTranslations[language];
  const [activeTopic, setActiveTopic] = useState<
    'Civil — property' | 'Consumer' | 'Criminal' | 'RERA'
  >('Civil — property');
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] =
    useState<GlossaryItem | null>(null);

  const topics: ('Civil — property' | 'Consumer' | 'Criminal' | 'RERA')[] = [
    'Civil — property',
    'Consumer',
    'Criminal',
    'RERA',
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header with Module Label */}
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#C38A2E] font-mono">
              {t.courtLadderTitle}
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#1C1C19] font-serif">
              If a property dispute arose, where would it go?
            </h1>
            <p className="text-xs md:text-sm text-[#6F6D65] max-w-2xl leading-relaxed">
              {t.courtLadderSubtitle}
            </p>
          </div>

          {/* Topic Switcher Tabs (Section 20) */}
          <div className="inline-flex rounded-md p-1 bg-[#F3F0E8] border border-[#DDD9CE] text-xs font-medium self-start md:self-auto">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setActiveTopic(topic)}
                className={`px-3 py-1.5 rounded transition-all ${
                  activeTopic === topic
                    ? 'bg-[#FCFBF7] text-[#1C1C19] shadow-xs font-semibold'
                    : 'text-[#6F6D65] hover:text-[#1C1C19]'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DisclaimerBanner language={language} />

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): The Court Ladder Visualization */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 md:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F0E8]">
              <div>
                <h2 className="text-base font-semibold text-[#1C1C19] font-serif">
                  The Hierarchy of Indian Courts
                </h2>
                <p className="text-xs text-[#6F6D65]">
                  Mapped for a ₹86,00,000 residential sale deed in Kalyani Nagar, Pune
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#F3ECD7] text-[#B08427] px-2 py-0.5 rounded font-bold">
                Civil Jurisdiction
              </span>
            </div>

            {/* Stages Stack (Apex down to Pre-Court) */}
            <div className="space-y-4 relative">
              {courtLadderStages.map((stage) => {
                const isStart = stage.isUserMatterStart;
                const isPreCourt = stage.preLitigation;

                return (
                  <div
                    key={stage.id}
                    className={`rounded-lg p-5 border transition-all relative ${
                      isStart
                        ? 'bg-[#FCFBF7] border-2 border-[#C38A2E] shadow-sm'
                        : isPreCourt
                        ? 'bg-[#F7F4EC] border-dashed border-[#B08427]'
                        : 'bg-[#FCFBF7] border-[#DDD9CE]'
                    }`}
                  >
                    {/* User Matter Pin Badge */}
                    {isStart && (
                      <div className="absolute -top-3 left-4 bg-[#C38A2E] text-[#171714] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs font-mono flex items-center gap-1">
                        <span>★</span>
                        <span>{t.yourMatterStartsHere} · FIRST STOP</span>
                      </div>
                    )}

                    {isPreCourt && (
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#58735C] font-mono mb-1">
                        RECOMMENDED PRE-LITIGATION STEP
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-[#1C1C19] font-serif">
                          {stage.name}
                        </h3>
                        <p className="text-xs text-[#6F6D65] mt-0.5">
                          {stage.courtType}
                        </p>
                      </div>

                      {/* Level Indicator */}
                      <span className="text-[10px] font-mono text-[#96938A] px-2 py-0.5 bg-[#F3F0E8] rounded shrink-0 self-start">
                        {isPreCourt ? 'STAGE 0' : `LEVEL ${stage.level}`}
                      </span>
                    </div>

                    <p className="text-xs text-[#1C1C19] mt-2.5 leading-relaxed">
                      {stage.description}
                    </p>

                    {/* Metadata Grid: Duration, Cost, Limitation */}
                    <div className="mt-4 pt-3 border-t border-[#F3F0E8] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#C38A2E] shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#96938A] block">
                            Duration
                          </span>
                          <span className="font-medium text-[#1C1C19]">
                            {stage.typicalDuration}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-[#B08427] shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#96938A] block">
                            Cost Burden
                          </span>
                          <span className="font-medium text-[#1C1C19]">
                            {stage.costLevel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-[#58735C] shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#96938A] block">
                            Limitation
                          </span>
                          <span className="font-medium text-[#1C1C19] truncate">
                            {stage.limitationPeriod}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 22: Before-Court Stage Details (Mediation / Notice / Lok Adalat) */}
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#1C1C19]">
              Before-Court Avenues (Why filing a lawsuit isn't step one)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F7F4EC] rounded border border-[#E8E4D9] space-y-1">
                <span className="font-bold text-[#1C1C19] block">1. Legal Notice</span>
                <p className="text-[#6F6D65] text-[11px] leading-relaxed">
                  Drafted by your advocate giving 15–30 days to rectify clause breach before filing.
                </p>
              </div>
              <div className="p-3 bg-[#F7F4EC] rounded border border-[#E8E4D9] space-y-1">
                <span className="font-bold text-[#1C1C19] block">2. Mediation</span>
                <p className="text-[#6F6D65] text-[11px] leading-relaxed">
                  Neutral mediator helps negotiate keys handover and escrow payments without trial.
                </p>
              </div>
              <div className="p-3 bg-[#F7F4EC] rounded border border-[#E8E4D9] space-y-1">
                <span className="font-bold text-[#1C1C19] block">3. Lok Adalat</span>
                <p className="text-[#6F6D65] text-[11px] leading-relaxed">
                  Zero court fees; decree is final, binding, and cannot be appealed in higher court.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Module Progress & Document Connection */}
        <div className="lg:col-span-4 space-y-5">
          {/* Section 24: Link Back to User Document */}
          <div className="bg-[#FCFBF7] border-2 border-[#F2E6C9] rounded-lg p-5 shadow-xs space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#C38A2E] font-mono">
              {t.fromYourOwnDoc}
            </div>
            <p className="text-xs md:text-sm text-[#1C1C19] leading-relaxed">
              Clause 4 of your sale deed (unlinking balance payment from mortgage discharge) is exactly the kind of contractual ambiguity that ends up in a 3-year specific performance trial before the District Court, Pune.
            </p>
            <button
              onClick={onBackToReport}
              className="w-full py-2 px-3 bg-[#171714] text-[#F7F5EF] rounded text-xs font-medium hover:bg-[#2C2B26] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>{t.backToReport}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 23: Module Progress Panel */}
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 shadow-xs space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6F6D65] font-mono">
              Course Modules
            </div>

            <div className="space-y-2">
              {learningModules.map((mod) => (
                <div
                  key={mod.id}
                  className={`p-3 rounded-md border text-xs flex items-center justify-between gap-2 transition-all ${
                    mod.status === 'NOW'
                      ? 'bg-[#F2E6C9]/40 border-[#C38A2E]'
                      : 'bg-[#F7F4EC] border-[#DDD9CE]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-[#96938A]">
                      MODULE {mod.number}
                    </span>
                    <div className="font-medium text-[#1C1C19]">
                      {language === 'HI' && mod.titleHindi
                        ? mod.titleHindi
                        : mod.title}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      mod.status === 'DONE'
                        ? 'bg-[#E6EEE6] text-[#58735C]'
                        : mod.status === 'NOW'
                        ? 'bg-[#C38A2E] text-[#171714]'
                        : 'bg-[#E8E4D9] text-[#6F6D65]'
                    }`}
                  >
                    {mod.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 25: Glossary Chips */}
          <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6D65] font-mono">
                Plain-Language Legal Glossary
              </span>
              <span className="text-[10px] text-[#96938A]">Click to inspect</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {glossaryItems.map((item) => (
                <button
                  key={item.term}
                  onClick={() => setSelectedGlossaryTerm(item)}
                  className="px-2.5 py-1 text-xs bg-[#F7F4EC] hover:bg-[#F2E6C9] border border-[#DDD9CE] rounded-full text-[#1C1C19] transition-colors"
                >
                  {item.term}
                </button>
              ))}
            </div>

            {/* Selected Glossary Card */}
            {selectedGlossaryTerm && (
              <div className="p-3 bg-[#FCFBF7] rounded border border-[#C38A2E] text-xs space-y-1.5 mt-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1C1C19]">
                    {selectedGlossaryTerm.termDevanagari}
                  </span>
                  <button
                    onClick={() => setSelectedGlossaryTerm(null)}
                    className="text-[#96938A] hover:text-[#1C1C19] text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[#6F6D65] text-[11px] leading-relaxed">
                  {selectedGlossaryTerm.definition}
                </p>
                <div className="text-[11px] text-[#1C1C19] bg-[#F7F4EC] p-2 rounded">
                  <strong className="text-[#C38A2E]">Example: </strong>
                  {selectedGlossaryTerm.plainExample}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
