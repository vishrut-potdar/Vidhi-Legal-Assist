import React from 'react';
import { Check, Loader2, Shield } from 'lucide-react';
import type { AnalysisStage } from '../utils/analyzeDocument';

export interface PartialFinding {
  clauseNumber: number;
  title: string;
  riskLevel: string;
}

interface AnalysisProgressProps {
  stage: AnalysisStage;
  message: string;
  progress: number;
  partials: PartialFinding[];
  onCancel?: () => void;
}

const STEPS: Array<{ id: AnalysisStage; label: string }> = [
  { id: 'parsing', label: 'Reading' },
  { id: 'masking', label: 'Hiding personal data' },
  { id: 'analyzing', label: 'Analysing clauses' },
  { id: 'flagging', label: 'Flagging risks' },
  { id: 'summarizing', label: 'Summary' },
];

const ORDER: AnalysisStage[] = ['parsing', 'masking', 'analyzing', 'flagging', 'summarizing', 'done'];

const riskStyle = (risk: string) =>
  risk === 'HIGH'
    ? 'bg-[#F5E3DE] text-[#8E3A2E] border-[#E8C9C1]'
    : risk === 'MEDIUM'
    ? 'bg-[#F3ECD7] text-[#7A5C18] border-[#E6D8B0]'
    : 'bg-[#E6EEE6] text-[#3F5A43] border-[#CADBCB]';

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ stage, message, progress, partials, onCancel }) => {
  const currentIndex = ORDER.indexOf(stage);
  const pct = Math.max(2, Math.min(100, Math.round(progress)));

  return (
    <div className="py-6 px-1 sm:px-4 space-y-5 text-left max-w-xl mx-auto">
      {/* Step list: visible stepper + accessible ordered list */}
      <ol className="grid grid-cols-5 gap-1 sm:gap-2" aria-label="Analysis steps">
        {STEPS.map((step, idx) => {
          const stepIndex = ORDER.indexOf(step.id);
          const state = stepIndex < currentIndex ? 'done' : stepIndex === currentIndex ? 'active' : 'todo';
          return (
            <li key={step.id} className="flex flex-col items-center text-center gap-1.5" aria-current={state === 'active' ? 'step' : undefined}>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border ${
                  state === 'done'
                    ? 'bg-[#58735C] border-[#58735C] text-white'
                    : state === 'active'
                    ? 'bg-[#FCFBF7] border-[#C38A2E] text-[#8C621C]'
                    : 'bg-[#F3F0E8] border-[#DDD9CE] text-[#8C887B]'
                }`}
                aria-hidden="true"
              >
                {state === 'done' ? <Check className="w-3.5 h-3.5" /> : state === 'active' ? <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin" /> : idx + 1}
              </span>
              <span className={`text-[10px] sm:text-[11px] leading-tight ${state === 'todo' ? 'text-[#8C887B]' : 'text-[#1C1C19] font-medium'}`}>
                {step.label}
                <span className="sr-only">{state === 'done' ? ' (completed)' : state === 'active' ? ' (in progress)' : ' (pending)'}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div>
        <div
          className="w-full bg-[#E8E4D9] h-2 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Document analysis progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="h-full bg-[#C38A2E] rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-[#4A4843]" role="status" aria-live="polite">
          {message || 'Preparing…'}
        </p>
      </div>

      {partials.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#8C887B]">Found so far</p>
          <ul className="space-y-1 max-h-40 overflow-y-auto" aria-live="polite" aria-relevant="additions">
            {partials.slice(-8).map((p, i) => (
              <li key={`${p.clauseNumber}-${i}`} className="flex items-center gap-2 text-xs">
                <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-bold ${riskStyle(p.riskLevel)}`}>{p.riskLevel}</span>
                <span className="text-[#1C1C19] truncate">
                  {p.clauseNumber > 0 ? `Clause ${p.clauseNumber}: ` : ''}
                  {p.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-[11px] text-[#6F6D65]">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#58735C]" aria-hidden="true" />
          Aadhaar, PAN, phone &amp; bank details are masked before AI analysis. Nothing is stored.
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 px-3 py-1.5 rounded border border-[#DDD9CE] text-xs font-medium text-[#4A4843] hover:text-[#1C1C19] hover:bg-[#F3F0E8]"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
