import React, { useState } from 'react';
import {
  ArrowLeft,
  History,
  FileText,
  Calendar,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  ArrowRight,
  TrendingDown,
  Sparkles,
  GitCommit,
  GitCompare,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Scale,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Language, DocumentInfo, DocumentVersion } from '../types';
import { documentVersionsList, uiTranslations } from '../data/mockData';
import { activateOnKey } from '../utils/a11y';

interface DocumentHistoryViewProps {
  documentInfo: DocumentInfo;
  language: Language;
  onBackToOverview: () => void;
  onOpenReport: () => void;
  onOpenBrief: () => void;
  onOpenUploadNewVersion?: () => void;
}

export const DocumentHistoryView: React.FC<DocumentHistoryViewProps> = ({
  documentInfo,
  language,
  onBackToOverview,
  onOpenReport,
  onOpenBrief,
  onOpenUploadNewVersion,
}) => {
  const t = uiTranslations[language];
  const [versions, setVersions] = useState<DocumentVersion[]>(documentVersionsList);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('doc-v2-1');
  const [compareBaseId, setCompareBaseId] = useState<string>('doc-v1-0');
  const [compareTargetId, setCompareTargetId] = useState<string>('doc-v2-1');
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(true);
  const [expandedVersionIds, setExpandedVersionIds] = useState<Record<string, boolean>>({
    'doc-v2-1': true,
    'doc-v2-0': false,
    'doc-v1-1': false,
    'doc-v1-0': false,
  });

  const activeVersion = versions.find((v) => v.id === selectedVersionId) || versions[versions.length - 1];
  const compareBase = versions.find((v) => v.id === compareBaseId) || versions[0];
  const compareTarget = versions.find((v) => v.id === compareTargetId) || versions[versions.length - 1];

  const toggleExpand = (id: string) => {
    setExpandedVersionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSetActive = (versionId: string) => {
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        isCurrent: v.id === versionId,
        status: v.id === versionId ? 'CURRENT_ACTIVE' : v.status === 'CURRENT_ACTIVE' ? 'FLAGGED_RISKS' : v.status,
      }))
    );
    setSelectedVersionId(versionId);
  };

  const handleExportAuditTrail = () => {
    const textAudit = `================================================================================
VIDHI LEGAL DOCUMENT EVOLUTION AUDIT TRAIL
Target Property : ${documentInfo.property}
City / State    : ${documentInfo.city}
Generated Date  : ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
================================================================================

EXECUTIVE EVOLUTION SUMMARY:
Baseline Draft Risk Score : 78/100 (v1.0 - 12 Sep 2026)
Current Draft Risk Score  : 62/100 (v2.1 - 23 Sep 2026)
Net Risk Reduction        : -16 Points (3 High-risk traps resolved, 3 pending)

REVISION TIMELINE & AUDIT HISTORY:

${versions
  .map(
    (v, i) => `--------------------------------------------------------------------------------
REVISION ${i + 1}: ${v.versionNumber.toUpperCase()} — ${v.label}
Review Date    : ${v.reviewDate}
Reviewed By    : ${v.reviewedBy}
Status         : ${v.status} ${v.isCurrent ? '[ACTIVE WORKING DRAFT]' : ''}
File Details   : ${v.fileName} (${v.fileSize}, ${v.pageCount} pages)
Risk Score     : ${v.riskScore}/100 (${v.riskVerdict})
Severity Flags : ${v.highCount} HIGH, ${v.mediumCount} MEDIUM, ${v.lowCount} LOW

SUMMARY OF DRAFT CHANGES:
${v.summaryOfChanges.map((c) => `  * ${c}`).join('\n')}

ADVOCATE COUNSEL NOTES:
  "${v.advocateNotes || 'No specific notes recorded.'}"

CRITICAL UNRESOLVED EXPOSURES:
${(v.criticalIssuesRemaining || []).map((iss) => `  ! ${iss}`).join('\n')}
`
  )
  .join('\n')}

================================================================================
DISCLAIMER: Vidhi is an AI citizen legal literacy tool. This audit log tracks
textual revisions for consultation with your appointed advocate.
================================================================================`;

    const blob = new Blob([textAudit], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vidhi_Document_Revision_Audit_Trail_Flat402.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD9CE]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-lg bg-[#FCFBF7] border border-[#DDD9CE] hover:bg-[#F3F0E8] text-[#1C1C19] transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'HI' ? 'अवलोकन पर वापस' : language === 'MR' ? 'आढाव्यावर परत' : 'Back to Overview'}
            </span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1C19]">
                {language === 'HI' ? 'दस्तावेज़ विकास व संस्करण इतिहास' : language === 'MR' ? 'दस्तऐवज इतिहास व आवृत्ती बदल' : 'Document Evolution & Version History'}
              </h1>
              <span className="text-[10px] font-mono uppercase font-bold bg-[#F2E6C9] text-[#8C621E] px-2 py-0.5 rounded border border-[#E8DAB7] flex items-center gap-1">
                <History className="w-3 h-3" />
                {versions.length} {language === 'HI' ? 'संस्करण दर्ज' : language === 'MR' ? 'आवृत्त्या नोंद' : 'Revisions Tracked'}
              </span>
            </div>
            <p className="text-xs text-[#6F6D65] mt-0.5">
              {documentInfo.property} · {documentInfo.totalConsideration}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button aria-expanded={isCompareOpen}
            onClick={() => setIsCompareOpen(!isCompareOpen)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs ${
              isCompareOpen
                ? 'bg-[#C38A2E] text-[#1C1C19] border-[#C38A2E]'
                : 'bg-[#FCFBF7] text-[#1C1C19] border-[#DDD9CE] hover:bg-[#F3F0E8]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isCompareOpen ? 'Close Comparator' : 'Compare Revisions'}</span>
          </button>

          <button
            onClick={handleExportAuditTrail}
            className="px-3 py-2 rounded-lg bg-[#FCFBF7] border border-[#DDD9CE] hover:bg-[#F3F0E8] text-[#1C1C19] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Download full audit log of all draft versions"
          >
            <Download className="w-3.5 h-3.5 text-[#6F6D65]" />
            <span className="hidden sm:inline">Export Audit Trail</span>
          </button>

          {onOpenUploadNewVersion && (
            <button
              onClick={onOpenUploadNewVersion}
              className="px-3 py-2 rounded-lg bg-[#1C1C19] text-[#FAF8F5] hover:bg-[#2C2B27] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Next Draft (v2.2)</span>
            </button>
          )}
        </div>
      </div>

      {/* Trajectory Banner: Risk Evolution Across Drafts */}
      <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F3F0E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#58735C]/15 text-[#58735C] flex items-center justify-center border border-[#58735C]/30 shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1C1C19] font-serif">
                Risk Trajectory & Clause Negotiation Progress
              </h2>
              <p className="text-xs text-[#6F6D65]">
                How buyer risk scores and flagged clauses evolved through lawyer redlines over 11 days.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#E6EEE6] text-[#58735C] font-bold px-2.5 py-1 rounded border border-[#D5E2D5] flex items-center gap-1">
              <span>-16 Pts Overall Risk Reduction</span>
            </span>
          </div>
        </div>

        {/* Stepper / Timeline Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {versions.map((ver, idx) => {
            const isLatest = ver.isCurrent;
            const isBaseline = idx === 0;

            return (
              <div role="button" tabIndex={0} onKeyDown={activateOnKey} aria-pressed={selectedVersionId === ver.id}
                key={ver.id}
                onClick={() => setSelectedVersionId(ver.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  ver.id === selectedVersionId
                    ? 'bg-[#FAF8F2] border-[#C38A2E] ring-1 ring-[#C38A2E]/50 shadow-xs'
                    : 'bg-[#F7F4EC] border-[#DDD9CE] hover:border-[#C9C4B7]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-[#1C1C19] flex items-center gap-1.5">
                    {ver.versionNumber}
                    {isLatest && (
                      <span className="text-[9px] font-sans font-bold bg-[#1C1C19] text-[#FAF8F5] px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#1C1C19]">
                    {ver.riskScore}
                    <span className="text-[10px] text-[#96938A] font-normal">/100</span>
                  </span>
                </div>

                <p className="text-xs font-medium text-[#4A4843] truncate mb-2" title={ver.label}>
                  {ver.label}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#73716A] pt-1.5 border-t border-[#E8E4D9]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#96938A]" />
                    {ver.reviewDate}
                  </span>
                  <span className="font-mono text-[#8E4A3F] font-semibold">
                    {ver.highCount} High Risks
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Negotiation Milestones Solved vs Pending */}
        <div className="p-4 rounded-lg bg-[#FAF8F2] border border-[#E8E4D9] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-[#58735C] flex items-center gap-1 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Traps Successfully Eliminated in Past Redlines (v1.0 → v2.1)
            </span>
            <ul className="space-y-1.5 text-[#4A4843]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#58735C] font-bold">✓</span>
                <span><strong>Deposit Forfeiture Removed:</strong> 100% token seizure replaced with 15-day cure notice.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#58735C] font-bold">✓</span>
                <span><strong>Past Taxes Shift Cancelled:</strong> Seller bound to clear all PMC municipal dues up to date.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#58735C] font-bold">✓</span>
                <span><strong>Parking Space Fixed:</strong> Formal bay allocation diagram annexed (Stilt Bay P-14).</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E4A3F] flex items-center gap-1 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical Clauses Still Pending Resolution in Active Draft (v2.1)
            </span>
            <ul className="space-y-1.5 text-[#4A4843]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#8E4A3F] font-bold">!</span>
                <span><strong>Clause 4:</strong> Balance payment unconditioned on SBI mortgage discharge.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#8E4A3F] font-bold">!</span>
                <span><strong>Clause 9:</strong> Vacant physical keys delivery has no binding time essence for seller.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#8E4A3F] font-bold">!</span>
                <span><strong>Clause 16:</strong> Title defect indemnity truncated to 12 months (vs 12 statutory years).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Version Comparator (Expandable) */}
      {isCompareOpen && (
        <div className="bg-[#FAF8F2] border-2 border-[#C38A2E]/40 rounded-xl p-5 md:p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4D9]">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#C38A2E]" />
              <h3 className="text-base font-serif font-bold text-[#1C1C19]">
                Side-by-Side Version Comparator & Redline Diff
              </h3>
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-[#FCFBF7] px-2 py-1 rounded border border-[#DDD9CE]">
                <span className="text-[#73716A]">Base:</span>
                <select aria-label="Base version"
                  value={compareBaseId}
                  onChange={(e) => setCompareBaseId(e.target.value)}
                  className="bg-transparent font-mono font-semibold text-[#1C1C19] outline-none"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.versionNumber} ({v.reviewDate})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[#73716A] font-bold">vs</span>

              <div className="flex items-center gap-1 bg-[#FCFBF7] px-2 py-1 rounded border border-[#DDD9CE]">
                <span className="text-[#73716A]">Target:</span>
                <select aria-label="Compare with version"
                  value={compareTargetId}
                  onChange={(e) => setCompareTargetId(e.target.value)}
                  className="bg-transparent font-mono font-semibold text-[#1C1C19] outline-none"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.versionNumber} ({v.reviewDate})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Comparison Delta Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#FCFBF7] rounded-lg border border-[#DDD9CE] space-y-1">
              <span className="text-[10px] font-mono text-[#73716A] uppercase font-semibold">
                Risk Score Movement
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono font-bold text-[#1C1C19]">
                  {compareBase.riskScore} → {compareTarget.riskScore}
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    compareTarget.riskScore <= compareBase.riskScore
                      ? 'text-[#58735C]'
                      : 'text-[#8E4A3F]'
                  }`}
                >
                  {compareTarget.riskScore - compareBase.riskScore > 0 ? '+' : ''}
                  {compareTarget.riskScore - compareBase.riskScore} Pts
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FCFBF7] rounded-lg border border-[#DDD9CE] space-y-1">
              <span className="text-[10px] font-mono text-[#73716A] uppercase font-semibold">
                High Risk Exposure
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono font-bold text-[#8E4A3F]">
                  {compareBase.highCount} High → {compareTarget.highCount} High
                </span>
                <span className="text-xs font-mono text-[#58735C] font-semibold">
                  {compareBase.highCount - compareTarget.highCount} Flags Defused
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FCFBF7] rounded-lg border border-[#DDD9CE] space-y-1">
              <span className="text-[10px] font-mono text-[#73716A] uppercase font-semibold">
                Document Length & Stamps
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono font-bold text-[#1C1C19]">
                  {compareBase.pageCount} pgs → {compareTarget.pageCount} pgs
                </span>
                <span className="text-xs text-[#73716A]">
                  +{compareTarget.pageCount - compareBase.pageCount} Annexures
                </span>
              </div>
            </div>
          </div>

          {/* Clause Diff Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#DDD9CE] rounded-lg overflow-hidden">
              <thead className="bg-[#F3ECD7] text-[#1C1C19] font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-2.5 border-b border-[#DDD9CE]">Legal Covenant / Clause</th>
                  <th className="p-2.5 border-b border-[#DDD9CE] bg-[#FAF3F1]">
                    {compareBase.versionNumber} Position
                  </th>
                  <th className="p-2.5 border-b border-[#DDD9CE] bg-[#F2F7F2]">
                    {compareTarget.versionNumber} Position
                  </th>
                  <th className="p-2.5 border-b border-[#DDD9CE]">Citizen Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD9CE] bg-[#FCFBF7] text-[#4A4843]">
                <tr>
                  <td className="p-2.5 font-medium text-[#1C1C19]">Deposit Forfeiture (Clause 3)</td>
                  <td className="p-2.5 bg-[#FAF3F1]/40 text-[#8E4A3F]">
                    Total 100% deposit forfeiture on 3 days delay without notice.
                  </td>
                  <td className="p-2.5 bg-[#F2F7F2]/40 text-[#58735C]">
                    Mandatory 15-day formal cure notice period prior to penalty.
                  </td>
                  <td className="p-2.5 font-mono text-[#58735C] font-semibold">AMENDED &amp; FIXED</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-[#1C1C19]">Municipal &amp; Society Outgoings</td>
                  <td className="p-2.5 bg-[#FAF3F1]/40 text-[#8E4A3F]">
                    Purchaser pays all historical arrears up to execution date.
                  </td>
                  <td className="p-2.5 bg-[#F2F7F2]/40 text-[#58735C]">
                    Seller strictly clears all PMC and society dues with NOC proof.
                  </td>
                  <td className="p-2.5 font-mono text-[#58735C] font-semibold">AMENDED &amp; FIXED</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-[#1C1C19]">SBI Mortgage Release (Clause 4)</td>
                  <td className="p-2.5 bg-[#FAF3F1]/40 text-[#8E4A3F]">
                    Payment unconditional without bank clearance deed.
                  </td>
                  <td className="p-2.5 bg-[#F2F7F2]/40 text-[#8E4A3F]">
                    Payment still unlinked from SBI discharge deed production.
                  </td>
                  <td className="p-2.5 font-mono text-[#8E4A3F] font-semibold">CRITICAL PERSISTS</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-[#1C1C19]">Possession Delivery (Clause 9)</td>
                  <td className="p-2.5 bg-[#FAF3F1]/40 text-[#8E4A3F]">
                    Time strictly of essence for buyer, waived for seller.
                  </td>
                  <td className="p-2.5 bg-[#F2F7F2]/40 text-[#8E4A3F]">
                    Keys handover still open-ended without sub-registrar table delivery.
                  </td>
                  <td className="p-2.5 font-mono text-[#8E4A3F] font-semibold">NEEDS ADVOCATE FIX</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-[#1C1C19]">Title Warranty Indemnity (Clause 16)</td>
                  <td className="p-2.5 bg-[#FAF3F1]/40 text-[#8E4A3F]">
                    6-Month limitation on title defect compensation.
                  </td>
                  <td className="p-2.5 bg-[#F2F7F2]/40 text-[#B08427]">
                    12-Month cap (conceded from 6 months, but still under 12 years).
                  </td>
                  <td className="p-2.5 font-mono text-[#B08427] font-semibold">PARTIAL COMPROMISE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Version History Chronological Timeline List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C38A2E]" />
            <h3 className="text-base font-serif font-bold text-[#1C1C19]">
              Document Revision Log & Review Notes
            </h3>
          </div>
          <span className="text-xs text-[#73716A]">
            Showing all 4 versions from 12 Sep to Present
          </span>
        </div>

        <div className="space-y-3">
          {versions.map((ver, idx) => {
            const isExpanded = !!expandedVersionIds[ver.id];
            const isCurrent = ver.isCurrent;

            return (
              <div
                key={ver.id}
                className={`bg-[#FCFBF7] border rounded-xl overflow-hidden transition-all shadow-xs ${
                  isCurrent
                    ? 'border-[#C38A2E] ring-1 ring-[#C38A2E]/30'
                    : 'border-[#DDD9CE] hover:border-[#C9C4B7]'
                }`}
              >
                {/* Version Card Header */}
                <div
                  onClick={() => toggleExpand(ver.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer bg-gradient-to-r from-[#FAF8F2] to-[#FCFBF7]"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isCurrent
                          ? 'bg-[#C38A2E] text-[#1C1C19] border-[#C38A2E]'
                          : 'bg-[#F7F4EC] text-[#6F6D65] border-[#DDD9CE]'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-[#1C1C19] font-mono">
                          {ver.versionNumber}
                        </span>
                        <span className="text-sm font-semibold text-[#4A4843]">
                          — {ver.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold bg-[#1C1C19] text-[#FAF8F5] px-2 py-0.5 rounded">
                            CURRENT ACTIVE
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            ver.status === 'CURRENT_ACTIVE'
                              ? 'bg-[#FAF8F2] text-[#8C621E] border-[#E8DAB7]'
                              : ver.status === 'ADVOCATE_AMENDED'
                              ? 'bg-[#E6EEE6] text-[#58735C] border-[#D5E2D5]'
                              : 'bg-[#FAF3F1] text-[#8E4A3F] border-[#EADBDA]'
                          }`}
                        >
                          {ver.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#73716A] mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#96938A]" />
                          {ver.reviewDate}
                        </span>
                        <span className="text-[#DDD9CE]">·</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#96938A]" />
                          {ver.reviewedBy}
                        </span>
                        <span className="text-[#DDD9CE]">·</span>
                        <span>{ver.fileName} ({ver.fileSize})</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Metrics & Expand Toggle */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-[#1C1C19]">
                        Risk {ver.riskScore}/100
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className="text-[#8E4A3F] font-semibold">{ver.highCount}H</span>
                        <span className="text-[#DDD9CE]">/</span>
                        <span className="text-[#B08427] font-semibold">{ver.mediumCount}M</span>
                        <span className="text-[#DDD9CE]">/</span>
                        <span className="text-[#58735C] font-semibold">{ver.lowCount}L</span>
                      </div>
                    </div>

                    <button aria-expanded={isExpanded} aria-label={isExpanded ? 'Collapse version details' : 'Expand version details'}
                      className="p-1.5 rounded-md hover:bg-[#F3F0E8] text-[#73716A] transition-colors"
                      title={isExpanded ? 'Collapse version details' : 'Expand version details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Version Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-[#F3F0E8] bg-[#FCFBF7] space-y-4 animate-fade-in text-xs">
                    {/* Summary of Changes */}
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#73716A] block mb-1.5">
                        Key Changes & Revisions in this Draft:
                      </span>
                      <ul className="space-y-1.5 pl-4 list-disc text-[#4A4843]">
                        {ver.summaryOfChanges.map((change, cIdx) => (
                          <li key={cIdx}>{change}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Advocate Notes Box */}
                    {ver.advocateNotes && (
                      <div className="p-3.5 rounded-lg bg-[#FAF8F2] border border-[#E8E4D9] space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#8C621E] flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          Advocate & Counsel Review Notes:
                        </span>
                        <p className="text-[#4A4843] italic leading-relaxed">
                          "{ver.advocateNotes}"
                        </p>
                      </div>
                    )}

                    {/* Critical Issues Remaining */}
                    {ver.criticalIssuesRemaining && ver.criticalIssuesRemaining.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-[#8E4A3F] block mb-1.5">
                          Unresolved Citizen Exposures ({ver.criticalIssuesRemaining.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ver.criticalIssuesRemaining.map((issue, iIdx) => (
                            <div
                              key={iIdx}
                              className="p-2 rounded bg-[#FAF3F1] border border-[#EADBDA] text-[#8E4A3F] font-mono text-[11px]"
                            >
                              {issue}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Strip */}
                    <div className="pt-3 border-t border-[#F3F0E8] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => handleSetActive(ver.id)}
                            className="px-3 py-1.5 rounded bg-[#FCFBF7] border border-[#DDD9CE] hover:bg-[#F3F0E8] text-[#1C1C19] font-medium text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-[#58735C]" />
                            <span>Set as Active Review Target</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCompareBaseId(ver.id);
                            setCompareTargetId('doc-v2-1');
                            setIsCompareOpen(true);
                          }}
                          className="px-3 py-1.5 rounded bg-[#FCFBF7] border border-[#DDD9CE] hover:bg-[#F3F0E8] text-[#1C1C19] font-medium text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <GitCompare className="w-3.5 h-3.5 text-[#C38A2E]" />
                          <span>Compare with Current (v2.1)</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={onOpenReport}
                          className="px-3 py-1.5 rounded bg-[#1C1C19] text-[#FAF8F5] hover:bg-[#2C2B27] font-medium text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <span>Inspect Clauses in Document Viewer</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
