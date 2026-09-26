export type Language = 'EN' | 'HI' | 'MR';

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export type ViewMode = 'document' | 'plain' | 'side-by-side';

export type UncertaintyLevel = 'HIGH_CERTAINTY' | 'MEDIUM_UNCERTAINTY' | 'HIGH_UNCERTAINTY';

export interface SourceSpan {
  documentId: string;
  clauseNumber: number;
  pageNumber: number;
  startLine: number;
  endLine: number;
  exactQuote: string;
  anchorId?: string;
}

export interface UncertaintySignal {
  level: UncertaintyLevel;
  label: string;
  labelHindi?: string;
  labelMarathi?: string;
  reason: string;
  reasonHindi?: string;
  reasonMarathi?: string;
  counselRequiredAction: string;
}

export interface Finding {
  id: string;
  clauseNumber: number;
  pageNumber: number;
  severity: Severity;
  theme: string;
  themeScorePercent: number;
  shortTitle: string;
  shortTitleHindi?: string;
  shortTitleMarathi?: string;
  plainHeadline: string;
  plainHeadlineHindi?: string;
  plainHeadlineMarathi?: string;
  sourceQuote: string;
  plainLanguageExplanation: string;
  plainLanguageExplanationHindi?: string;
  plainLanguageExplanationMarathi?: string;
  practicalConsequences: string[];
  advocateQuestion: string;
  advocateWhy: string;
  inAdvocateBrief: boolean;
  audioScriptHindi: string;
  audioScriptEnglish: string;
  audioScriptMarathi?: string;
  relatedModuleId: string;
  sourceSpan?: SourceSpan;
  uncertaintySignal?: UncertaintySignal;
}

export interface DocumentInfo {
  id: string;
  title: string;
  property: string;
  city: string;
  totalConsideration: string;
  reviewedTimeAgo: string;
  pageCount: number;
  version: string;
  riskScore: number;
  riskVerdict: string;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface LearningModule {
  id: string;
  number: string;
  title: string;
  titleHindi?: string;
  titleMarathi?: string;
  status: 'DONE' | 'NOW' | 'NOT STARTED';
  progressText?: string;
  category: 'Civil — property' | 'Consumer' | 'Criminal' | 'RERA' | 'Property' | 'Civil procedure' | 'Registration' | string;
  readTime: string;
  summary: string;
  keyTakeaways: string[];
}

export interface CourtStage {
  id: string;
  level: number;
  name: string;
  nameHindi: string;
  courtType: string;
  jurisdiction: string;
  typicalDuration: string;
  costLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  costDetail: string;
  limitationPeriod: string;
  description: string;
  isUserMatterStart?: boolean;
  preLitigation?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
  location?: string;
}

export interface GlossaryItem {
  term: string;
  termDevanagari: string;
  category: string;
  definition: string;
  plainExample: string;
}

export interface MissingDocument {
  id: string;
  title: string;
  importance: 'Critical' | 'Recommended';
  reason: string;
  uploaded: boolean;
}

export interface DocumentVersion {
  id: string;
  versionNumber: string;
  label: string;
  reviewDate: string;
  reviewedTimestamp: string;
  reviewedBy: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  riskScore: number;
  riskVerdict: string;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  isCurrent: boolean;
  status: 'CURRENT_ACTIVE' | 'FLAGGED_RISKS' | 'ADVOCATE_AMENDED' | 'READY_FOR_EXECUTION';
  summaryOfChanges: string[];
  keyDifferencesFromPrior?: string[];
  clausesChangedCount?: number;
  clausesResolvedCount?: number;
  advocateNotes?: string;
  criticalIssuesRemaining?: string[];
}

export interface FullClauseExplanation {
  clauseNumber: number;
  pageNumber: number;
  title: string;
  titleHindi?: string;
  titleMarathi?: string;
  category: 'Parties & Title' | 'Financial & Consideration' | 'Possession & Handover' | 'Taxes & Outgoings' | 'Warranties & Indemnity' | 'Dispute Resolution & General';
  originalLegalText: string;
  plainExplanation: string;
  plainExplanationHindi?: string;
  plainExplanationMarathi?: string;
  buyerObligation: string;
  sellerObligation: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'STANDARD';
  riskReason?: string;
  recommendedRevision?: string;
  isFlagged: boolean;
  findingId?: string;
  sourceSpan?: SourceSpan;
  uncertaintySignal?: UncertaintySignal;
}

export interface RedFlagRubricItem {
  id: string;
  rubricNumber: number;
  title: string;
  titleHindi?: string;
  titleMarathi?: string;
  category: 'Financial & Payment' | 'Possession & Handover' | 'Title & Encumbrances' | 'Dispute Resolution' | 'Liabilities & Outgoings' | 'Contractual Balance';
  severity: Severity;
  status: 'DETECTED' | 'WATCHLIST' | 'SAFE';
  reason: string;
  theTrap: string;
  benchmarkStandard: string;
  currentDraftStatus: string;
  clauseReference?: string;
  recommendedRemedy: string;
  sourceSpan?: SourceSpan;
  uncertaintySignal?: UncertaintySignal;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'DOCUMENTS_VERIFICATION' | 'NEGOTIATION_PUNCH_LIST' | 'REGISTRATION_DAY';
  importance: 'CRITICAL_BLOCKER' | 'HIGH' | 'RECOMMENDED';
  description: string;
  status: 'PENDING' | 'VERIFIED' | 'FLAGGED_FOR_ADVOCATE';
  actionableStep: string;
  relevantClause?: string;
  authorityOrSource: string;
}

export type HighlightColor = 'yellow' | 'amber' | 'green' | 'rose' | 'blue' | 'purple';

export interface DocumentAnnotation {
  id: string;
  documentId: string;
  pageNumber: number;
  lineNumber: number;
  clauseNumber?: number;
  lineText: string;
  selectedSnippet?: string;
  color: HighlightColor;
  note?: string;
  tag?: 'ADVOCATE_QUERY' | 'BANK_CHECK' | 'ACTION_ITEM' | 'GENERAL_NOTE' | 'RED_FLAG';
  createdAt: string;
  updatedAt?: string;
}

export interface DisputePathway {
  id: string;
  title: string;
  subtitle: string;
  type: 'NEGOTIATION' | 'ARBITRATION' | 'RERA' | 'CIVIL_COURT' | 'MEDIATION';
  typicalTimeline: string;
  estimatedCost: string;
  governingLaw: string;
  forumOrAuthority: string;
  summary: string;
  steps: {
    stage: string;
    description: string;
    citizenTip: string;
  }[];
  pros: string[];
  cons: string[];
  suitabilityForMatter: string;
}

