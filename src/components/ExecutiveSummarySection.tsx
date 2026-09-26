import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Scale,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Cpu,
  Building,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Language } from '../types';

interface ExecutiveSummarySectionProps {
  language: Language;
  customSummaryData?: SummaryData;
  onOpenAdvocateBrief?: () => void;
  onOpenDocument?: () => void;
  onOpenPipelineViewer?: () => void;
}

interface SummaryData {
  headline: string;
  propertyTitle: string;
  transactionType: string;
  totalConsideration: string;
  parties: {
    vendor: string;
    purchaser: string;
  };
  plainSummaryParagraphs: string[];
  keyCovenants: Array<{
    category: string;
    status: 'NORMAL' | 'CAUTION' | 'ATTENTION';
    summary: string;
  }>;
  criticalRisksIdentified: Array<{
    clause: string;
    concern: string;
    plainMeaning: string;
    suggestedAdvocateFix: string;
  }>;
  recommendedNextSteps: string[];
  generatedAt: string;
  modelUsed: string;
  piiRedactedCount: number;
}

const defaultSummaries: Record<Language, SummaryData> = {
  EN: {
    headline:
      'Executive Summary: Outright sale of Flat 402, Kalyani Nagar for ₹86 Lakhs — 3 key amendments strongly recommended prior to sub-registrar execution.',
    propertyTitle: 'Flat 402, 4th Floor, Gulmohar Enclave CHSL, Kalyani Nagar, Pune 411006',
    transactionType: 'Deed of Absolute Sale (Freehold Residential Conveyance)',
    totalConsideration: '₹86,00,000/- (INR Eighty Six Lakhs only)',
    parties: {
      vendor: 'Shri Rajesh S. Verma (Vendor / Seller)',
      purchaser: 'Rohan Sharma (Purchaser / Buyer)',
    },
    plainSummaryParagraphs: [
      'This document is a formal Draft Sale Deed for the purchase of an 1,180 sq. ft. residential apartment along with covered stilt parking space P-14 and an undivided proportional land share in Kalyani Nagar, Pune. Total consideration is fixed at ₹86,00,000, of which an advance of ₹17,20,000 has been paid via RTGS, leaving ₹68,80,000 due at execution.',
      'The flat currently carries an existing mortgage in favour of State Bank of India, Commercial Branch Pune. While the Vendor promises clear marketable title, Clause 4 unlinks the balance payment from production of the bank\'s mortgage clearance deed, creating a substantial encumbrance exposure for the purchaser.',
      'Additionally, Clause 9 holds time to be strictly of the essence for your payment, but waives time essence for the seller\'s key handover. A further clause truncates the seller\'s statutory 12-year title indemnity to just 12 months. Amending these 3 clauses through your advocate will secure complete legal safety.',
    ],
    keyCovenants: [
      {
        category: 'Consideration & Bank Charge',
        status: 'ATTENTION',
        summary: 'Active SBI home loan charge. Unconditional balance payment exposes you to third-party bank recovery under SARFAESI.',
      },
      {
        category: 'Physical Possession & Keys',
        status: 'CAUTION',
        summary: 'Time is waived for vendor keys handover. Risk of paying full price without receiving vacant physical keys.',
      },
      {
        category: 'Title Warranty & Indemnity',
        status: 'ATTENTION',
        summary: 'Vendor cuts indemnity liability at 12 months, conflicting with the statutory 12-year limitation period for title disputes.',
      },
      {
        category: 'Society Share & Outgoings',
        status: 'NORMAL',
        summary: 'Standard society share certificate transfer. Vendor responsible for maintenance and municipal taxes up to execution date.',
      },
    ],
    criticalRisksIdentified: [
      {
        clause: 'Clause 4 (Page 7)',
        concern: 'Unconditional balance payment without mortgage release',
        plainMeaning: 'You must pay ₹68.8 Lakhs even if the seller never obtains or hands over the bank\'s mortgage discharge.',
        suggestedAdvocateFix: 'Pay the outstanding loan balance directly to SBI via banker\'s cheque against an official foreclosure letter.',
      },
      {
        clause: 'Clause 9 (Page 11)',
        concern: 'Asymmetric possession obligation',
        plainMeaning: 'You face immediate default for late payment, but the seller can delay key delivery without financial penalty.',
        suggestedAdvocateFix: 'Amend clause so physical keys must be handed over in person before the Sub-Registrar during registration.',
      },
      {
        clause: 'Clause 16 (Page 15)',
        concern: '12-Month title indemnity cutoff',
        plainMeaning: 'Leaves you unprotected if undisclosed heirs or mortgage claims emerge after 1 year.',
        suggestedAdvocateFix: 'Delete the 12-month restriction so the indemnity remains enforceable for the statutory 12-year period.',
      },
    ],
    recommendedNextSteps: [
      'Take the 4 generated advocate consultation questions to your property lawyer ahead of the appointment.',
      'Obtain an official written Loan Foreclosure Statement from State Bank of India Commercial Branch.',
      'Inspect the 30-year Title Search Report and Nil Encumbrance Certificate from Haveli Sub-Registrar.',
    ],
    generatedAt: new Date().toISOString(),
    modelUsed: 'Gemini 3.8 Flash Legal Pipeline (Server-Side Verified)',
    piiRedactedCount: 6,
  },
  HI: {
    headline:
      'कार्यकारी सारांश: फ्लैट 402 कल्याणी नगर पुणे की बिक्री विलेख — हस्ताक्षर से पूर्व 3 महत्वपूर्ण शर्तों में संशोधन की दृढ़ अनुशंसा।',
    propertyTitle: 'फ्लैट 402, चतुर्थ तल, गुलमोहर एन्क्लेव, कल्याणी नगर, पुणे 411006',
    transactionType: 'अचल संपत्ति का विक्रय विलेख (Absolute Sale Deed)',
    totalConsideration: '₹86,00,000/- (छियासी लाख रुपये)',
    parties: {
      vendor: 'श्री राजेश एस. वर्मा (विक्रेता / सेलर)',
      purchaser: 'रोहन शर्मा (क्रेता / बायर)',
    },
    plainSummaryParagraphs: [
      'यह दस्तावेज़ पुणे के कल्याणी नगर में फ्लैट 402 की सीधी खरीद का मसौदा है। कुल तय कीमत ₹86 लाख है, जिसमें से ₹17.2 लाख का बयाना पहले ही दिया जा चुका है और ₹68.8 लाख का बकाया पंजीकरण के समय देय है।',
      'दस्तावेज़ में विक्रेता आपको फ्लैट और एक ढकी हुई कार पार्किंग का निर्विवाद मालिकाना हक देने का वादा करता है, लेकिन इस फ्लैट पर भारतीय स्टेट बैंक (SBI) का पुराना होम लोन अभी भी सक्रिय है।',
      'हमारे एआई कानूनी विश्लेषण में पाया गया कि क्लॉज 4 आपको बैंक से नो-ड्यूज सर्टिफिकेट (NOC) मिले बिना ही पूरी रकम चुकाने के लिए बाध्य करता है। क्लॉज 9 के तहत चाबी देने की कोई निश्चित समय-सीमा तय नहीं की गई है। हस्ताक्षर करने से पूर्व अपने वकील से इन शर्तों को संशोधित करवाएं।',
    ],
    keyCovenants: [
      {
        category: 'मालिकाना हक व भारमुक्ति',
        status: 'ATTENTION',
        summary: 'SBI बैंक का होम लोन सक्रिय है। बैंक एनओसी के बिना भुगतान करना अत्यंत जोखिम भरा है।',
      },
      {
        category: 'चाबी व कब्जा सौंपना',
        status: 'CAUTION',
        summary: 'क्लॉज 9 में विक्रेता पर कब्जा देने की समय-सीमा लागू नहीं है। चाबी पंजीकरण टेबल पर ही ली जानी चाहिए।',
      },
      {
        category: 'क्षतिपूर्ति की अवधि',
        status: 'ATTENTION',
        summary: 'विक्रेता ने अपनी कानूनी देनदारी केवल 12 महीनों तक सीमित की है, जबकि कानूनन यह 12 वर्ष होनी चाहिए।',
      },
      {
        category: 'सोसायटी अनापत्ति प्रमाण पत्र',
        status: 'NORMAL',
        summary: 'गुलमोहर एन्क्लेव को-ऑपरेटिव हाउसिंग सोसायटी से ट्रांसफर एनओसी प्राप्त होना शेष है।',
      },
    ],
    criticalRisksIdentified: [
      {
        clause: 'क्लॉज 4 (पृष्ठ 7)',
        concern: 'बैंक एनओसी के बिना पूरी रकम का भुगतान',
        plainMeaning: 'यदि विक्रेता ने बैंक को पैसे नहीं चुकाए तो बैंक इस फ्लैट को कुर्क कर सकता है।',
        suggestedAdvocateFix: 'बकाया रकम सीधे स्टेट बैंक ऑफ इंडिया के लोन खाते में डिमांड ड्राफ्ट द्वारा जमा करवाएं।',
      },
      {
        clause: 'क्लॉज 9 (पृष्ठ 11)',
        concern: 'कब्जा सौंपने की कोई तय अंतिम तिथि नहीं',
        plainMeaning: 'आप पूरे पैसे दे देंगे परंतु विक्रेता चाबी देने में महीनों की देरी कर सकता है।',
        suggestedAdvocateFix: 'सब-रजिस्ट्रार कार्यालय में हस्ताक्षर के साथ ही चाबी सौंपना अनिवार्य करने का क्लॉज जोड़ें।',
      },
    ],
    recommendedNextSteps: [
      'उप-पंजीयक कार्यालय पुणे जाने से पूर्व अपने वकील के साथ तैयार किए गए 4 प्रश्नों पर चर्चा करें।',
      'भारतीय स्टेट बैंक से आधिकारिक लोन प्री-क्लोजर विवरण (Foreclosure Letter) की मांग करें।',
      'हवेली नंबर 2 सब-रजिस्ट्रार कार्यालय में 30 वर्षों का टाइटल सर्च सर्टिफिकेट सत्यापित करें।',
    ],
    generatedAt: new Date().toISOString(),
    modelUsed: 'Gemini 3.8 Flash Legal Pipeline (Vidhi Architecture Verified)',
    piiRedactedCount: 6,
  },
  MR: {
    headline:
      'कार्यकारी सारांश: फ्लॅट ४०२ कल्याणी नगर पुणे खरेदी खत — नोंदणीपूर्वी ३ महत्त्वाच्या अटींमध्ये बदल करण्याची शिफारस.',
    propertyTitle: 'फ्लॅट ४०२, गुलमोहर एन्क्लेव्ह, कल्याणी नगर, पुणे ४११००६',
    transactionType: 'खरेदी खत (Deed of Absolute Sale)',
    totalConsideration: '₹८६,००,०००/- (शहाऐंशी लाख रुपये)',
    parties: {
      vendor: 'श्री राजेश एस. वर्मा (विक्रेता)',
      purchaser: 'रोहन शर्मा (खरेदीदार)',
    },
    plainSummaryParagraphs: [
      'हा दस्तऐवज पुणे येथील कल्याणी नगरमधील फ्लॅट ४०२ च्या खरेदीचा मसुदा आहे. एकूण व्यवहार ₹८६ लाख रुपयांचा असून त्यापैकी ₹१७.२ लाख रुपये टोकन दिले गेले आहे आणि ₹६८.८ लाख नोंदणीवेळी देणे आहे.',
      'सदर फ्लॅटवर स्टेट बँक ऑफ इंडियाचे (SBI) गृहकर्ज चालू आहे. दस्तऐवजातील कलम ४ नुसार बँकेचे कर्जमुक्ती प्रमाणपत्र (NOC) न घेताच संपूर्ण रक्कम देण्याचे बंधन खरेदीदारावर टाकण्यात आले आहे.',
      'कलम ९ नुसार विक्रेता चावी देण्यास बांधील नसून वेळेचे बंधन फक्त खरेदीदाराच्या पैशांवर आहे. म्हणूनच हे खरेदी खत नोंदणीपूर्वी वकिलांकडून दुरुस्त करून घेणे अत्यावश्यक आहे.',
    ],
    keyCovenants: [
      {
        category: 'मालकी हक्क व बोजा',
        status: 'ATTENTION',
        summary: 'SBI बँकेचे कर्ज थकित आहे. बँक एनओसी शिवाय पैसे दिल्यास मालमत्ता जप्तीचा धोका संभवतो.',
      },
      {
        category: 'प्रत्यक्ष ताबा व चावी',
        status: 'CAUTION',
        summary: 'नोंदणीच्या वेळीच प्रत्यक्ष घराचा ताबा मिळणे आवश्यक आहे.',
      },
      {
        category: 'नुकसान भरपाई कालमर्यादा',
        status: 'ATTENTION',
        summary: 'विक्रेत्याने मालकी दोषाची जबाबदारी १२ महिन्यांवर मर्यादित केली आहे.',
      },
      {
        category: 'सोसायटी हस्तांतरण',
        status: 'NORMAL',
        summary: 'सोसायटी एनओसी आणि थकबाकी नसलेले प्रमाणपत्र आवश्यक आहे.',
      },
    ],
    criticalRisksIdentified: [
      {
        clause: 'कलम ४ (पान ७)',
        concern: 'बँक बोजा मुक्तीविना संपूर्ण रक्कम प्रदान',
        plainMeaning: 'विक्रेत्याने बँकेला पैसे न भरल्यास खरेदीदाराचा फ्लॅट धोक्यात येऊ शकतो.',
        suggestedAdvocateFix: 'शिल्लक रक्कम थेट बँकेच्या गृहकर्ज खात्यात डीडीद्वारे भरण्याचा बदल करावा.',
      },
      {
        clause: 'कलम ९ (पान ११)',
        concern: 'ताबा देण्याची अनिश्चित मुदत',
        plainMeaning: 'पैसे दिल्यानंतरही विक्रेता चावी देण्यास महिने विलंब करू शकतो.',
        suggestedAdvocateFix: 'नोंदणी कार्यालयात सही करतानाच प्रत्यक्ष चावी देणे बंधनकारक करावे.',
      },
    ],
    recommendedNextSteps: [
      'नोंदणीपूर्वी वकिलांसोबत तयार केलेल्या ४ प्रश्नांवर सल्लामसलत करा.',
      'SBI बँकेकडून अधिकृत कर्ज फेड पत्रक (Foreclosure Letter) प्राप्त करा.',
      'पुणे हवेली दुय्यम निबंधक कार्यालयातील ३० वर्षांचा शोध अहवाल (Search Report) तपासा.',
    ],
    generatedAt: new Date().toISOString(),
    modelUsed: 'Gemini 3.8 Flash Legal Pipeline (Vidhi Architecture Verified)',
    piiRedactedCount: 6,
  },
};

