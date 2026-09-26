import React, { useState } from 'react';
import {
  FileText,
  Printer,
  ChevronLeft,
  Info,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { Finding, Language, DocumentInfo, DocumentAnnotation } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';
import { SourceSpanCitation } from './SourceSpanCitation';
import { UncertaintyBadge } from './UncertaintyBadge';

interface AdvocateBriefViewProps {
  findings: Finding[];
  documentInfo: DocumentInfo;
  language: Language;
  onBack: () => void;
  onToggleBrief: (findingId: string) => void;
  annotations?: DocumentAnnotation[];
}

export const AdvocateBriefView: React.FC<AdvocateBriefViewProps> = ({
  findings,
  documentInfo,
  language,
  onBack,
  onToggleBrief,
  annotations = [],
}) => {
  const activeFindings = findings.filter((f) => f.inAdvocateBrief);
  const [briefLanguage, setBriefLanguage] = useState<'EN' | 'HI' | 'MR'>(
    (language as 'EN' | 'HI' | 'MR') || 'EN'
  );
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<'ALL' | 'QUESTIONS' | 'CHRONOLOGY' | 'POINTS'>('ALL');

  const handlePrint = () => {
    window.print();
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionInput.trim()) return;
    setCustomQuestions([...customQuestions, newQuestionInput.trim()]);
    setNewQuestionInput('');
    setShowAddForm(false);
  };

  const handleRemoveCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#6F6D65] hover:text-[#1C1C19] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Document Review</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Language Toggle for Brief */}
          <div className="inline-flex rounded-md p-0.5 bg-[#EAE6DB] border border-[#DDD9CE] text-xs">
            <button
              onClick={() => setBriefLanguage('EN')}
              className={`px-2.5 py-1 rounded transition-all font-medium ${
                briefLanguage === 'EN'
                  ? 'bg-white text-[#171714] shadow-xs'
                  : 'text-[#6F6D65] hover:text-[#171714]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setBriefLanguage('HI')}
              className={`px-2.5 py-1 rounded transition-all font-medium ${
                briefLanguage === 'HI'
                  ? 'bg-white text-[#171714] shadow-xs'
                  : 'text-[#6F6D65] hover:text-[#171714]'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setBriefLanguage('MR')}
              className={`px-2.5 py-1 rounded transition-all font-medium ${
                briefLanguage === 'MR'
                  ? 'bg-white text-[#171714] shadow-xs'
                  : 'text-[#6F6D65] hover:text-[#171714]'
              }`}
            >
              मराठी
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs md:text-sm font-medium bg-[#171714] text-[#F7F5EF] rounded-md hover:bg-[#2C2B26] transition-colors shadow-xs flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <div className="no-print">
        <DisclaimerBanner language={language} />
      </div>

      {/* Dossier Filter Tabs (Hidden on print) */}
      <div className="no-print flex items-center justify-between bg-[#FCFBF7] border border-[#DDD9CE] p-3 rounded-lg text-xs">
        <span className="font-mono text-[#6F6D65] text-[11px] font-semibold">
          STRUCTURED INTAKE DOSSIER SECTIONS:
        </span>
        <div className="inline-flex rounded-md p-0.5 bg-[#EAE6DB] border border-[#DDD9CE]">
          <button
            onClick={() => setActiveDossierTab('ALL')}
            className={`px-3 py-1 rounded transition-all font-medium ${
              activeDossierTab === 'ALL'
                ? 'bg-white text-[#171714] shadow-xs'
                : 'text-[#6F6D65] hover:text-[#171714]'
            }`}
          >
            Complete Dossier (All 3 Parts)
          </button>
          <button
            onClick={() => setActiveDossierTab('CHRONOLOGY')}
            className={`px-3 py-1 rounded transition-all font-medium ${
              activeDossierTab === 'CHRONOLOGY'
                ? 'bg-white text-[#171714] shadow-xs'
                : 'text-[#6F6D65] hover:text-[#171714]'
            }`}
          >
            Part I: Chronology
          </button>
          <button
            onClick={() => setActiveDossierTab('POINTS')}
            className={`px-3 py-1 rounded transition-all font-medium ${
              activeDossierTab === 'POINTS'
                ? 'bg-white text-[#171714] shadow-xs'
                : 'text-[#6F6D65] hover:text-[#171714]'
            }`}
          >
            Part II: Admitted vs Contested
          </button>
          <button
            onClick={() => setActiveDossierTab('QUESTIONS')}
            className={`px-3 py-1 rounded transition-all font-medium ${
              activeDossierTab === 'QUESTIONS'
                ? 'bg-white text-[#171714] shadow-xs'
                : 'text-[#6F6D65] hover:text-[#171714]'
            }`}
          >
            Part III: Questions for Counsel ({activeFindings.length})
          </button>
        </div>
      </div>

      {/* The Printable Dossier Sheet */}
      <div className="bg-[#FFFFFF] border border-[#DDD9CE] rounded-lg p-6 md:p-10 shadow-sm text-[#1C1C19] space-y-7 print:border-0 print:p-0 print:shadow-none">
        {/* Document Matter Header */}
        <div className="border-b-2 border-[#171714] pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg tracking-wider text-[#171714]">
                VIDHI
              </span>
              <span className="text-xs font-mono uppercase bg-[#F3ECD7] text-[#B08427] px-2 py-0.5 rounded font-semibold">
                Advocate Consultation Dossier
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-serif text-[#1C1C19] mt-1">
              {briefLanguage === 'HI'
                ? 'वकील परामर्श संरचित डोजियर'
                : 'Legal Professional Intake Brief & Dossier'}
            </h1>
            <p className="text-xs text-[#6F6D65] mt-0.5">
              Subject: {documentInfo.title} · {documentInfo.property}
            </p>
          </div>

          <div className="text-right text-xs font-mono text-[#6F6D65] space-y-0.5">
            <div>CONSULTATION: 14 SEP 2026</div>
            <div>SUB-REGISTRAR: 19 SEP 2026</div>
            <div className="font-bold text-[#B44738]">
              {activeFindings.length} COUNSEL QUESTIONS
            </div>
          </div>
        </div>

        {/* Framing Notice (Neutral client briefing) */}
        <div className="p-3 bg-[#F7F4EC] rounded border border-[#DDD9CE] text-xs text-[#6F6D65] leading-relaxed">
          <strong className="text-[#1C1C19]">Counsel Intake Instructions: </strong>
          This structured brief compiles the factual chronology, agreed vs. contested terms, and specific textual queries on Draft v2.1 for Flat 402, Kalyani Nagar. Prepared by citizen purchaser for advice and counter-drafting prior to stamp registration.
        </div>

        {/* PART I: CHRONOLOGY OF THE MATTER */}
        {(activeDossierTab === 'ALL' || activeDossierTab === 'CHRONOLOGY') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#DDD9CE] pb-1.5">
              <h2 className="font-mono text-xs font-bold text-[#1C1C19] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8C621E]" />
                Part I: Chronology of the Matter
              </h2>
              <span className="text-[10px] font-mono text-[#6F6D65]">FACTUAL SEQUENCE</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded bg-[#FAF8F5] border border-[#EFECE3]">
                <span className="font-mono font-bold text-[#8C621E] w-24 shrink-0">14 Aug 2026</span>
                <div className="space-y-0.5">
                  <strong className="text-[#1C1C19] block">Preliminary Agreement to Sell Executed</strong>
                  <p className="text-[#6F6D65]">
                    Parties agreed on total consideration of ₹86,00,000. Purchaser paid ₹8,60,000 (10%) as earnest deposit via RTGS.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded bg-[#FAF8F5] border border-[#EFECE3]">
                <span className="font-mono font-bold text-[#8C621E] w-24 shrink-0">02 Sep 2026</span>
                <div className="space-y-0.5">
                  <strong className="text-[#1C1C19] block">Draft Sale Deed v2.1 Received from Vendor Broker</strong>
                  <p className="text-[#6F6D65]">
                    Broker forwarded 18-page conveyance draft. Text contained unlinked balance payment and missing Schedule III.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded bg-[#FAF8F5] border border-[#EFECE3]">
                <span className="font-mono font-bold text-[#8C621E] w-24 shrink-0">08 Sep 2026</span>
                <div className="space-y-0.5">
                  <strong className="text-[#1C1C19] block">Online Sub-Registrar &amp; IGR Search Completed</strong>
                  <p className="text-[#6F6D65]">
                    Index II search indicates an undischarged mortgage charge registered by State Bank of India against Flat 402.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded bg-[#FAF8F5] border border-[#EFECE3]">
                <span className="font-mono font-bold text-[#8C621E] w-24 shrink-0">14 Sep 2026</span>
                <div className="space-y-0.5">
                  <strong className="text-[#1C1C19] block">Advocate Consultation &amp; Redline Mark-up (TODAY)</strong>
                  <p className="text-[#6F6D65]">
                    Reviewing draft with counsel to issue formal redline amendments to vendor prior to execution.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded bg-[#FAF8F5] border border-[#EFECE3]">
                <span className="font-mono font-bold text-[#8E4A3F] w-24 shrink-0">19 Sep 2026</span>
                <div className="space-y-0.5">
                  <strong className="text-[#1C1C19] block">Scheduled Execution at Sub-Registrar Haveli No. 12</strong>
                  <p className="text-[#6F6D65]">
                    Target date for stamp duty payment, biometric thumb verification, and simultaneous key handover.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PART II: ADMITTED FACTS VS. CONTESTED / FLAGGED POINTS */}
        {(activeDossierTab === 'ALL' || activeDossierTab === 'POINTS') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#DDD9CE] pb-1.5">
              <h2 className="font-mono text-xs font-bold text-[#1C1C19] uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#8C621E]" />
                Part II: Admitted Facts vs. Contested / Flagged Points
              </h2>
              <span className="text-[10px] font-mono text-[#6F6D65]">MUTUAL BARGAIN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Admitted Facts */}
              <div className="p-4 bg-[#F0F5F0] border border-[#D5E2D5] rounded-lg space-y-2">
                <span className="font-mono font-bold text-[#58735C] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Admitted / Undisputed Terms
                </span>
                <ul className="space-y-1.5 text-[#3A4E3E]">
                  <li>• Total agreed sale price is ₹86,00,000 (Rupees Eighty-Six Lakhs).</li>
                  <li>• ₹8,60,000 (10%) earnest deposit admitted as received via RTGS.</li>
                  <li>• Subject property: Flat 402 (1,120 sq ft) with one stilt car parking space.</li>
                  <li>• Vendor agrees to clear all municipal PMC taxes and utility bills up to date of deed.</li>
                  <li>• Jurisdiction &amp; dispute seat agreed at Pune, Maharashtra.</li>
                </ul>
              </div>

              {/* Contested / Flagged Points */}
              <div className="p-4 bg-[#FAF3F1] border border-[#EADBDA] rounded-lg space-y-2">
                <span className="font-mono font-bold text-[#8E4A3F] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Contested Points for Counsel Modification
                </span>
                <ul className="space-y-1.5 text-[#733A31]">
                  <li>• <strong>Clause 4:</strong> Compels ₹86L payment even if SBI loan charge is undischarged.</li>
                  <li>• <strong>Clause 6:</strong> "Reasonable time" for possession while shifting maintenance immediately.</li>
                  <li>• <strong>Clause 5:</strong> Schedule III (encumbrance exceptions) is missing from the draft.</li>
                  <li>• <strong>Clause 11:</strong> Second co-owner is not executing or providing Power of Attorney.</li>
                  <li>• <strong>Clause 16:</strong> 12-month restriction placed on title indemnity.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PART III: SPECIFIC QUESTIONS FOR COUNSEL */}
        {(activeDossierTab === 'ALL' || activeDossierTab === 'QUESTIONS') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDD9CE] pb-1.5">
              <h2 className="font-mono text-xs font-bold text-[#1C1C19] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#8C621E]" />
                Part III: Specific Questions for Counsel Modification
              </h2>
              <span className="text-[10px] font-mono text-[#6F6D65]">
                {activeFindings.length} QUERIES PREPARED
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {activeFindings.length === 0 ? (
                <div className="py-8 text-center text-[#96938A] text-xs">
                  No questions currently added. Return to the document review to add flagged clauses.
                </div>
              ) : (
                activeFindings.map((finding, idx) => {
                  const numStr = (idx + 1).toString().padStart(2, '0');
                  const isHigh = finding.severity === 'HIGH';

                  return (
                    <div
                      key={finding.id}
                      className="p-4 rounded-md border border-[#DDD9CE] bg-[#FCFBF7] space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#C38A2E]">
                            {numStr}
                          </span>
                          <span
                            className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                              isHigh
                                ? 'bg-[#F5E3DE] text-[#B44738]'
                                : 'bg-[#F3ECD7] text-[#B08427]'
                            }`}
                          >
                            {finding.severity} · CLAUSE {finding.clauseNumber}, PAGE {finding.pageNumber}
                          </span>
                        </div>

                        {/* Quick remove button (Hidden on print) */}
                        <button
                          onClick={() => onToggleBrief(finding.id)}
                          className="no-print text-xs text-[#96938A] hover:text-[#B44738] transition-colors"
                          title="Remove from brief"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Question */}
                      <h3 className="text-sm font-semibold text-[#1C1C19] font-serif leading-snug">
                        "{finding.advocateQuestion}"
                      </h3>

                      {/* Verbatim Source Span Citation */}
                      {finding.sourceSpan && (
                        <SourceSpanCitation
                          span={finding.sourceSpan}
                          language={briefLanguage}
                        />
                      )}

                      {/* Uncertainty Signal */}
                      {finding.uncertaintySignal && (
                        <UncertaintyBadge
                          signal={finding.uncertaintySignal}
                          language={briefLanguage}
                        />
                      )}

                      {/* Why */}
                      <p className="text-xs text-[#6F6D65] leading-relaxed">
                        <strong className="text-[#1C1C19]">Legal Rationale: </strong>
                        {finding.advocateWhy}
                      </p>

                      {/* Blank Space for Advocate Notes (Visible on Print) */}
                      <div className="pt-2 border-t border-dashed border-[#DDD9CE] text-[11px] font-mono text-[#8C887B]">
                        <span>COUNSEL NOTES / COUNTER-CLAUSE DRAFTED:</span>
                        <div className="h-6 border-b border-dotted border-[#C9C4B7] mt-1" />
                      </div>
                    </div>
                  );
                })
              )}

              {/* User's custom citizen questions */}
              {customQuestions.map((q, idx) => {
                const numStr = (activeFindings.length + idx + 1)
                  .toString()
                  .padStart(2, '0');
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-md border border-[#DDD9CE] bg-[#FCFBF7] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#C38A2E]">
                          {numStr}
                        </span>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-[#E8E4D9] text-[#6F6D65]">
                          CUSTOM CITIZEN QUERY
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveCustomQuestion(idx)}
                        className="no-print text-xs text-[#96938A] hover:text-[#B44738]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-[#1C1C19] font-serif">
                      "{q}"
                    </p>
                    <div className="pt-2 border-t border-dashed border-[#DDD9CE] text-[11px] font-mono text-[#8C887B]">
                      <span>COUNSEL NOTES:</span>
                      <div className="h-6 border-b border-dotted border-[#C9C4B7] mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add custom question button / form (Hidden on print) */}
            <div className="no-print pt-2">
              {showAddForm ? (
                <form
                  onSubmit={handleAddCustomQuestion}
                  className="p-4 bg-[#F7F4EC] rounded-lg border border-[#DDD9CE] space-y-3"
                >
                  <label className="block text-xs font-semibold text-[#1C1C19]">
                    Add your own question or note for your advocate:
                  </label>
                  <textarea
                    value={newQuestionInput}
                    onChange={(e) => setNewQuestionInput(e.target.value)}
                    placeholder="e.g. Can we confirm if the seller will provide an electricity meter transfer form signed before signing?"
                    className="w-full text-xs p-2.5 rounded border border-[#C9C4B7] bg-white focus:outline-none focus:ring-1 focus:ring-[#171714]"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#171714] text-white rounded text-xs font-medium hover:bg-[#2C2B26]"
                    >
                      Add to Dossier
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-xs text-[#6F6D65] hover:text-[#1C1C19]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2.5 border border-dashed border-[#C9C4B7] rounded-md text-xs font-medium text-[#6F6D65] hover:text-[#1C1C19] hover:bg-[#F7F4EC] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add custom question for consultation</span>
                </button>
              )}
            </div>

            {/* PART IV: CLIENT'S PERSONAL MARGIN NOTES & ANNOTATIONS */}
            {annotations.filter((a) => a.note && a.note.trim().length > 0).length > 0 && (
              <div className="pt-5 border-t border-[#DDD9CE] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs font-bold text-[#1C1C19] uppercase tracking-wider flex items-center gap-1.5">
                    <span>Client Margin Notes &amp; Line Sticky Notes</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-normal">
                      {annotations.filter((a) => a.note && a.note.trim().length > 0).length} Notes Attached
                    </span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#6F6D65]">
                    SAVED FROM DOCUMENT ANNOTATOR
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {annotations
                    .filter((a) => a.note && a.note.trim().length > 0)
                    .map((anno) => (
                      <div
                        key={anno.id}
                        className="bg-[#FEFCE8] border border-[#FEF08A] rounded-lg p-3 space-y-2 text-xs shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#8C621E]">
                            Page {anno.pageNumber}, Line {anno.lineNumber}
                            {anno.clauseNumber ? ` (Clause ${anno.clauseNumber})` : ''}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 border border-amber-300">
                            {anno.tag || 'STICKY NOTE'}
                          </span>
                        </div>
                        <p className="font-serif italic text-[11px] text-[#4A4843] border-l-2 border-[#C38A2E] pl-2">
                          "{anno.lineText}"
                        </p>
                        <div className="bg-white/90 p-2 rounded border border-amber-200 text-[#1C1C19] font-sans text-xs leading-relaxed">
                          <strong className="block text-[10px] font-mono text-[#8C621E] uppercase">
                            CLIENT INQUIRY:
                          </strong>
                          {anno.note}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Brief Footer & Signature Block */}
        <div className="pt-6 border-t border-[#DDD9CE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#96938A] font-mono">
          <div>GENERATED BY VIDHI · ADVOCATE INTAKE DOSSIER</div>
          <div>CONFIDENTIAL · PREPARED FOR ADVOCATE CONSULTATION</div>
        </div>
      </div>
    </div>
  );
};
