import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Language, TimelineEvent, DocumentInfo } from '../types';
import { matterTimeline, uiTranslations } from '../data/mockData';
import { DisclaimerBanner } from './DisclaimerBanner';

interface TimelineViewProps {
  documentInfo: DocumentInfo;
  language: Language;
  onOpenReport: () => void;
  onOpenBrief: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  documentInfo,
  language,
  onOpenReport,
  onOpenBrief,
}) => {
  const t = uiTranslations[language];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 md:p-6 shadow-xs space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#C38A2E] font-mono">
          MATTER CHRONOLOGY
        </div>
        <h1 className="text-xl md:text-2xl font-semibold text-[#1C1C19] font-serif">
          Matter Timeline — Flat 402, Kalyani Nagar
        </h1>
        <p className="text-xs md:text-sm text-[#6F6D65]">
          Track key milestone dates, title verification steps, and the upcoming sub-registrar registration appointment.
        </p>
      </div>

      <DisclaimerBanner language={language} />

      {/* Timeline Card */}
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-6 md:p-8 shadow-xs">
        <div className="relative pl-6 md:pl-8 space-y-8 before:content-[''] before:absolute before:left-3 md:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#DDD9CE]">
          {matterTimeline.map((item, index) => {
            const isCurrent = item.status === 'CURRENT';
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div key={item.id} className="relative space-y-1.5">
                {/* Marker Node */}
                <div
                  className={`absolute -left-6 md:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-[#171714] border-[#171714] text-white'
                      : isCurrent
                      ? 'bg-[#C38A2E] border-[#C38A2E] text-[#171714] ring-4 ring-[#F2E6C9]'
                      : 'bg-white border-[#96938A] text-[#96938A]'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-[10px] font-bold">✓</span>
                  ) : isCurrent ? (
                    <span className="text-[10px] font-bold font-mono">●</span>
                  ) : (
                    <span className="text-[10px] font-mono">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1 bg-[#F7F4EC] p-4 rounded-lg border border-[#E8E4D9]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#6F6D65]">
                      {item.date}
                    </span>
                    <span
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-[#E6EEE6] text-[#58735C]'
                          : isCurrent
                          ? 'bg-[#C38A2E] text-[#171714]'
                          : 'bg-[#F3ECD7] text-[#B08427]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-semibold text-[#1C1C19] font-serif">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#6F6D65] leading-relaxed">
                    {item.description}
                  </p>

                  {item.location && (
                    <div className="flex items-center gap-1.5 text-xs text-[#C38A2E] pt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={onOpenBrief}
                        className="px-3 py-1.5 bg-[#C38A2E] text-[#171714] rounded text-xs font-medium hover:bg-[#b07b27] transition-colors"
                      >
                        Review Advocate Brief
                      </button>
                      <button
                        onClick={onOpenReport}
                        className="px-3 py-1.5 bg-[#FCFBF7] border border-[#DDD9CE] text-[#1C1C19] rounded text-xs font-medium hover:bg-[#F3F0E8] transition-colors"
                      >
                        Inspect Flagged Clauses
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