export const ExecutiveSummarySection: React.FC<ExecutiveSummarySectionProps> = ({
  language,
  customSummaryData,
  onOpenAdvocateBrief,
  onOpenDocument,
  onOpenPipelineViewer,
}) => {
  const [summaryData, setSummaryData] = useState<SummaryData>(
    customSummaryData || defaultSummaries[language]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sync with customSummaryData or language changes
  useEffect(() => {
    if (customSummaryData) {
      setSummaryData(customSummaryData);
    } else {
      setSummaryData(defaultSummaries[language]);
    }
  }, [customSummaryData, language]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pipeline/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      }
    } catch (e) {
      console.warn('Failed to regenerate via server, using fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `VIDHI LEGAL EXECUTIVE SUMMARY
Document: ${summaryData.propertyTitle}
Type: ${summaryData.transactionType}
Consideration: ${summaryData.totalConsideration}

HEADLINE:
${summaryData.headline}

SUMMARY:
${summaryData.plainSummaryParagraphs.join('\n\n')}

CRITICAL CLAUSES TO AMEND:
${summaryData.criticalRisksIdentified.map((c) => `- ${c.clause}: ${c.concern} -> Fix: ${c.suggestedAdvocateFix}`).join('\n')}

NEXT STEPS:
${summaryData.recommendedNextSteps.join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const fullSpeechText = `${summaryData.headline}. ${summaryData.plainSummaryParagraphs.join(' ')}`;
    const utterance = new SpeechSynthesisUtterance(fullSpeechText);
    utterance.rate = 0.95;
    if (language === 'HI') utterance.lang = 'hi-IN';
    else if (language === 'MR') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl shadow-xs overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-[#F3F0E8] bg-[#FAF8F2] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-7 h-7 rounded bg-[#F0EBE0] text-[#1C1C19] flex items-center justify-center border border-[#DDD9CE] shrink-0 mt-0.5 sm:mt-0 font-mono text-xs font-bold">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold text-[#1C1C19] font-serif">
                Executive Document Synthesis
              </h2>
              <span className="text-[10px] uppercase font-mono font-semibold bg-[#F2E6C9] text-[#8C621E] px-2 py-0.5 rounded border border-[#E8DAB7]">
                Plain-Language Legal Brief
              </span>
              <span className="text-[10px] font-mono text-[#73716A] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#58735C]" />
                PII Protected ({summaryData.piiRedactedCount} items redacted)
              </span>
            </div>
            <p className="text-xs text-[#6F6D65] mt-0.5">
              High-level AI synthesis of parties, financial covenants, and critical clause commitments before registration.
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
          <button
            onClick={handleToggleSpeak}
            className={`p-2 rounded border text-xs flex items-center gap-1 transition-colors ${
              isSpeaking
                ? 'bg-[#C38A2E] text-[#1C1C19] border-[#C38A2E]'
                : 'bg-[#FCFBF7] text-[#6F6D65] border-[#DDD9CE] hover:text-[#1C1C19] hover:bg-[#F3F0E8]'
            }`}
            title={isSpeaking ? 'Stop audio' : 'Listen to Executive Summary'}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">
              {isSpeaking ? 'Pause' : 'Listen'}
            </span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded border border-[#DDD9CE] bg-[#FCFBF7] hover:bg-[#F3F0E8] text-[#6F6D65] hover:text-[#1C1C19] text-xs flex items-center gap-1 transition-colors"
            title="Copy Executive Summary to Clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#58735C]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">
              {isCopied ? 'Copied' : 'Copy'}
            </span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="p-2 rounded border border-[#DDD9CE] bg-[#FCFBF7] hover:bg-[#F3F0E8] text-[#6F6D65] hover:text-[#1C1C19] text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Re-run AI processing on backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C38A2E]' : ''}`} />
            <span className="text-[11px] hidden sm:inline">
              {isLoading ? 'Processing...' : 'Refresh AI'}
            </span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded border border-[#DDD9CE] bg-[#FCFBF7] hover:bg-[#F3F0E8] text-[#6F6D65] hover:text-[#1C1C19] text-xs transition-colors"
            title={isExpanded ? 'Collapse Executive Summary' : 'Expand Executive Summary'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 md:p-6 space-y-6 animate-fade-in">
          {/* Key Transaction Facts Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-[#F7F4EC] rounded-lg border border-[#DDD9CE] space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#73716A] font-semibold">
                Target Property
              </span>
              <p className="text-xs font-semibold text-[#1C1C19] truncate" title={summaryData.propertyTitle}>
                {summaryData.propertyTitle}
              </p>
            </div>

            <div className="p-3 bg-[#F7F4EC] rounded-lg border border-[#DDD9CE] space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#73716A] font-semibold">
                Transaction Type
              </span>
              <p className="text-xs font-semibold text-[#1C1C19]">
                {summaryData.transactionType}
              </p>
            </div>

            <div className="p-3 bg-[#F7F4EC] rounded-lg border border-[#DDD9CE] space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#73716A] font-semibold">
                Total Consideration
              </span>
              <p className="text-xs font-bold text-[#1C1C19] font-mono">
                {summaryData.totalConsideration}
              </p>
            </div>

            <div className="p-3 bg-[#F7F4EC] rounded-lg border border-[#DDD9CE] space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#73716A] font-semibold">
                Identified Parties
              </span>
              <p className="text-xs font-medium text-[#1C1C19] truncate">
                {summaryData.parties.vendor.split('(')[0].trim()} → {summaryData.parties.purchaser.split('(')[0].trim()}
              </p>
            </div>
          </div>

          {/* High-Level Plain Language Narrative */}
          <div className="p-4 sm:p-5 rounded-lg bg-[#FAF8F2] border border-[#E8E4D9] space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-6 bg-[#C38A2E] rounded-full mt-0.5 shrink-0" />
              <h3 className="text-sm sm:text-base font-semibold text-[#1C1C19] font-serif leading-snug">
                {summaryData.headline}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-[#4A4843] leading-relaxed pl-4">
              {summaryData.plainSummaryParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Covenant Status Bar Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C1C19] font-mono">
                Key Covenants & Transaction Safeguards
              </span>
              <span className="text-[10px] font-mono text-[#73716A]">
                Assessed across 18 Draft Pages
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summaryData.keyCovenants.map((cov, idx) => {
                const isAttention = cov.status === 'ATTENTION';
                const isCaution = cov.status === 'CAUTION';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isAttention
                        ? 'bg-[#FAF3F1] border-[#EADBDA]'
                        : isCaution
                        ? 'bg-[#F9F5EC] border-[#EADFC7]'
                        : 'bg-[#F2F7F2] border-[#D5E2D5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#1C1C19]">
                        {cov.category}
                      </span>
                      <span
                        className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                          isAttention
                            ? 'bg-[#8E4A3F] text-white'
                            : isCaution
                            ? 'bg-[#B08427] text-white'
                            : 'bg-[#58735C] text-white'
                        }`}
                      >
                        {cov.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#595751] leading-relaxed">
                      {cov.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Risk Findings & Recommended Advocate Fixes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C1C19] font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8E4A3F]" />
                Priority Clauses Requiring Amendment Prior to Signing
              </span>
              {onOpenAdvocateBrief && (
                <button
                  onClick={onOpenAdvocateBrief}
                  className="text-xs text-[#8C621E] hover:underline font-medium flex items-center gap-1"
                >
                  <span>Open Complete Advocate Brief</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {summaryData.criticalRisksIdentified.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#FCFBF7] border border-[#DDD9CE] hover:border-[#C9C4B7] rounded-lg transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-[#1C1C19] flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-[#FAF3F1] text-[#8E4A3F] border border-[#EADBDA] px-2 py-0.5 rounded font-bold">
                        {item.clause}
                      </span>
                      <span>{item.concern}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#73716A]">
                      High Exposure
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F3F0E8]">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#73716A] font-semibold block">
                        Citizen Meaning:
                      </span>
                      <p className="text-[#595751] mt-0.5 leading-snug">
                        {item.plainMeaning}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#8C621E] font-semibold block">
                        Suggested Legal Fix:
                      </span>
                      <p className="text-[#1C1C19] mt-0.5 leading-snug font-medium">
                        {item.suggestedAdvocateFix}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer: Next Steps & AI Pipeline Metadata */}
          <div className="pt-3 border-t border-[#F3F0E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#73716A]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono bg-[#F7F4EC] px-2 py-0.5 rounded border border-[#DDD9CE]">
                Backend: {summaryData.modelUsed}
              </span>
              {onOpenPipelineViewer && (
                <button
                  onClick={onOpenPipelineViewer}
                  className="text-[10px] font-mono text-[#8C621E] hover:underline flex items-center gap-1"
                >
                  <span>Inspect Redaction &amp; Pipeline Trace →</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onOpenDocument && (
                <button
                  onClick={onOpenDocument}
                  className="text-xs font-medium text-[#1C1C19] hover:underline"
                >
                  Inspect Full Draft Document
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
