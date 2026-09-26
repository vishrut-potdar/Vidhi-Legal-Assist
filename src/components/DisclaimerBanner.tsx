import React, { useState } from 'react';
import { Info, Scale, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types';

interface DisclaimerBannerProps {
  language: Language;
  compact?: boolean;
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  language,
  compact = false,
  className = '',
}) => {
  const [showExtended, setShowExtended] = useState(false);

  const texts = {
    EN: {
      headline: 'Legal Information, Not Legal Advice · Uncertainty Signaling Active',
      summary:
        'Vidhi provides algorithmic legal literacy, source-span extraction, and advocate intake preparation. It does not provide legal representation or formal legal opinions. Always consult an advocate enrolled with the State Bar Council before signing or paying.',
      details:
        'Uncertainty Notice: Contractual terms are analyzed strictly against the provided text. Where rights depend on unattached documents (e.g. Schedule III) or unrecorded facts (e.g. status of bank charges or municipal NOCs), uncertainty is explicitly signaled. Software analysis cannot substitute for title clearance under Section 55 of the Transfer of Property Act 1882.',
      toggleMore: 'Read compliance & uncertainty disclosure',
      toggleLess: 'Hide disclosure',
    },
    HI: {
      headline: 'कानूनी जानकारी, कानूनी सलाह नहीं · अनिश्चितता संकेतक सक्रिय',
      summary:
        'विधि केवल कानूनी साक्षरता, स्रोत-उद्धरण और वकील परामर्श के लिए तैयारी प्रदान करती है। यह कानूनी राय या वकालत नहीं है। दस्तावेज पर हस्ताक्षर करने या राशि देने से पहले बार काउंसिल में पंजीकृत वकील से परामर्श अवश्य लें।',
      details:
        'अनिश्चितता सूचना: शर्तों का विश्लेषण दिए गए मूल पाठ के आधार पर किया जाता है। जहाँ अधिकार अनुपस्थित अनुसूचियों (जैसे शेड्यूल III) या बैंक एनओसी पर निर्भर हैं, वहाँ अनिश्चितता स्पष्ट रूप से दर्शायी गई है।',
      toggleMore: 'अनुपालन व अनिश्चितता विवरण पढ़ें',
      toggleLess: 'विवरण छुपाएं',
    },
    MR: {
      headline: 'कायदेशीर माहिती, कायदेशीर सल्ला नाही · अनिश्चितता निर्देश सक्रिय',
      summary:
        'विधि ही केवळ कायदेशीर साक्षरता, कागदपत्रांचे उतारे आणि वकिलांशी चर्चेसाठी पूर्वतयारी प्रदान करते. हा कोणताही अंतिम कायदेशीर सल्ला नाही. स्वाक्षरी करण्यापूर्वी बार कौन्सिल नोंदणीकृत वकिलांचा प्रत्यक्ष सल्ला घेणे अनिवार्य आहे.',
      details:
        'अनिश्चितता सूचना: कागदपत्रातील अटींचे विश्लेषण उपलब्ध मजकुरावरून केले आहे. जिथे हक्क गहाळ परिशिष्ट (जसे शेड्यूल III) किंवा बँकेच्या ना-हरकत प्रमाणपत्रावर (NOC) अवलंबून आहेत, तिथे अनिश्चितता स्पष्टपणे दर्शवली आहे.',
      toggleMore: 'कायदेशीर खुलासा व अनिश्चितता तपशील वाचा',
      toggleLess: 'तपशील लपवा',
    },
  };

  const t = texts[language] || texts.EN;

  return (
    <div className={`w-full bg-[#FAF8F2] border border-[#E0D8C3] rounded-lg px-4 py-3 shadow-xs space-y-2 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#8C621E]/15 text-[#8C621E] flex items-center justify-center shrink-0 mt-0.5">
            <Scale className="w-3 h-3" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#8C621E]">
              {t.headline}
            </div>
            <p className="text-xs text-[#5D5745] leading-relaxed mt-0.5">
              {t.summary}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExtended(!showExtended)}
          className="text-[11px] font-mono text-[#8C621E] hover:text-[#1C1C19] shrink-0 underline flex items-center gap-0.5 pt-0.5"
        >
          <span>{showExtended ? t.toggleLess : t.toggleMore}</span>
          {showExtended ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {showExtended && (
        <div className="pt-2 border-t border-[#EAE3D0] text-xs text-[#6F6D65] leading-relaxed bg-[#FAF6EC] p-3 rounded space-y-1.5 animate-fade-in font-sans">
          <p>{t.details}</p>
          <div className="text-[10px] font-mono text-[#8C887B] flex items-center gap-2">
            <span>JURISDICTION: MAHARASHTRA, INDIA</span>
            <span>·</span>
            <span>REGISTRATION ACT 1908</span>
            <span>·</span>
            <span>TRANSFER OF PROPERTY ACT 1882</span>
          </div>
        </div>
      )}
    </div>
  );
};
