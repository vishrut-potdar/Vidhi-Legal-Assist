import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  FileCheck,
  Loader2,
  Scan,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Language } from '../types';
import { AnalysisProgress, PartialFinding } from './AnalysisProgress';
import { usePreferences } from '../context/PreferencesContext';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { AnalysisStage, analyzeDocumentStream, prepareUpload, UploadPayload } from '../utils/analyzeDocument';

export interface AnalyzedDocumentResult {
  id: string;
  documentInfo: any;
  summaryData: any;
  pages: any[];
  findings: any[];
  fullClauses: any[];
  missingDocuments: any[];
  extractedTextPreview?: string;
  processingNotes?: {
    aiMode: 'gemini' | 'offline';
    extractionMethod: string;
    piiRedactedCount: number;
    injectionAttempts: number;
    segmentCount: number;
    chunkCount: number;
    cachedClauses: number;
    language: Language;
    readingLevel: string;
    privacyNotes: string[];
    warnings: string[];
  };
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onUploadSuccess: (analyzedDoc: AnalyzedDocumentResult) => void;
}

const SAMPLE_SALE_DEED_TEXT = `DEED OF ABSOLUTE SALE
This Deed of Absolute Sale is made and executed on this 18th day of September 2026, at Pune, Maharashtra.

BETWEEN:
Shri Rajesh S. Verma, Indian Inhabitant, residing at Flat No. 12, Prathamesh Towers, Kalyani Nagar, Pune - 411006 (hereinafter referred to as the "VENDOR", which expression shall include his legal heirs, executors, and assigns) of the ONE PART;

AND:
Shri Rohan Sharma, Indian Inhabitant, residing at 404, Cypress Court, Viman Nagar, Pune - 411014 (hereinafter referred to as the "PURCHASER", which expression shall include his heirs and assigns) of the OTHER PART.

WHEREAS the Vendor is seized and possessed of all that piece and parcel of residential premises bearing Flat No. 402, 4th Floor, Gulmohar Enclave CHSL, Kalyani Nagar, Pune 411006.

NOW THIS DEED WITNESSETH AS FOLLOWS:
1. Consideration: The total consideration agreed between the parties is ₹ 86,00,000 (Rupees Eighty Six Lakhs only), out of which ₹ 15,00,000 has been paid as earnest money.
2. Title & Encumbrance: The property is subject to an outstanding housing mortgage with State Bank of India. The Purchaser agrees to disburse the balance amount of ₹ 71,00,000 to the Vendor directly, without requiring prior clearance of the bank mortgage or production of original title deeds at registration.
3. Possession: The Vendor shall deliver physical vacant possession of Flat No. 402 in due course after the completion of registration, subject to the Vendor finding alternative accommodation. Time shall not be of the essence for possession handover.
4. Outgoings & Taxes: Property taxes and society dues prior to the date of execution shall be adjusted mutually within six months post-registration.
5. Defect Liability: The Purchaser takes the property on an 'as-is, where-is' condition. The Vendor's liability for structural or latent defects is limited to 12 months, after which no claims shall be entertained.
6. Indemnity: The Purchaser shall indemnify and hold harmless the Vendor against all third-party disputes, including family succession claims or past municipal tax assessments.
7. Dispute Resolution: Any dispute arising from this Deed shall be referred to sole arbitration in Mumbai, and all costs of arbitration shall be borne solely by the Purchaser.`;

