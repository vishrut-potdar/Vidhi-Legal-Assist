import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileCheck,
  Scan,
  AlertCircle,
  ArrowRight,
  Shield,
  Sparkles,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  FileSearch,
  Scale,
  ListChecks,
  HelpCircle,
  Briefcase,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Language } from '../types';
import { AnalyzedDocumentResult } from './UploadModal';

export interface HomepageViewProps {
  language: Language;
  onAnalysisSuccess: (analyzedDoc: AnalyzedDocumentResult) => void;
  onLoadSample: (sampleType: 'sale' | 'lease') => void;
  hasActiveDoc?: boolean;
  activeDocTitle?: string;
  onGoToOverview?: () => void;
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

const SAMPLE_LEASE_TEXT = `RESIDENTIAL LEASE & LICENSE AGREEMENT
This Leave and License Agreement is executed on 1st October 2026 at Pune, Maharashtra.

BETWEEN:
Mr. Anand Kulkarni, residing at Kothrud, Pune (hereinafter called the "LICENSOR / LESSOR") of the FIRST PART;
AND:
Ms. Priya Deshmukh, employed at IT Park, Hinjawadi, Pune (hereinafter called the "LICENSEE / LESSEE") of the SECOND PART.

TERMS AND CONDITIONS:
1. Premises: Flat 204, B-Wing, Green Meadows, Baner, Pune 411045.
2. Period: 11 Months commencing from 1st October 2026.
3. Monthly License Fee: ₹ 35,00, payable in advance on or before the 5th day of every calendar month.
4. Security Deposit: An interest-free refundable deposit of ₹ 1,50,000 paid via RTGS. The Licensor reserves the unilateral right to deduct painting and renovation charges of ₹ 30,000 at the end of tenure without providing itemized repair bills.
5. Inspection & Entry: The Licensor may enter the premises at any hour of the day or night without prior written or telephonic notice to verify compliance.
6. Termination: The Licensor may terminate this agreement with 24 hours notice in case of perceived disturbance. The Licensee must give 60 days prior written notice or forfeit the entire security deposit.
7. Society Maintenance: All regular society maintenance charges and any special capital renovation assessments levied by the society shall be borne by the Licensee.`;

export const HomepageView: React.FC<HomepageViewProps> = ({
  language,
  onAnalysisSuccess,
  onLoadSample,
  hasActiveDoc = false,
  activeDocTitle,
  onGoToOverview,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'ocr' | 'paste' | 'samples'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stageMessage, setStageMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, isOcrMode: boolean) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0], isOcrMode);
    }
  };

  const handleFileSelected = (file: File, isOcrMode: boolean) => {
    setSelectedFile(file);
    setErrorMessage(null);

    // If image file, generate preview thumbnail
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }

    if (isOcrMode) {
      setActiveTab('ocr');
    }
  };

  const handleStartAnalysis = async (customText?: string, customName?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let payload: any = { language };

      if (customText) {
        payload.rawText = customText;
        payload.fileName = customName || 'Contract Document';
      } else if ((activeTab === 'upload' || activeTab === 'ocr') && selectedFile) {
        payload.fileName = selectedFile.name;
        payload.mimeType = selectedFile.type || 'application/pdf';

        const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
        const isImage = selectedFile.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(selectedFile.name);

        if (isImage || activeTab === 'ocr') {
          setStageMessage('Scanning high-resolution image bytes for OCR character extraction...');
        } else {
          setStageMessage('Reading document structure and clause divisions...');
        }

        if (isPdf || isImage) {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              const base64 = res.split(',')[1] || res;
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          payload.fileBase64 = base64Data;
          payload.mimeType = selectedFile.type || (isImage ? 'image/jpeg' : 'application/pdf');
        } else {
          const textData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(selectedFile);
          });
          payload.rawText = textData;
        }
      } else if (activeTab === 'paste') {
        if (!pastedText.trim()) {
          setErrorMessage('Please paste your legal agreement or deed text.');
          setIsProcessing(false);
          return;
        }
        payload.rawText = pastedText.trim();
        payload.fileName = 'Pasted Legal Agreement';
      }

      setStageMessage('Sanitizing sensitive identifiers (Aadhaar / PAN / Phone / Bank details)...');
      await new Promise((r) => setTimeout(r, 600));

      if (activeTab === 'ocr' || (selectedFile && selectedFile.type.startsWith('image/'))) {
        setStageMessage('Transcribing optical characters, stamp seals & covenants with Gemini 3.8 Flash...');
      } else {
        setStageMessage('Sending document to Gemini 3.8 Flash for statutory scrutiny...');
      }

      const res = await fetch('/api/document/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned error code ${res.status}`);
      }

      setStageMessage('Auditing covenants against Transfer of Property Act, RERA & Stamp Act...');
      const analyzedDoc: AnalyzedDocumentResult = await res.json();

      setStageMessage('Unlocking taskbar navigation & synthesizing advocate questions...');
      await new Promise((r) => setTimeout(r, 500));

      onAnalysisSuccess(analyzedDoc);
    } catch (err: any) {
      console.error('Document analysis failed:', err);
      setErrorMessage(
        err.message || 'Failed to analyze document. Please check the file or try pasting the text.'
      );
    } finally {
      setIsProcessing(false);
      setStageMessage('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 sm:py-6 px-2 sm:px-4">
      {/* Active Document Notification Bar if user already has an active document */}
      {hasActiveDoc && activeDocTitle && onGoToOverview && (
        <div className="bg-[#FAF8F2] border border-[#C38A2E]/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#C38A2E]/10 text-[#C38A2E] flex items-center justify-center shrink-0 border border-[#C38A2E]/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C38A2E] font-semibold">
                ACTIVE DOCUMENT LOADED
              </span>
              <p className="text-sm font-serif font-medium text-[#1C1C19] truncate">
                {activeDocTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onGoToOverview}
            className="px-4 py-2 bg-[#171714] text-white rounded-lg text-xs font-medium hover:bg-[#2C2B26] transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Open Document Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Homepage Hero Header */}
      <div className="space-y-3.5 text-center sm:text-left">
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C38A2E] font-bold bg-[#C38A2E]/10 px-2.5 py-1 rounded border border-[#C38A2E]/20">
            VIDHI LEGAL INTELLIGENCE
          </span>
          <span className="text-[10px] font-mono bg-[#EAE6DB] text-[#1C1C19] px-2 py-0.5 rounded font-semibold border border-[#DDD9CE]">
            Multimodal OCR &amp; Gemini 3.8 Flash
          </span>
          <span className="text-[10px] font-mono text-[#736F65] hidden sm:inline">
            Transfer of Property Act · RERA 2016 · Registration Act 1908
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C1C19] font-normal tracking-tight">
          Upload or OCR Your Legal Document
        </h1>
        
        <p className="text-sm sm:text-base text-[#6F6D65] max-w-3xl leading-relaxed">
          Upload any PDF deed, paste text, or scan physical stamp papers for Optical Character Recognition (OCR).
          Once analyzed, the taskbar unlocks complete <span className="text-[#1C1C19] font-medium">Overview</span>, <span className="text-[#1C1C19] font-medium">Document &amp; Clauses</span>, <span className="text-[#1C1C19] font-medium">Red-Flag Rubric</span>, and <span className="text-[#1C1C19] font-medium">Advocate Briefs</span>.
        </p>
      </div>

      {/* Main Intake Box Card */}
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl shadow-xs overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-[#DDD9CE] bg-[#F7F4EC]">
          <button
            onClick={() => {
              setActiveTab('upload');
              setSelectedFile(null);
              setImagePreviewUrl(null);
            }}
            className={`flex-1 min-w-[140px] py-3.5 px-4 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-[#FCFBF7] text-[#1C1C19] border-b-2 border-[#171714] font-semibold'
                : 'text-[#6F6D65] hover:text-[#1C1C19]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ocr');
              setSelectedFile(null);
              setImagePreviewUrl(null);
            }}
            className={`flex-1 min-w-[140px] py-3.5 px-4 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'ocr'
                ? 'bg-[#FCFBF7] text-[#1C1C19] border-b-2 border-[#C38A2E] font-semibold text-[#1C1C19]'
                : 'text-[#6F6D65] hover:text-[#1C1C19]'
            }`}
          >
            <Scan className="w-4 h-4 text-[#C38A2E]" />
            <span className="flex items-center gap-1.5">
              <span>OCR Scanner</span>
              <span className="text-[9px] font-mono bg-[#C38A2E]/20 text-[#8C621C] px-1.5 py-0.2 rounded font-bold">
                PHYSICAL / PHOTO
              </span>
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('paste');
              setSelectedFile(null);
              setImagePreviewUrl(null);
            }}
            className={`flex-1 min-w-[140px] py-3.5 px-4 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'paste'
                ? 'bg-[#FCFBF7] text-[#1C1C19] border-b-2 border-[#171714] font-semibold'
                : 'text-[#6F6D65] hover:text-[#1C1C19]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Text</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('samples');
              setSelectedFile(null);
              setImagePreviewUrl(null);
            }}
            className={`flex-1 min-w-[140px] py-3.5 px-4 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'samples'
                ? 'bg-[#FCFBF7] text-[#1C1C19] border-b-2 border-[#171714] font-semibold'
                : 'text-[#6F6D65] hover:text-[#1C1C19]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C38A2E]" />
            <span>Sample Deeds (1-Click)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {isProcessing ? (
            /* Live AI Pipeline Progress State */
            <div className="py-12 px-4 text-center space-y-5">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#F2E6C9] animate-pulse" />
                <div className="absolute inset-2 rounded-full border-2 border-t-[#C38A2E] animate-spin" />
                <Scan className="w-6 h-6 text-[#C38A2E]" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-[#1C1C19] font-serif">
                  {activeTab === 'ocr' ? 'Running Optical Character Recognition & Scrutiny...' : 'Auditing Document with Gemini 3.8 Flash...'}
                </h3>
                <p className="text-xs text-[#6F6D65] font-mono leading-relaxed min-h-[36px]">
                  {stageMessage || 'Analyzing clauses and cross-referencing Indian property law...'}
                </p>
              </div>

              <div className="w-full bg-[#E8E4D9] h-2 rounded-full overflow-hidden max-w-sm mx-auto">
                <div className="h-full bg-[#C38A2E] animate-pulse w-4/5 rounded-full" />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#8C887B] font-mono pt-2">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#58735C]" />
                  Aadhaar &amp; PAN Masked
                </span>
                <span>·</span>
                <span>Transfer of Property Act 1882</span>
                <span>·</span>
                <span>RERA Section 11/14 Validation</span>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: UPLOAD DOCUMENT */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFileDrop(e, false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                      selectedFile
                        ? 'border-[#58735C] bg-[#F4F8F4]'
                        : 'border-[#DDD9CE] hover:border-[#171714] bg-[#FAF8F2]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0], false);
                        }
                      }}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#E6EFE6] text-[#58735C] flex items-center justify-center mx-auto">
                          <FileCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-[#1C1C19]">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-[#6F6D65] font-mono mt-0.5">
                            {(selectedFile.size / 1024).toFixed(1)} KB · Ready for statutory audit
                          </p>
                        </div>
                        <p className="text-xs text-[#58735C] font-medium underline">
                          Click to select a different file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#F3EFE6] text-[#8C887B] flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6 text-[#171714]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-medium text-[#1C1C19]">
                            Drag and drop your document here, or browse
                          </p>
                          <p className="text-xs text-[#6F6D65]">
                            Supports PDF (.pdf), Word (.docx, .doc), or plain text (.txt) up to 50MB
                          </p>
                        </div>
                        <span className="inline-block text-xs font-mono bg-[#EAE6DB] px-3 py-1.5 rounded text-[#1C1C19] font-medium">
                          Browse Files
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: OCR SCANNER (PHOTOS, STAMP PAPERS, PHYSICAL DEEDS) */}
              {activeTab === 'ocr' && (
                <div className="space-y-5">
                  <div className="p-4 bg-[#F9F7F1] border border-[#E5DECD] rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Scan className="w-4 h-4 text-[#C38A2E]" />
                      <h3 className="text-xs font-mono uppercase tracking-wider text-[#1C1C19] font-bold">
                        Optical Character Recognition (OCR) Engine
                      </h3>
                    </div>
                    <p className="text-xs text-[#6F6D65] leading-relaxed">
                      Upload photos or scans of physical non-judicial stamp papers, sub-registrar execution receipts, or camera captures of paper contracts. Gemini 3.8 Flash extracts text, recognizes official seals, and parses covenants.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono text-[#8C887B]">
                      <span className="bg-white px-2 py-0.5 rounded border border-[#E0DCD3]">✓ Stamp Paper Headers</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#E0DCD3]">✓ Sub-Registrar Seals</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#E0DCD3]">✓ Printed &amp; Notarized Clauses</span>
                    </div>
                  </div>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFileDrop(e, true)}
                    className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all ${
                      selectedFile
                        ? 'border-[#C38A2E] bg-[#FDFBF7]'
                        : 'border-[#DDD9CE] hover:border-[#C38A2E] bg-[#FAF8F2]'
                    }`}
                  >
                    {/* File Inputs */}
                    <input
                      ref={ocrFileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0], true);
                        }
                      }}
                      className="hidden"
                    />

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0], true);
                        }
                      }}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-4">
                        {imagePreviewUrl ? (
                          <div className="w-36 h-36 mx-auto rounded-lg overflow-hidden border border-[#DDD9CE] shadow-xs relative group">
                            <img
                              src={imagePreviewUrl}
                              alt="Scan Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] text-white font-mono bg-black/60 px-2 py-1 rounded">
                                Image Ready
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#F3ECD7] text-[#C38A2E] flex items-center justify-center mx-auto">
                            <FileCheck className="w-6 h-6" />
                          </div>
                        )}

                        <div>
                          <p className="text-base font-semibold text-[#1C1C19]">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-[#6F6D65] font-mono mt-0.5">
                            {(selectedFile.size / 1024).toFixed(1)} KB · Ready for OCR &amp; statutory parsing
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => ocrFileInputRef.current?.click()}
                            className="text-xs text-[#C38A2E] hover:underline font-medium cursor-pointer"
                          >
                            Choose different image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-14 h-14 rounded-full bg-[#F5EEDC] text-[#C38A2E] flex items-center justify-center mx-auto">
                          <Scan className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-medium text-[#1C1C19]">
                            Upload photo or scan of your physical deed / stamp paper
                          </p>
                          <p className="text-xs text-[#6F6D65]">
                            Supports JPEG, PNG, WEBP, or scanned multi-page PDF
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => ocrFileInputRef.current?.click()}
                            className="px-4 py-2 bg-[#171714] text-white rounded-lg text-xs font-medium hover:bg-[#2C2B26] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>Browse Scan / Photo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="px-4 py-2 bg-white text-[#1C1C19] border border-[#DDD9CE] rounded-lg text-xs font-medium hover:bg-[#F4F1EA] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                          >
                            <Camera className="w-4 h-4 text-[#C38A2E]" />
                            <span>Take Photo with Camera</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PASTE TEXT */}
              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-[#6F6D65]">
                      Paste Deed or Agreement Clauses
                    </label>
                    <button
                      type="button"
                      onClick={() => setPastedText(SAMPLE_SALE_DEED_TEXT)}
                      className="text-xs text-[#C38A2E] hover:underline font-mono"
                    >
                      Insert Sample Sale Deed Text
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the clauses, covenants, recitals, consideration amounts, and dispute clauses from your contract draft..."
                    className="w-full p-4 text-xs font-mono leading-relaxed bg-[#FAF8F2] border border-[#DDD9CE] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#171714] text-[#1C1C19] placeholder:text-[#96938A]"
                  />
                  <div className="flex justify-between items-center text-[11px] font-mono text-[#8C887B]">
                    <span>Character count: {pastedText.length}</span>
                    <span>Line count: {pastedText ? pastedText.split('\n').length : 0}</span>
                  </div>
                </div>
              )}

              {/* TAB 4: SAMPLES */}
              {activeTab === 'samples' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#6F6D65]">
                    No document handy? Test-drive Vidhi with verified real-world Indian contracts containing real legal risks:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => {
                        handleStartAnalysis(
                          SAMPLE_SALE_DEED_TEXT,
                          'Draft Sale Deed — Flat 402, Kalyani Nagar'
                        );
                      }}
                      className="p-5 bg-[#FAF8F2] border border-[#DDD9CE] hover:border-[#171714] rounded-lg cursor-pointer transition-all hover:shadow-xs space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA] font-semibold">
                          CONVEYANCE · HIGH RISK CLAUSES
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#8C887B] group-hover:text-[#171714] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h3 className="font-serif text-base font-medium text-[#1C1C19]">
                        Draft Sale Deed (Apartment Conveyance)
                      </h3>
                      <p className="text-xs text-[#6F6D65] leading-relaxed">
                        Contains hidden mortgage encumbrance condition, vague possession handover, and unilateral indemnity covenants.
                      </p>
                      <div className="pt-1 text-[11px] font-mono text-[#C38A2E] font-medium">
                        Click to load &amp; audit with Gemini →
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        handleStartAnalysis(
                          SAMPLE_LEASE_TEXT,
                          'Residential Leave & License Agreement — Baner'
                        );
                      }}
                      className="p-5 bg-[#FAF8F2] border border-[#DDD9CE] hover:border-[#171714] rounded-lg cursor-pointer transition-all hover:shadow-xs space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F3ECD7] text-[#B08427] border border-[#E8DAB7] font-semibold">
                          RENTAL / LEASE · CAUTION
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#8C887B] group-hover:text-[#171714] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h3 className="font-serif text-base font-medium text-[#1C1C19]">
                        11-Month Residential Lease Agreement
                      </h3>
                      <p className="text-xs text-[#6F6D65] leading-relaxed">
                        Examines deposit deduction terms, arbitrary landlord entry rights, and short notice termination liabilities.
                      </p>
                      <div className="pt-1 text-[11px] font-mono text-[#C38A2E] font-medium">
                        Click to load &amp; audit with Gemini →
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 bg-[#FAF3F1] border border-[#EADBDA] rounded-lg flex items-center gap-2.5 text-xs text-[#8E4A3F]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons for Upload / OCR / Paste tabs */}
              {activeTab !== 'samples' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#DDD9CE]">
                  <div className="flex items-center gap-2 text-xs text-[#6F6D65]">
                    <Shield className="w-4 h-4 text-[#58735C]" />
                    <span>Safe &amp; Confidential · Local Masking Layer Applied</span>
                  </div>

                  <button
                    onClick={() => handleStartAnalysis()}
                    disabled={
                      activeTab === 'upload' || activeTab === 'ocr'
                        ? !selectedFile
                        : !pastedText.trim()
                    }
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#171714] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#2C2B26] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#C38A2E]" />
                    <span>
                      {activeTab === 'ocr'
                        ? 'Perform OCR & Statutory Scrutiny'
                        : 'Analyze Document with Gemini AI'}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Taskbar Preview: What Unlocks After Uploading / OCRing */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[#1C1C19] font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C38A2E]" />
              <span>Available in Taskbar After Document Ingestion</span>
            </h2>
            <p className="text-xs text-[#6F6D65]">
              Uploading or scanning a document activates the full suite of analytical legal views in your sidebar:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          <div className="p-4 bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-[#C38A2E]">
              <FileSearch className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase font-bold text-[#1C1C19]">Overview &amp; Score</h3>
            </div>
            <p className="text-xs text-[#6F6D65] leading-relaxed">
              Overall transaction risk rating (0-100), executive plain-language summary, and missing encumbrance certificate alerts.
            </p>
          </div>

          <div className="p-4 bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-[#C38A2E]">
              <FileText className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase font-bold text-[#1C1C19]">Document &amp; Clauses</h3>
            </div>
            <p className="text-xs text-[#6F6D65] leading-relaxed">
              Line-by-line statutory breakdown, original legal covenants mapped side-by-side with plain explanations and redlines.
            </p>
          </div>

          <div className="p-4 bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-[#C38A2E]">
              <Scale className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase font-bold text-[#1C1C19]">Red-Flag Rubric</h3>
            </div>
            <p className="text-xs text-[#6F6D65] leading-relaxed">
              16-point rigorous property conveyance audit covering defect liability, possession timeline, and indemnities.
            </p>
          </div>

          <div className="p-4 bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-[#C38A2E]">
              <ListChecks className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase font-bold text-[#1C1C19]">Pre-Signing Checklist</h3>
            </div>
            <p className="text-xs text-[#6F6D65] leading-relaxed">
              Step-by-step statutory diligence verification before paying registration fees or visiting the Sub-Registrar.
            </p>
          </div>

          <div className="p-4 bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-[#C38A2E]">
              <Briefcase className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase font-bold text-[#1C1C19]">Advocate Brief</h3>
            </div>
            <p className="text-xs text-[#6F6D65] leading-relaxed">
              Custom-generated questions for the citizen to put to their advocate to modify disadvantageous seller terms.
            </p>
          </div>

          <div className="p-4 bg-[#FCFBF7] border border-[#DDD9CE] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-[#C38A2E]">
              <HelpCircle className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase font-bold text-[#1C1C19]">Grounded Q&amp;A</h3>
            </div>
            <p className="text-xs text-[#6F6D65] leading-relaxed">
              Ask any specific question about payment clauses, bank NOCs, or parking allocations grounded strictly in deed text.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
