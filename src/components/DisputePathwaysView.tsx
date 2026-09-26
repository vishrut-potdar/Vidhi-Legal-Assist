import React, { useState } from 'react';
import {
  Scale,
  Clock,
  Coins,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Gavel,
  Handshake,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { disputePathwaysList } from '../data/legalIntelligenceData';
import { DisputePathway, Language } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';
import { activateOnKey } from '../utils/a11y';

interface DisputePathwaysViewProps {
  language?: Language;
  onBackToReport?: () => void;
  onOpenAdvocateBrief?: () => void;
}

export const DisputePathwaysView: React.FC<DisputePathwaysViewProps> = ({
  language = 'EN',
  onBackToReport,
  onOpenAdvocateBrief,
}) => {
  const [activePathwayId, setActivePathwayId] = useState<string>('path-01');

  const activePathway =
    disputePathwaysList.find((p) => p.id === activePathwayId) || disputePathwaysList[0];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#FAF8F5] border border-[#DDD9CE] rounded-lg p-5 sm:p-7 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] font-semibold text-[#8C621E] bg-[#F3ECD7] px-2.5 py-0.5 rounded border border-[#E8DAB7]">
              LEGAL OPTIONS &amp; COURT-LADDER EDUCATION
            </span>
            <span className="text-xs font-mono text-[#6F6D65]">
              STANDARD DISPUTE &amp; NEGOTIATION PATHWAYS
            </span>
          </div>

          {onOpenAdvocateBrief && (
            <button
              onClick={onOpenAdvocateBrief}
              className="px-3 py-1.5 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26] transition-colors shadow-xs"
            >
              Open Advocate Brief
            </button>
          )}
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1C19]">
          How Legal Options Play Out in Practice
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6D65] max-w-3xl leading-relaxed">
          Neutral, objective walkthrough of standard legal and procedural mechanisms under Indian law — from pre-signing bilateral negotiation and Clause 14 arbitration, to civil specific performance suits and Lok Adalat.
        </p>

        <DisclaimerBanner language={language} />
      </div>

      {/* Pathway Selection Horizontal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {disputePathwaysList.map((path) => {
          const isActive = path.id === activePathwayId;
          const isNegotiation = path.type === 'NEGOTIATION';
          const isArbitration = path.type === 'ARBITRATION';
          const isCivil = path.type === 'CIVIL_COURT';
          const isMediation = path.type === 'MEDIATION';

          return (
            <div role="button" tabIndex={0} onKeyDown={activateOnKey} aria-pressed={activePathwayId === path.id}
              key={path.id}
              onClick={() => setActivePathwayId(path.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-[#C38A2E] ring-2 ring-[#C38A2E]/30 shadow-xs'
                  : 'bg-[#FCFBF7] border-[#DDD9CE] hover:border-[#C9C4B7]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isNegotiation
                        ? 'bg-[#E6EEE6] text-[#58735C]'
                        : isArbitration
                        ? 'bg-[#F3ECD7] text-[#8C621E]'
                        : isCivil
                        ? 'bg-[#FAF3F1] text-[#8E4A3F]'
                        : 'bg-[#EAE6DB] text-[#6F6D65]'
                    }`}
                  >
                    {path.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-[#8C887B]">
                    {path.typicalTimeline}
                  </span>
                </div>

                <h3 className="font-serif text-sm font-bold text-[#1C1C19] leading-snug">
                  {path.title}
                </h3>
                <p className="text-[11px] text-[#6F6D65] line-clamp-2">
                  {path.subtitle}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFECE3] mt-3 flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-[#8C887B]">{path.estimatedCost.split('(')[0]}</span>
                <span className={`text-[11px] font-semibold ${isActive ? 'text-[#C38A2E]' : 'text-[#8C887B]'}`}>
                  {isActive ? 'Active Path' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Pathway In-Depth Walkthrough */}
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
        {/* Pathway Header Details */}
        <div className="border-b border-[#EFECE3] pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] font-semibold text-[#8C621E]">
                PATHWAY DEEP DIVE · {activePathway.type.replace('_', ' ')}
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1C1C19] mt-0.5">
                {activePathway.title}
              </h2>
            </div>
            <div className="text-right text-xs font-mono text-[#6F6D65] space-y-0.5">
              <div>TIMELINE: {activePathway.typicalTimeline}</div>
              <div>FORUM: {activePathway.forumOrAuthority}</div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#4A4843] leading-relaxed">
            {activePathway.summary}
          </p>

          <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9CE] text-xs font-mono flex flex-wrap items-center gap-4 text-[#6F6D65]">
            <div>
              <strong className="text-[#1C1C19]">GOVERNING LAW:</strong> {activePathway.governingLaw}
            </div>
            <div>
              <strong className="text-[#1C1C19]">COST PROFILE:</strong> {activePathway.estimatedCost}
            </div>
          </div>
        </div>

        {/* Step-by-Step Procedure Flow */}
        <div className="space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#6F6D65] font-semibold block">
            HOW THIS PLAYS OUT STEP-BY-STEP
          </span>

          <div className="space-y-3">
            {activePathway.steps.map((st, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#DDD9CE] rounded-lg p-4 space-y-2 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#171714] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-serif text-sm font-bold text-[#1C1C19]">
                      {st.stage}
                    </h4>
                    <p className="text-xs text-[#4A4843] leading-relaxed">
                      {st.description}
                    </p>
                    <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#EFECE3] text-xs text-[#6F6D65] flex items-start gap-2 mt-1">
                      <span className="font-mono text-[10px] font-bold text-[#8C621E] uppercase shrink-0 pt-0.5">
                        CITIZEN TIP:
                      </span>
                      <span>{st.citizenTip}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pros & Cons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Pros */}
          <div className="bg-[#F0F5F0] border border-[#D5E2D5] rounded-lg p-4 space-y-2 text-xs">
            <span className="font-mono font-bold uppercase text-[10px] tracking-wider text-[#58735C] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Advantages &amp; Strategic Value
            </span>
            <ul className="space-y-1.5 text-[#3A4E3E]">
              {activePathway.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="font-bold">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="bg-[#FAF3F1] border border-[#EADBDA] rounded-lg p-4 space-y-2 text-xs">
            <span className="font-mono font-bold uppercase text-[10px] tracking-wider text-[#8E4A3F] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Drawbacks &amp; Practical Friction
            </span>
            <ul className="space-y-1.5 text-[#733A31]">
              {activePathway.cons.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suitability Verdict */}
        <div className="p-4 bg-[#F3ECD7] border border-[#E8DAB7] rounded-lg text-xs space-y-1">
          <span className="font-mono font-bold uppercase tracking-wider text-[#8C621E] text-[10px]">
            SUITABILITY FOR YOUR KALYANI NAGAR FLAT 402 MATTER:
          </span>
          <p className="font-serif font-semibold text-[#1C1C19]">
            {activePathway.suitabilityForMatter}
          </p>
        </div>
      </div>
    </div>
  );
};