const SAMPLE_LEASE_TEXT = `RESIDENTIAL LEASE AGREEMENT
This Leave and License Agreement is executed on 1st October 2026 at Pune, Maharashtra.

BETWEEN:
Mr. Anand Kulkarni, residing at Kothrud, Pune (hereinafter called the "LICENSOR / LESSOR") of the FIRST PART;
AND:
Ms. Priya Deshmukh, employed at IT Park, Hinjawadi, Pune (hereinafter called the "LICENSEE / LESSEE") of the SECOND PART.

TERMS AND CONDITIONS:
1. Premises: Flat 204, B-Wing, Green Meadows, Baner, Pune 411045.
2. Period: 11 Months commencing from 1st October 2026.
3. Monthly License Fee: ₹ 35,000 per month, payable in advance on or before the 5th day of every calendar month.
4. Security Deposit: An interest-free refundable deposit of ₹ 1,50,000 paid via RTGS. The Licensor reserves the unilateral right to deduct painting and renovation charges of ₹ 30,000 at the end of tenure without providing itemized repair bills.
5. Inspection & Entry: The Licensor may enter the premises at any hour of the day or night without prior written or telephonic notice to verify compliance.
6. Termination: The Licensor may terminate this agreement with 24 hours notice in case of perceived disturbance. The Licensee must give 60 days prior written notice or forfeit the entire security deposit.
7. Society Maintenance: All regular society maintenance charges and any special capital renovation assessments levied by the society shall be borne by the Licensee.`;

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  language,
  onUploadSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste' | 'samples'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [stage, setStage] = useState<AnalysisStage>('parsing');
  const [progress, setProgress] = useState<number>(0);
  const [partials, setPartials] = useState<PartialFinding[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { readingLevel } = usePreferences();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, () => {
    if (!isProcessing) onClose();
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleDropZoneKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const runAnalysis = async (customPayload?: { rawText?: string; fileName?: string }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStage('parsing');
    setProgress(2);
    setPartials([]);
    setProcessingStage('Preparing document…');
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let payload: UploadPayload;
      if (customPayload) {
        payload = { rawText: customPayload.rawText, fileName: customPayload.fileName || 'Pasted Legal Document' };
      } else if (activeTab === 'file' && selectedFile) {
        payload = await prepareUpload(selectedFile);
      } else if (activeTab === 'paste' && pastedText.trim()) {
        payload = { rawText: pastedText.trim(), fileName: 'Pasted Contract Draft' };
      } else {
        setErrorMessage('Please choose a file or paste legal deed or contract text to analyze.');
        return;
      }

      const analyzedDoc = await analyzeDocumentStream(
        { ...payload, language, readingLevel },
        (event) => {
          if (event.type === 'stage') {
            setStage(event.stage);
            setProgress(event.progress);
            setProcessingStage(event.message);
          } else if (event.type === 'partial') {
            setPartials((prev) => [...prev, { clauseNumber: event.clauseNumber, title: event.title, riskLevel: event.riskLevel }]);
          }
        },
        controller.signal
      );

      // Drop local copies once analysis is complete.
      setSelectedFile(null);
      setPastedText('');
      onUploadSuccess(analyzedDoc);
      onClose();
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setErrorMessage('Analysis cancelled.');
      } else {
        console.error('Document analysis failed:', err);
        setErrorMessage(err?.message || 'Failed to analyze document. Please check the file or try pasting contract text.');
      }
    } finally {
      abortRef.current = null;
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-dialog-title"
        tabIndex={-1}
        className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-t-xl sm:rounded-xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5 relative text-[#1C1C19]"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F3F0E8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C38A2E] font-mono">
                REAL DOCUMENT INGESTION
              </span>
              <span className="text-[10px] font-mono bg-[#EAE6DB] px-1.5 py-0.2 rounded text-[#1C1C19]">
                Gemini 3.8 Flash
              </span>
            </div>
            <h2 id="upload-dialog-title" className="text-lg font-semibold text-[#1C1C19] font-serif mt-0.5">
              Analyze a Legal Document
            </h2>
            <p className="text-xs text-[#6F6D65]">
              Upload a PDF, Word file or photo, or paste agreement text for instant statutory scrutiny.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close upload dialog"
            className="p-2 rounded-md text-[#96938A] hover:text-[#1C1C19] hover:bg-[#F3F0E8] disabled:opacity-50"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Live Processing State */}
        {isProcessing ? (
          <AnalysisProgress
            stage={stage}
            message={processingStage}
            progress={progress}
            partials={partials}
            onCancel={() => abortRef.current?.abort()}
          />
        ) : (
          /* Normal Ingestion Interface */
          <div className="space-y-4">
            {/* Tabs */}
            <div role="tablist" aria-label="Ways to add a document" className="grid grid-cols-3 gap-1.5 p-1 bg-[#F3F0E8] rounded-lg border border-[#DDD9CE] text-xs font-medium">
              <button
                role="tab"
                aria-selected={activeTab === 'file'}
                onClick={() => setActiveTab('file')}
                className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'file'
                    ? 'bg-[#FCFBF7] text-[#1C1C19] shadow-xs font-semibold'
                    : 'text-[#6F6D65]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF / File</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'paste'}
                onClick={() => setActiveTab('paste')}
                className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'paste'
                    ? 'bg-[#FCFBF7] text-[#1C1C19] shadow-xs font-semibold'
                    : 'text-[#6F6D65]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Contract Text</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'samples'}
                onClick={() => setActiveTab('samples')}
                className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'samples'
                    ? 'bg-[#FCFBF7] text-[#1C1C19] shadow-xs font-semibold'
                    : 'text-[#6F6D65]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Quick Presets</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div role="alert" className="p-3 bg-[#FAF3F1] border border-[#EADBDA] rounded-lg text-xs text-[#8E4A3F] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: File Upload */}
            {activeTab === 'file' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.docx,image/*"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                />

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={handleDropZoneKey}
                  role="button"
                  tabIndex={0}
                  aria-label={selectedFile ? `Selected ${selectedFile.name}. Press to choose a different file` : 'Choose a file to analyze'}
                  className="border-2 border-dashed border-[#C9C4B7] hover:border-[#171714] rounded-lg p-7 text-center bg-[#F7F4EC]/40 hover:bg-[#F7F4EC] transition-all cursor-pointer space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FCFBF7] border border-[#DDD9CE] flex items-center justify-center mx-auto text-[#C38A2E]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#1C1C19] block">
                      {selectedFile ? selectedFile.name : 'Click to choose PDF or drag & drop here'}
                    </span>
                    <span className="text-[11px] text-[#8C887B] mt-0.5 block font-mono">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB · Ready to analyze`
                        : 'PDF, Word (.docx), text, or a photo of the document (OCR) · up to 12 MB'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={onClose}
                    className="px-3.5 py-1.5 rounded border border-[#DDD9CE] text-xs font-medium text-[#6F6D65] hover:text-[#1C1C19]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => runAnalysis()}
                    disabled={!selectedFile}
                    className="px-4 py-1.5 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26] transition-colors shadow-xs disabled:opacity-40"
                  >
                    Analyze with Vidhi AI →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Direct Paste */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <textarea
                  aria-label="Paste contract text"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste legal contract text, clauses, or draft agreement here (e.g., Sale Deed, Lease Agreement, Builder-Buyer Agreement)..."
                  rows={8}
                  className="w-full text-xs font-mono p-3 rounded-lg border border-[#C9C4B7] bg-white text-[#1C1C19] focus:outline-none focus:ring-1 focus:ring-[#171714] leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C887B]">
                  <span>{pastedText.length} characters</span>
                  <button
                    onClick={() => runAnalysis()}
                    disabled={!pastedText.trim()}
                    className="px-4 py-1.5 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26] transition-colors shadow-xs disabled:opacity-40"
                  >
                    Analyze Text with Vidhi AI →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Sample Presets */}
            {activeTab === 'samples' && (
              <div className="space-y-3">
                <p className="text-xs text-[#6F6D65]">
                  Select a pre-formatted legal document to immediately test statutory scrutiny:
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      runAnalysis({
                        rawText: SAMPLE_SALE_DEED_TEXT,
                        fileName: 'Sale Deed — Flat 402, Kalyani Nagar',
                      })
                    }
                    className="w-full text-left p-3 bg-[#F7F4EC] hover:bg-[#F2E6C9] rounded-lg border border-[#DDD9CE] cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1C1C19]">
                        Maharashtra Property Sale Deed (Resale Flat)
                      </span>
                      <span className="text-[10px] font-mono bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA] px-2 py-0.5 rounded font-bold">
                        3 High Risks
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6F6D65]">
                      Flat 402, Kalyani Nagar, Pune · ₹86 Lakhs · Contains unreleased bank mortgage &amp; vague possession clauses.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      runAnalysis({
                        rawText: SAMPLE_LEASE_TEXT,
                        fileName: 'Leave and License Agreement — Baner Flat',
                      })
                    }
                    className="w-full text-left p-3 bg-[#F7F4EC] hover:bg-[#F2E6C9] rounded-lg border border-[#DDD9CE] cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1C1C19]">
                        11-Month Residential Rent Agreement (Leave &amp; License)
                      </span>
                      <span className="text-[10px] font-mono bg-[#F9F5EC] text-[#B08427] border border-[#EADFC7] px-2 py-0.5 rounded font-bold">
                        Caution
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6F6D65]">
                      Flat 204, Baner, Pune · ₹35,000/mo · Contains unfair deposit deductions and 24-hr unilateral termination.
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
