import React, { useState } from 'react';
import {
  X,
  Camera,
  Upload,
  FileCheck,
  Loader2,
  Scan,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onUploadSuccess: (docTitle: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  language,
  onUploadSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera'>('upload');
  const [scanStep, setScanStep] = useState<
    'idle' | 'detecting' | 'ocr' | 'flagging' | 'completed'
  >('idle');
  const [detectedPages, setDetectedPages] = useState(0);

  if (!isOpen) return null;

  const startScanningSimulation = (title: string) => {
    setScanStep('detecting');
    setDetectedPages(1);

    const timer1 = setTimeout(() => {
      setDetectedPages(8);
      setScanStep('ocr');
    }, 1200);

    const timer2 = setTimeout(() => {
      setDetectedPages(18);
      setScanStep('flagging');
    }, 2400);

    const timer3 = setTimeout(() => {
      setScanStep('completed');
    }, 3800);

    const timer4 = setTimeout(() => {
      onUploadSuccess(title);
      onClose();
      setScanStep('idle');
    }, 4600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F3F0E8]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C38A2E] font-mono">
              DOCUMENT INGESTION
            </span>
            <h2 className="text-lg font-semibold text-[#1C1C19] font-serif mt-0.5">
              Check a Legal Document
            </h2>
            <p className="text-xs text-[#6F6D65]">
              Upload a PDF draft or photograph physical pages for plain-language review.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#96938A] hover:text-[#1C1C19] hover:bg-[#F3F0E8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan / Processing Simulation State */}
        {scanStep !== 'idle' ? (
          <div className="py-8 px-4 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#F2E6C9] animate-pulse" />
              <div className="absolute inset-2 rounded-full border-2 border-t-[#C38A2E] animate-spin" />
              <Scan className="w-8 h-8 text-[#C38A2E]" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#1C1C19] font-serif">
                {scanStep === 'detecting' && 'Detecting document borders & page orientation...'}
                {scanStep === 'ocr' && `Extracting clauses across ${detectedPages} pages...`}
                {scanStep === 'flagging' && 'Cross-referencing Maharashtra property risk clauses...'}
                {scanStep === 'completed' && 'Analysis complete! Generating citizen summary...'}
              </div>
              <p className="text-xs text-[#6F6D65]">
                {scanStep === 'flagging'
                  ? 'Analyzing encumbrance, possession delays, and indemnity limitations...'
                  : 'Preserving original clause wording alongside plain explanations'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#E8E4D9] h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full bg-[#C38A2E] transition-all duration-700"
                style={{
                  width:
                    scanStep === 'detecting'
                      ? '25%'
                      : scanStep === 'ocr'
                      ? '55%'
                      : scanStep === 'flagging'
                      ? '85%'
                      : '100%',
                }}
              />
            </div>
          </div>
        ) : (
          /* Standard Ingestion Form */
          <div className="space-y-4">
            {/* Input Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3F0E8] rounded-lg border border-[#DDD9CE] text-xs font-medium">
              <button
                onClick={() => setActiveMode('upload')}
                className={`py-2 rounded flex items-center justify-center gap-1.5 transition-all ${
                  activeMode === 'upload'
                    ? 'bg-[#FCFBF7] text-[#1C1C19] shadow-xs'
                    : 'text-[#6F6D65]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF Document</span>
              </button>
              <button
                onClick={() => setActiveMode('camera')}
                className={`py-2 rounded flex items-center justify-center gap-1.5 transition-all ${
                  activeMode === 'camera'
                    ? 'bg-[#FCFBF7] text-[#1C1C19] shadow-xs'
                    : 'text-[#6F6D65]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photograph Pages</span>
              </button>
            </div>

            {activeMode === 'upload' ? (
              <div
                onClick={() =>
                  startScanningSimulation('Sale Deed — Revised Draft v2.2 (Pune)')
                }
                className="border-2 border-dashed border-[#C9C4B7] hover:border-[#171714] rounded-lg p-8 text-center bg-[#F7F4EC]/50 hover:bg-[#F7F4EC] transition-all cursor-pointer space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#FCFBF7] border border-[#DDD9CE] flex items-center justify-center mx-auto text-[#C38A2E]">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#1C1C19] block">
                    Click to select Sale Deed or Agreement to Sell (PDF)
                  </span>
                  <span className="text-[11px] text-[#96938A] mt-0.5 block">
                    Supports stamped e-registration deeds, agreements, or drafts up to 50 pages
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() =>
                  startScanningSimulation('Captured Deed Pages (Camera OCR)')
                }
                className="border-2 border-dashed border-[#C9C4B7] hover:border-[#171714] rounded-lg p-8 text-center bg-[#F7F4EC]/50 hover:bg-[#F7F4EC] transition-all cursor-pointer space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#FCFBF7] border border-[#DDD9CE] flex items-center justify-center mx-auto text-[#171714]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#1C1C19] block">
                    Open Camera to photograph document page-by-page
                  </span>
                  <span className="text-[11px] text-[#96938A] mt-0.5 block">
                    Automatic page edge detection & high-contrast shadow removal
                  </span>
                </div>
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="pt-2 border-t border-[#F3F0E8] space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#96938A] font-mono block">
                Or inspect a sample document:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    startScanningSimulation('Sale Deed — Flat 402, Kalyani Nagar')
                  }
                  className="p-2.5 bg-[#F7F4EC] hover:bg-[#F2E6C9] rounded border border-[#DDD9CE] text-left text-xs transition-colors"
                >
                  <div className="font-semibold text-[#1C1C19]">
                    Flat 402, Kalyani Nagar
                  </div>
                  <div className="text-[10px] text-[#6F6D65]">
                    18 pages · 7 flagged risk clauses
                  </div>
                </button>
                <button
                  onClick={() =>
                    startScanningSimulation('Agreement to Sell — Hinjawadi Phase 1')
                  }
                  className="p-2.5 bg-[#F7F4EC] hover:bg-[#F2E6C9] rounded border border-[#DDD9CE] text-left text-xs transition-colors"
                >
                  <div className="font-semibold text-[#1C1C19]">
                    Hinjawadi Resale Agreement
                  </div>
                  <div className="text-[10px] text-[#6F6D65]">
                    12 pages · RERA builder clauses
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
