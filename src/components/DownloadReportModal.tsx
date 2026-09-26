import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Printer,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DocumentInfo, Finding, MissingDocument, Language } from '../types';
import { exportReportAsPdf, exportReportAsText } from '../utils/exportReport';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentInfo: DocumentInfo;
  findings: Finding[];
  missingDocs: MissingDocument[];
  language: Language;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  documentInfo,
  findings,
  missingDocs,
  language,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const briefCount = findings.filter((f) => f.inAdvocateBrief).length;

  const handlePdf = () => {
    exportReportAsPdf(documentInfo, findings, missingDocs);
    setDownloadSuccess('PDF export opened in print view. Select "Save as PDF" to save.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleTxt = () => {
    exportReportAsText(documentInfo, findings, missingDocs);
    setDownloadSuccess('Text report (.txt) downloaded to your device.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F3F0E8]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C38A2E] font-mono">
              EXPORT & ARCHIVE
            </span>
            <h2 className="text-lg font-semibold text-[#1C1C19] font-serif mt-0.5">
              Download Matter Report
            </h2>
            <p className="text-xs text-[#6F6D65]">
              Export the complete clause findings, plain translations, and advocate brief.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#96938A] hover:text-[#1C1C19] hover:bg-[#F3F0E8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Matter Preview Card */}
        <div className="p-3.5 bg-[#F7F4EC] rounded-lg border border-[#DDD9CE] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1C1C19] font-serif text-sm">
              {documentInfo.title}
            </span>
            <span className="font-mono font-bold text-[#B44738] bg-[#F5E3DE] px-2 py-0.5 rounded text-[10px]">
              {documentInfo.riskScore}/100 RISK
            </span>
          </div>
          <p className="text-[#6F6D65]">{documentInfo.property}</p>

          <div className="pt-2 border-t border-[#E8E4D9] flex flex-wrap items-center gap-3 text-[11px] text-[#6F6D65] font-mono">
            <span>{findings.length} Flagged Clauses</span>
            <span>·</span>
            <span>{briefCount} Advocate Questions</span>
            <span>·</span>
            <span>{documentInfo.pageCount} Pages</span>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="p-3 bg-[#E6EEE6] text-[#58735C] border border-[#58735C]/30 rounded-md text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Download Options */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6F6D65] font-mono">
            Choose Export Format:
          </div>

          {/* Option 1: PDF */}
          <button
            onClick={handlePdf}
            className="w-full p-4 rounded-lg border border-[#DDD9CE] hover:border-[#171714] bg-[#FCFBF7] hover:bg-[#F3F0E8] transition-all text-left flex items-start gap-3.5 group shadow-xs"
          >
            <div className="w-10 h-10 rounded-md bg-[#171714] text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#C38A2E] transition-colors">
              <Printer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1C1C19] font-serif">
                  Formatted PDF Document
                </span>
                <span className="text-[10px] uppercase font-bold font-mono px-1.5 py-0.5 rounded bg-[#F2E6C9] text-[#171714]">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-[#6F6D65] mt-1 leading-relaxed">
                Includes executive summary, risk theme bars, verbatim deed quotations, full plain-language explanations, and the consultation brief.
              </p>
            </div>
          </button>

          {/* Option 2: Plain Text */}
          <button
            onClick={handleTxt}
            className="w-full p-4 rounded-lg border border-[#DDD9CE] hover:border-[#171714] bg-[#FCFBF7] hover:bg-[#F3F0E8] transition-all text-left flex items-start gap-3.5 group shadow-xs"
          >
            <div className="w-10 h-10 rounded-md bg-[#F7F4EC] border border-[#DDD9CE] text-[#171714] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#171714] group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1C1C19] font-serif">
                  Structured Text File (.txt)
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#E8E4D9] text-[#6F6D65]">
                  Lightweight
                </span>
              </div>
              <p className="text-xs text-[#6F6D65] mt-1 leading-relaxed">
                Clean text format with ASCII dividers. Ideal for emailing to counsel, copy-pasting, or offline reading on any device.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#F3F0E8] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#96938A] italic">
            All 7 findings & advocate questions included
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-[#6F6D65] hover:text-[#1C1C19]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
