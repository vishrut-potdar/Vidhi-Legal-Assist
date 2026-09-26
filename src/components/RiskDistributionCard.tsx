import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight, Info, Filter } from 'lucide-react';
import { Language, DocumentInfo, Finding } from '../types';

interface RiskDistributionCardProps {
  documentInfo: DocumentInfo;
  findings?: Finding[];
  language: Language;
  onOpenReport: (severity?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
}

interface RiskSliceData {
  name: string;
  key: 'HIGH' | 'MEDIUM' | 'LOW';
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  hindiName: string;
  marathiName: string;
  examples: string;
}

export const RiskDistributionCard: React.FC<RiskDistributionCardProps> = ({
  documentInfo,
  findings,
  language,
  onOpenReport,
}) => {
  // Compute counts from findings if available, or fallback to documentInfo
  const highCount = findings
    ? findings.filter((f) => f.severity === 'HIGH').length
    : documentInfo.highCount;
  const mediumCount = findings
    ? findings.filter((f) => f.severity === 'MEDIUM').length
    : documentInfo.mediumCount;
  const lowCount = findings
    ? findings.filter((f) => f.severity === 'LOW').length
    : documentInfo.lowCount;

  const totalCount = highCount + mediumCount + lowCount || 1;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data: RiskSliceData[] = [
    {
      name: 'High Risk',
      key: 'HIGH',
      value: highCount,
      color: '#8E4A3F',
      bgColor: '#FAF3F1',
      borderColor: '#EADBDA',
      textColor: '#8E4A3F',
      description: 'Critical traps & financial forfeiture hazards',
      hindiName: 'उच्च जोखिम (High)',
      marathiName: 'मोठा धोका (High)',
      examples: 'Clauses 4 & 9 (Unlinked loan, open-ended possession)',
    },
    {
      name: 'Medium Risk',
      key: 'MEDIUM',
      value: mediumCount,
      color: '#B08427',
      bgColor: '#F3ECD7',
      borderColor: '#E8DAB7',
      textColor: '#8C621E',
      description: 'Procedural imbalances & truncated warranties',
      hindiName: 'मध्यम जोखिम (Medium)',
      marathiName: 'मध्यम धोका (Medium)',
      examples: 'Clauses 11, 16, 19 (Indemnity cap, society NOC)',
    },
    {
      name: 'Low Risk',
      key: 'LOW',
      value: lowCount,
      color: '#58735C',
      bgColor: '#E6EEE6',
      borderColor: '#D5E2D5',
      textColor: '#58735C',
      description: 'Minor ambiguities & utility clarifications',
      hindiName: 'निम्न जोखिम (Low)',
      marathiName: 'कमी धोका (Low)',
      examples: 'Clauses 22 & 24 (Meter transfer & standard notices)',
    },
  ];

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  const titleText =
    language === 'HI'
      ? 'जोखिम वितरण (Risk Distribution)'
      : language === 'MR'
      ? 'धोका विभागणी (Risk Distribution)'
      : 'Risk Distribution';

  const subtitleText =
    language === 'HI'
      ? `${totalCount} चिह्नित धाराएं · 18 पृष्ठ`
      : language === 'MR'
      ? `${totalCount} चिन्हांकित अटी · 18 पृष्ठे`
      : `${totalCount} Flagged Clauses · 18 Pages`;

  return (
    <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F3F0E8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#6F6D65] font-mono">
              ANALYTICS & AUDIT
            </span>
          </div>
          <h3 className="text-base font-semibold text-[#1C1C19] font-serif mt-0.5">
            {titleText}
          </h3>
          <p className="text-xs text-[#6F6D65]">{subtitleText}</p>
        </div>

        <button
          onClick={() => onOpenReport()}
          className="text-xs font-semibold text-[#8C621E] hover:text-[#1C1C19] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>{language === 'HI' ? 'सभी देखें' : language === 'MR' ? 'सर्व पहा' : 'View all'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Donut Chart & Center Stats */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
        <div className="relative w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as RiskSliceData;
                    const pct = Math.round((item.value / totalCount) * 100);
                    return (
                      <div className="bg-[#1C1C19] text-[#FAF8F5] text-xs px-2.5 py-1.5 rounded shadow-lg border border-[#3C3B37] font-sans">
                        <div className="font-bold flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>
                            {language === 'HI'
                              ? item.hindiName
                              : language === 'MR'
                              ? item.marathiName
                              : item.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#C9C4B7] font-mono mt-0.5">
                          {item.value} {item.value === 1 ? 'clause' : 'clauses'} ({pct}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                stroke="#FCFBF7"
                strokeWidth={2}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(_, index) => onOpenReport(data[index].key)}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Hole Central Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {activeItem ? (
              <>
                <span
                  className="text-2xl font-bold font-mono leading-none"
                  style={{ color: activeItem.color }}
                >
                  {activeItem.value}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6D65] mt-0.5">
                  {Math.round((activeItem.value / totalCount) * 100)}%
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-tight text-[#4A4843]">
                  {activeItem.key}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold font-mono text-[#1C1C19] leading-none">
                  {totalCount}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6D65] mt-0.5">
                  TOTAL
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-tight text-[#8C621E]">
                  FLAGS
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Percentages Pill Bar */}
        <div className="flex-1 w-full space-y-2 text-xs">
          {data.map((item, idx) => {
            const pct = Math.round((item.value / totalCount) * 100);
            const isHovered = activeIndex === idx;

            return (
              <div
                key={item.key}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onOpenReport(item.key)}
                className={`p-2 rounded-md border cursor-pointer transition-all ${
                  isHovered
                    ? 'border-[#C38A2E] bg-[#FAF8F2] shadow-xs'
                    : 'border-[#E8E4D9] bg-[#F7F4EC] hover:border-[#C9C4B7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-[#1C1C19]">
                      {language === 'HI'
                        ? item.hindiName
                        : language === 'MR'
                        ? item.marathiName
                        : item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#1C1C19]">{item.value}</span>
                    <span className="text-[10px] text-[#73716A]">({pct}%)</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#6F6D65] mt-1 truncate pl-4">
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight Highlight Strip */}
      <div className="p-3 bg-[#FAF3F1] border border-[#EADBDA] rounded-md text-xs text-[#8E4A3F] flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">
            Critical Severity Concentration:
          </span>
          <span>
            <strong>{Math.round((highCount / totalCount) * 100)}% ({highCount} clauses)</strong> carry immediate title risk or unconditional payment traps that must be renegotiated.
          </span>
        </div>
      </div>
    </div>
  );
};
