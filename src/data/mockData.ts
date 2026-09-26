import {
  DocumentInfo,
  Finding,
  LearningModule,
  CourtStage,
  TimelineEvent,
  GlossaryItem,
  MissingDocument,
  DocumentVersion,
  DocumentAnnotation,
} from '../types';

export const initialDocumentAnnotations: DocumentAnnotation[] = [
  {
    id: 'anno-1',
    documentId: 'doc-sale-deed-402',
    pageNumber: 7,
    lineNumber: 4,
    clauseNumber: 4,
    lineText:
      'whether or not the encumbrances recorded against the said Flat as on the date hereof have been discharged by the Vendor.',
    selectedSnippet: 'whether or not the encumbrances recorded against the said Flat...',
    color: 'rose',
    note: 'CRITICAL: Check with Advocate Kulkarni if HDFC bank loan release NOC must be verified before handing over the balance banker\'s cheque.',
    tag: 'ADVOCATE_QUERY',
    createdAt: '2026-09-23T10:15:00Z',
  },
  {
    id: 'anno-2',
    documentId: 'doc-sale-deed-402',
    pageNumber: 7,
    lineNumber: 8,
    clauseNumber: 5,
    lineText: 'save as disclosed in Schedule III hereto,',
    selectedSnippet: 'save as disclosed in Schedule III hereto',
    color: 'amber',
    note: 'Schedule III is missing from this draft! Demand seller attach full schedule of earlier liabilities prior to registration.',
    tag: 'ACTION_ITEM',
    createdAt: '2026-09-23T10:22:00Z',
  },
  {
    id: 'anno-3',
    documentId: 'doc-sale-deed-402',
    pageNumber: 7,
    lineNumber: 12,
    clauseNumber: 6,
    lineText: 'within a reasonable time after registration,',
    selectedSnippet: 'within a reasonable time after registration',
    color: 'yellow',
    note: '"Reasonable time" is too vague. Request advocate to amend to "within 7 calendar days of registration (i.e. on or before 30th Sept 2026)".',
    tag: 'ADVOCATE_QUERY',
    createdAt: '2026-09-23T10:30:00Z',
  },
];

export const initialDocumentInfo: DocumentInfo = {
  id: 'doc-sale-deed-402',
  title: 'Sale deed — Flat 402, Kalyani Nagar',
  property: 'Flat No. 402, 4th Floor, ' + 'Gulmohar Residency, Kalyani Nagar, Pune - 411006',
  city: 'Pune, Maharashtra',
  totalConsideration: '₹86,00,000',
  reviewedTimeAgo: 'Reviewed 2 hours ago',
  pageCount: 18,
  version: 'Draft v2.1',
  riskScore: 62,
  riskVerdict: 'Review recommended before execution',
  highCount: 2,
  mediumCount: 3,
  lowCount: 2,
};

export const initialFindings: Finding[] = [
  {
    id: 'f-1',
    clauseNumber: 4,
    pageNumber: 7,
    severity: 'HIGH',
    theme: 'Payment & encumbrances',
    themeScorePercent: 85,
    shortTitle: 'You must pay in full even if the flat still carries a loan or charge',
    shortTitleHindi: 'फ्लैट पर बैंक लोन होने पर भी आपको पूरा भुगतान करना होगा',
    shortTitleMarathi: 'फ्लॅटवर बँकेचे कर्ज किंवा बोजा असला तरी तुम्हाला पूर्ण रक्कम द्यावी लागेल',
    plainHeadline: 'You pay the full price whether or not the seller has cleared existing charges on the flat.',
    plainHeadlineHindi: 'सेलर ने फ्लैट का पुराना लोन चुकाया हो या नहीं, आपको पूरी रकम देनी होगी।',
    plainHeadlineMarathi: 'विक्रेत्याने फ्लॅटवरील बँकेचे जुने कर्ज फेडले असो वा नसो, तुम्हाला पूर्ण रक्कम द्यावी लागेल.',
    sourceQuote:
      '4. The Purchaser shall pay the balance consideration of ₹ 86,00,000 (Rupees Eighty-Six Lakhs only) to the Vendor on or before the date of execution hereof, whether or not the encumbrances recorded against the said Flat as on the date hereof have been discharged by the Vendor.',
    plainLanguageExplanation:
      'An encumbrance is any claim already attached to the property — most often a home loan, but also an attachment by a court or a pending tax demand. Normally the buyer\'s final payment is released only when those claims are shown to be cleared. This clause removes that link: you pay first, and the seller\'s promise to clear the charge becomes a separate promise you would have to enforce.',
    plainLanguageExplanationHindi:
      'बोझ (Encumbrance) का अर्थ है संपत्ति पर कोई पुराना बैंक लोन या अदालती कुर्की। आम तौर पर अंतिम भुगतान तभी किया जाता है जब पुराना लोन पूरी तरह चुकता हो जाए। यह शर्त उस सुरक्षा को हटा देती है।',
    plainLanguageExplanationMarathi:
      'बोजा (Encumbrance) म्हणजे फ्लॅटवर असलेले बँकेचे गृहकर्ज किंवा कर थकबाकी. सामान्यतः जुने कर्ज फेडल्याचा पुरावा मिळाल्यावरच उर्वरित रक्कम दिली जाते. ही अट ती सुरक्षा काढून घेते: तुम्ही पैसे आधी द्यायचे आणि कर्ज फेडण्याची जबाबदारी विक्रेत्यावर स्वतंत्र राहते.',
    practicalConsequences: [
      'A sale deed is registered as it stands. Once it is registered and paid, changing the bargain means a suit, not a conversation.',
      'A charge that survives the sale usually follows the property, so the lender\'s claim can be pressed against you as the new owner.',
      'Civil recovery in the district court commonly runs for years. The practical protection is the wording, not the remedy.',
    ],
    advocateQuestion:
      'Can we make the balance payment conditional on the encumbrance being discharged, or place it in escrow until then?',
    advocateWhy:
      'clause 4 unlinks payment from the seller clearing the recorded charge. Ask what protection is realistic here and what it would cost.',
    inAdvocateBrief: true,
    audioScriptHindi:
      'नियम संख्या 4 के अनुसार, आपको फ्लैट की पूरी बकाया रकम देनी होगी, भले ही सेलर ने अपने बैंक का पुराना होम लोन नहीं चुकाया हो।',
    audioScriptEnglish:
      'Under clause 4, you are required to pay the full balance whether or not the encumbrances have been discharged.',
    audioScriptMarathi:
      'कलम 4 नुसार, विक्रेत्याने बँकेचे जुने गृहकर्ज फेडलेले नसले तरी तुम्हाला खरेदीखताच्या वेळी पूर्ण ८६ लाख रुपये द्यावे लागतील.',
    relatedModuleId: 'mod-02',
    sourceSpan: {
      documentId: 'doc-sale-deed-402',
      clauseNumber: 4,
      pageNumber: 7,
      startLine: 12,
      endLine: 16,
      exactQuote:
        'The Purchaser shall pay the balance consideration of ₹ 86,00,000 (Rupees Eighty-Six Lakhs only) to the Vendor on or before the date of execution hereof, whether or not the encumbrances recorded against the said Flat as on the date hereof have been discharged by the Vendor.',
      anchorId: 'clause-4-quote',
    },
    uncertaintySignal: {
      level: 'HIGH_CERTAINTY',
      label: 'High Textual Certainty (Express contractual clause)',
      labelHindi: 'उच्च निश्चितता (दस्तावेज़ में स्पष्ट रूप से लिखित)',
      labelMarathi: 'उच्च खात्रीशीरता (दस्तऐवजात स्पष्ट नमूद अट)',
      reason:
        'The clause phrasing is unambiguous in cutting off the buyer\'s right to withhold money. However, actual financial exposure is uncertain until SBI provides a formal foreclosure statement confirming the exact outstanding balance.',
      reasonHindi:
        'शर्त की भाषा खरीदार के भुगतान रोकने के अधिकार को स्पष्ट रूप से समाप्त करती है। जब तक एसबीआई औपचारिक नो-ड्यूज नहीं देता, वास्तविक देनदारी अनिश्चित है।',
      reasonMarathi:
        'अटीची भाषा स्पष्टपणे पैसे रोखण्याचा हक्क काढून घेते. परंतु एसबीआय बँकेचे अधिकृत ना-हरकत प्रमाणपत्र मिळाल्याशिवाय नेमका धोका किती ते निश्चित सांगता येत नाही.',
      counselRequiredAction:
        'Instruct advocate to demand an original SBI No-Dues Certificate or require payment via banker\'s cheque made out directly to SBI loan account.',
    },
  },
  {
    id: 'f-2',
    clauseNumber: 6,
    pageNumber: 7,
    severity: 'HIGH',
    theme: 'Possession & outgoings',
    themeScorePercent: 80,
    shortTitle: '"Reasonable time" for possession is not a date',
    shortTitleHindi: 'कब्जे के लिए "उचित समय" कोई निश्चित तारीख नहीं है',
    shortTitleMarathi: 'ताब्यासाठी "वाजवी वेळ" ही कोणतीही निश्चित तारीख नाही',
    plainHeadline: '"Reasonable time" for possession is not a date',
    plainHeadlineHindi: 'कब्जा कब मिलेगा इसकी कोई तारीख नहीं, लेकिन मेंटेनेंस का खर्चा आज से आपका।',
    plainHeadlineMarathi: 'फ्लॅटचा प्रत्यक्ष ताबा कधी मिळेल याची तारीख नाही, पण देखभाल खर्च मात्र तुमच्या माथी.',
    sourceQuote:
      '6. Possession of the said Flat shall be handed over to the Purchaser within a reasonable time after registration, and the Purchaser shall bear all outgoings from the date of this Deed irrespective of the date on which possession is actually delivered.',
    plainLanguageExplanation:
      'Meanwhile maintenance and tax fall on you from the date of the deed.',
    plainLanguageExplanationHindi:
      'रजिस्ट्रेशन के बाद "उचित समय" में कब्जा देने की बात कही गई है, लेकिन मेंटेनेंस और संपत्ति कर की देनदारी आज से ही आप पर डाल दी गई है।',
    plainLanguageExplanationMarathi:
      'नोंदणीनंतर "वाजवी मुदतीत" ताबा देण्याचे नमूद आहे, परंतु सोसायटी देखभाल खर्च आणि महापालिका कर भरण्याची जबाबदारी आजपासूनच तुमच्यावर टाकण्यात आली आहे.',
    practicalConsequences: [
      'The seller can delay handing over physical keys without a breach of contract.',
      'You bear maintenance fees, property taxes, and society charges while locked out of the premises.',
      'Without an escrow or damages provision, you lack leverage to enforce timely possession.',
    ],
    advocateQuestion:
      'Should possession carry a fixed date, and should outgoings start only from that date?',
    advocateWhy:
      'clause 6 says "reasonable time" while charging me maintenance and tax from the date of the deed.',
    inAdvocateBrief: true,
    audioScriptHindi:
      'नियम संख्या 6 में कब्जा सौंपने की कोई निश्चित तारीख नहीं दी गई है, जबकि मेंटेनेंस और टैक्स का भार आप पर तुरंत आ जाएगा।',
    audioScriptEnglish:
      'Clause 6 states possession within a reasonable time, while transferring maintenance outgoings to you immediately.',
    audioScriptMarathi:
      'कलम 6 मध्ये फ्लॅटच्या चाव्या देण्याची ठाम तारीख नाही, परंतु सर्व कर आणि मेंटेनन्सचे पैसे लगेच भरण्याचे बंधन घातले आहे.',
    relatedModuleId: 'mod-05',
    sourceSpan: {
      documentId: 'doc-sale-deed-402',
      clauseNumber: 6,
      pageNumber: 7,
      startLine: 24,
      endLine: 28,
      exactQuote:
        'Possession of the said Flat shall be handed over to the Purchaser within a reasonable time after registration, and the Purchaser shall bear all outgoings from the date of this Deed irrespective of the date on which possession is actually delivered.',
      anchorId: 'clause-6-quote',
    },
    uncertaintySignal: {
      level: 'MEDIUM_UNCERTAINTY',
      label: 'Medium Uncertainty (Subject to judicial interpretation)',
      labelHindi: 'मध्यम अनिश्चितता (अदालती व्याख्या पर निर्भर)',
      labelMarathi: 'मध्यम अनिश्चितता (न्यायालयीन अर्थनिर्णयावर अवलंबून)',
      reason:
        'Under Section 46 of the Indian Contract Act 1872, "reasonable time" is a question of fact. If the seller delays for 6 months, civil courts may or may not deem it reasonable without a fixed long-stop date.',
      reasonHindi:
        'भारतीय अनुबंध अधिनियम धारा 46 के तहत "उचित समय" तथ्यों पर निर्भर करता है। अदालतें इसे अलग-अलग व्याख्या दे सकती हैं।',
      reasonMarathi:
        'भारतीय करार कायद्याच्या कलम 46 नुसार "वाजवी वेळ" ही वस्तुस्थितीवर अवलंबून असते. ठाम तारीख नसल्यास वाद उद्भवल्यास दिवाणी कोर्टात वर्षानुवर्षे वेळ लागू शकतो.',
      counselRequiredAction:
        'Amend clause to substitute "reasonable time" with "simultaneous key handover upon Sub-Registrar biometric verification on 19 September 2026".',
    },
  },
  {
    id: 'f-3',
    clauseNumber: 5,
    pageNumber: 7,
    severity: 'MEDIUM',
    theme: 'Title & disclosure',
    themeScorePercent: 60,
    shortTitle: 'Schedule III is referred to but is not attached',
    shortTitleHindi: 'अनुसूची III का संदर्भ दिया गया है लेकिन वह संलग्न नहीं है',
    shortTitleMarathi: 'परिशिष्ट III चा उल्लेख आहे परंतु ते जोडलेले नाही',
    plainHeadline: 'Schedule III is referred to but is not attached',
    plainHeadlineHindi: 'साफ मालिकाना हक के वादे में एक ऐसी अनुसूची का अपवाद है जिसे आपने देखा ही नहीं।',
    plainHeadlineMarathi: 'निर्दोष मालकी हक्काच्या घोषणेत अशा परिशिष्टाचा अपवाद आहे जे तुम्हाला दाखवलेलेच नाही.',
    sourceQuote:
      '5. The Vendor declares that the said Flat is free from all encumbrances, charges, liens, attachments and claims of any nature whatsoever, save as disclosed in Schedule III hereto, and undertakes to indemnify the Purchaser against any claim arising from any act of the Vendor prior to the date hereof.',
    plainLanguageExplanation:
      'The declaration of clear title is carved out by a schedule you have not seen.',
    plainLanguageExplanationHindi:
      'सेलर का कहना है कि संपत्ति हर तरह के कर्ज से मुक्त है, सिवाय उनके जो शेड्यूल III में लिखे हैं—लेकिन यह शेड्यूल गायब है।',
    plainLanguageExplanationMarathi:
      'विक्रेता म्हणतो की फ्लॅट सर्व कर्जांपासून मुक्त आहे, केवळ परिशिष्ट ३ मधील बाबी वगळून—परंतु परिशिष्ट ३ या मसुद्यात जोडलेलेच नाही.',
    practicalConsequences: [
      'The seller\'s declaration of clear title contains an explicit exception that is omitted from the document.',
      'Hidden liabilities or encumbrances might be added to Schedule III later.',
      'Your title protection is weakened without reviewing the complete annexures.',
    ],
    advocateQuestion:
      'Schedule III is referenced but not attached — what does it disclose, and does it cut down the clear-title declaration?',
    advocateWhy:
      'clause 5 declares clear title except for Schedule III, which is missing from this draft.',
    inAdvocateBrief: true,
    audioScriptHindi:
      'नियम संख्या 5 में अनुसूची 3 (Schedule III) का उल्लेख है लेकिन वह इस मसौदे के साथ संलग्न नहीं है।',
    audioScriptEnglish:
      'Schedule III is referenced to carve out exceptions to clear title, but is not attached.',
    audioScriptMarathi:
      'कलम 5 मध्ये परिशिष्ट 3 चा अपवाद दिला आहे, पण ते परिशिष्ट अद्याप मसुद्यात दिलेले नाही.',
    relatedModuleId: 'mod-02',
    sourceSpan: {
      documentId: 'doc-sale-deed-402',
      clauseNumber: 5,
      pageNumber: 7,
      startLine: 18,
      endLine: 22,
      exactQuote:
        'The Vendor declares that the said Flat is free from all encumbrances, charges, liens, attachments and claims of any nature whatsoever, save as disclosed in Schedule III hereto, and undertakes to indemnify the Purchaser...',
      anchorId: 'clause-5-quote',
    },
    uncertaintySignal: {
      level: 'HIGH_UNCERTAINTY',
      label: 'High Uncertainty (Missing document / Unattached schedule)',
      labelHindi: 'उच्च अनिश्चितता (लापता परिशिष्ट / अदृश्य शर्तें)',
      labelMarathi: 'उच्च अनिश्चितता (गहाळ परिशिष्ट / न पाहिलेल्या अटी)',
      reason:
        'Vidhi cannot verify title exceptions without Schedule III. The seller could insert third-party claims, tenant rights, or easements into Schedule III prior to registration.',
      reasonHindi:
        'शेड्यूल III के बिना यह जानना असंभव है कि सेलर कौन सी देनदारियां छुपा रहा है।',
      reasonMarathi:
        'परिशिष्ट ३ पाहिल्याशिवाय विक्रेता कोणत्या जुन्या देणी किंवा भाडेकरूचे हक्क लादत आहे हे ठरवणे अशक्य आहे.',
      counselRequiredAction:
        'Insist on obtaining physical signed copy of Schedule III or replace with "There are no exceptions whatsoever (Schedule III: NIL)".',
    },
  },
  {
    id: 'f-4',
    clauseNumber: 11,
    pageNumber: 12,
    severity: 'MEDIUM',
    theme: 'Title & disclosure',
    themeScorePercent: 55,
    shortTitle: 'Only one of two recorded co-owners is a party',
    shortTitleHindi: 'रिकॉर्ड में दर्ज दो सह-मालिकों में से केवल एक ही पक्षकार है',
    shortTitleMarathi: 'नोंदणीकृत दोन सह-मालकांपैकी फक्त एकच व्यक्ती दस्तामध्ये पक्षकार आहे',
    plainHeadline: 'Only one of two recorded co-owners is a party',
    plainHeadlineHindi: 'सरकारी रिकॉर्ड में दो सह-मालिक हैं, लेकिन इस मसौदे पर केवल एक ही हस्ताक्षर कर रहा है।',
    plainHeadlineMarathi: 'शासकीय अभिलेखात दोन सह-मालक असताना मसुद्यात केवळ एकाच व्यक्तीची स्वाक्षरी प्रस्तावित आहे.',
    sourceQuote:
      '11. The Vendor declares that he has full right and authority to convey the said Flat on behalf of the registered co-owners without necessity of separate concurrence.',
    plainLanguageExplanation:
      'The second owner named in the records has not signed this draft.',
    plainLanguageExplanationHindi:
      'संपत्ति के कागजात में दो मालिकों के नाम हैं, लेकिन दूसरा मालिक इस दस्तावेज पर दस्तखत नहीं कर रहा है।',
    plainLanguageExplanationMarathi:
      '७/१२ उतारा आणि सोसायटी शेअर्सवर दोन सह-मालकांची नावे आहेत, मात्र विक्रीपत्रात दुसरा मालक उपस्थित नाही किंवा त्याचे पॉवर ऑफ अ‍ॅटर्नी नाही.',
    practicalConsequences: [
      'In India, conveyancing requires all registered co-owners to execute the deed or issue a registered Power of Attorney.',
      'The non-signing co-owner can challenge the sale in civil court as void or unauthorized.',
      'Sub-registrar may refuse registration without all co-owners or registered POA.',
    ],
    advocateQuestion:
      'The records show two co-owners but only one is a party. Do we need the second owner to sign or give a power of attorney?',
    advocateWhy:
      'title records indicate co-ownership; both must execute or grant formal power.',
    inAdvocateBrief: true,
    audioScriptHindi:
      'रिकॉर्ड में दो सह-मालिक दर्ज हैं लेकिन इस मसौदे में केवल एक ही पक्षकार है।',
    audioScriptEnglish:
      'The records show two co-owners but only one is a party to the sale deed.',
    audioScriptMarathi:
      'कलम 11 मध्ये एकाच सह-मालकाने स्वाक्षरी केल्याचे दिसते, ज्यामुळे दुसऱ्या सह-मालकाकडून नंतर वाद निर्माण होऊ शकतो.',
    relatedModuleId: 'mod-02',
    sourceSpan: {
      documentId: 'doc-sale-deed-402',
      clauseNumber: 11,
      pageNumber: 12,
      startLine: 8,
      endLine: 12,
      exactQuote:
        'The Vendor declares that he has full right and authority to convey the said Flat on behalf of the registered co-owners without necessity of separate concurrence.',
      anchorId: 'clause-11-quote',
    },
    uncertaintySignal: {
      level: 'HIGH_CERTAINTY',
      label: 'High Textual Certainty (Express statutory violation under Sec 44 TPA)',
      labelHindi: 'उच्च निश्चितता (टीपीए धारा 44 के तहत कानूनी जोखिम)',
      labelMarathi: 'उच्च खात्रीशीरता (हस्तांतरण कायदा कलम 44 नुसार कायदेशीर धोका)',
      reason:
        'Under Section 44 of the Transfer of Property Act 1882, one co-owner cannot convey clear title to the whole flat without registered power of attorney or joint execution.',
      reasonHindi:
        'संपत्ति अंतरण अधिनियम की धारा 44 के अनुसार बिना मुख्तारनामे के एक सह-मालिक पूरी संपत्ति नहीं बेच सकता।',
      reasonMarathi:
        'कायद्यानुसार एका सह-मालकाला दुसऱ्या सह-मालकाच्या संमतीशिवाय संपूर्ण फ्लॅट विकण्याचा अधिकार नाही.',
      counselRequiredAction:
        'Demand execution by both co-owners or verify a registered, irrevocable Power of Attorney at Haveli Sub-Registrar.',
    },
  },
  {
    id: 'f-5',
    clauseNumber: 7,
    pageNumber: 8,
    severity: 'MEDIUM',
    theme: 'Costs & stamp duty',
    themeScorePercent: 50,
    shortTitle: 'All incidental expenses sit with you, undefined',
    shortTitleHindi: 'सभी प्रासंगिक खर्च आप पर डाल दिए गए हैं, जिनकी कोई सूची नहीं है',
    shortTitleMarathi: 'सर्व अनुषंगिक खर्च (Incidental Expenses) खरेदीदाराच्या माथी, तपशील निरंक',
    plainHeadline: 'All incidental expenses sit with you, undefined',
    plainHeadlineHindi: 'स्टाम्प ड्यूटी के अलावा "प्रासंगिक खर्च" भी आपके खाते में, लेकिन यह क्या हैं यह नहीं बताया गया।',
    plainHeadlineMarathi: 'मुद्रांक शुल्काव्यतिरिक्त "इतर अनुषंगिक खर्च" तुमच्यावर लादले आहेत, मात्र त्याची व्याख्या दिलेली नाही.',
    sourceQuote:
      '7. All stamp duty, registration charges and incidental expenses in respect of this Deed shall be borne and paid by the Purchaser alone.',
    plainLanguageExplanation:
      '"Incidental expenses" is not itemised anywhere in the draft.',
    plainLanguageExplanationHindi:
      'मसौदे में प्रासंगिक खर्चों की कोई सीमा या सूची नहीं दी गई है।',
    plainLanguageExplanationMarathi:
      'मसुद्यात कोणत्याही अनपेक्षित प्रशासकीय किंवा सोसायटी शुल्काची मर्यादा निश्चित केलेली नाही.',
    practicalConsequences: [
      'Unspecified administrative, society, or legal expenses might be billed to you.',
      'No cap or breakdown is provided for miscellaneous processing charges.',
    ],
    advocateQuestion:
      'Can incidental expenses be itemised or excluded so unstated administrative costs are not shifted to the buyer?',
    advocateWhy:
      'the term "incidental expenses" is ambiguous and should be clarified or deleted.',
    inAdvocateBrief: false,
    audioScriptHindi:
      'नियम संख्या 7 के अनुसार सभी प्रासंगिक खर्च आप पर डाल दिए गए हैं, जिनकी कोई सूची नहीं है।',
    audioScriptEnglish:
      'Clause 7 places all undefined incidental expenses solely on the purchaser.',
    audioScriptMarathi:
      'कलम 7 नुसार सर्व अनिर्दिष्ट प्रशासकीय खर्च खरेदीदारानेच भरावेत असे नमूद आहे.',
    relatedModuleId: 'mod-07',
    sourceSpan: {
      documentId: 'doc-sale-deed-402',
      clauseNumber: 7,
      pageNumber: 8,
      startLine: 4,
      endLine: 7,
      exactQuote:
        'All stamp duty, registration charges and incidental expenses in respect of this Deed shall be borne and paid by the Purchaser alone.',
      anchorId: 'clause-7-quote',
    },
    uncertaintySignal: {
      level: 'MEDIUM_UNCERTAINTY',
      label: 'Medium Uncertainty (Ambiguous phrasing / No statutory ceiling)',
      labelHindi: 'मध्यम अनिश्चितता (अस्पष्ट शब्द / कोई कानूनी सीमा नहीं)',
      labelMarathi: 'मध्यम अनिश्चितता (अस्पष्ट शब्दरचना / कायदेशीर मर्यादा नाही)',
      reason:
        'The phrase "incidental expenses" is ambiguous. It could allow the seller to pass on society transfer penalties, municipal mutation fees, or advocate drafting fees.',
      reasonHindi:
        'प्रासंगिक खर्च की कोई वैधानिक सीमा नहीं है, जिससे सेलर अपने पुराने बिल आप पर डाल सकता है।',
      reasonMarathi:
        'या शब्दरचनेमुळे विक्रेता स्वतःचे जुने महापालिका किंवा सोसायटी शुल्क खरेदीदारावर ढकलू शकतो.',
      counselRequiredAction:
        'Delete the words "and incidental expenses" or replace with "statutory stamp duty and registration fees only".',
    },
  },
  {
    id: 'f-6',
    clauseNumber: 14,
    pageNumber: 15,
    severity: 'LOW',
    theme: 'Dispute resolution',
    themeScorePercent: 25,
    shortTitle: 'Disputes go to arbitration seated in Pune',
    shortTitleHindi: 'विवाद समाधान के लिए पुणे में मध्यस्थता (Arbitration) का प्रावधान है',
    shortTitleMarathi: 'विवाद मिटवण्यासाठी पुण्यात लवाद (Arbitration) चालवण्याची तरतूद',
    plainHeadline: 'Disputes go to arbitration seated in Pune',
    plainHeadlineHindi: 'विवाद समाधान के लिए पुणे में मध्यस्थता (Arbitration) का प्रावधान है, जो सामान्य है।',
    plainHeadlineMarathi: 'विवाद उद्भवल्यास पुण्यात लवादासमोर सुनावणी होईल, ही प्रमाणित पद्धत आहे.',
    sourceQuote:
      '14. In case of any dispute arising out of this Deed, the same shall be referred to a sole arbitrator appointed mutually, with the seat and venue of arbitration in Pune.',
    plainLanguageExplanation:
      'A standard clause, and the seat is local to you.',
    plainLanguageExplanationHindi:
      'यह एक सामान्य मध्यस्थता शर्त है और सुनवाई का स्थान आपके शहर पुणे में ही है।',
    plainLanguageExplanationMarathi:
      'ही सामान्य लवाद अट असून सुनावणीचे ठिकाण तुमच्या स्थानिक पुणे कार्यक्षेत्रात आहे.',
    practicalConsequences: [
      'Arbitration is standard practice, but arbitrator fees are borne equally by parties.',
      'The venue being Pune matches your residence and property location.',
    ],
    advocateQuestion:
      'Is the mutual sole arbitrator mechanism standard for this transaction?',
    advocateWhy:
      'clause 14 is a standard arbitration clause with local Pune seat.',
    inAdvocateBrief: false,
    audioScriptHindi:
      'विवाद समाधान के लिए पुणे में मध्यस्थता (Arbitration) का प्रावधान है, जो सामान्य है।',
    audioScriptEnglish:
      'Clause 14 sets dispute resolution to arbitration in Pune, which is standard.',
    audioScriptMarathi:
      'कलम 14 नुसार वाद मिटवण्यासाठी पुण्यात लवादाची सोय केली आहे.',
    relatedModuleId: 'mod-05',
    sourceSpan: {
      documentId: 'doc-sale-deed-402',
      clauseNumber: 14,
      pageNumber: 15,
      startLine: 14,
      endLine: 18,
      exactQuote:
        'In case of any dispute arising out of this Deed, the same shall be referred to a sole arbitrator appointed mutually, with the seat and venue of arbitration in Pune.',
      anchorId: 'clause-14-quote',
    },
    uncertaintySignal: {
      level: 'HIGH_CERTAINTY',
      label: 'High Textual Certainty (Balanced mutual appointment)',
      labelHindi: 'उच्च निश्चितता (संतुलित पारस्परिक नियुक्ति)',
      labelMarathi: 'उच्च खात्रीशीरता (दोन्ही बाजूंच्या संमतीने नेमणूक)',
      reason:
        'The clause provides for mutual appointment of a sole arbitrator, consistent with Section 11 of the Arbitration & Conciliation Act 1996.',
      reasonHindi:
        'मध्यस्थता अधिनियम धारा 11 के तहत पारस्परिक सहमति से मध्यस्थ तय होगा।',
      reasonMarathi:
        'लवाद कायदा १९९६ च्या कलम ११ नुसार परस्पर संमतीने लवादाची निवड केली जाईल.',
      counselRequiredAction:
        'Confirm whether the client prefers fast-track Pune Small Causes/Civil Court or private commercial arbitration.',
    },
  },
  {
    id: 'f-7',
    clauseNumber: 16,
    pageNumber: 17,
    severity: 'LOW',
    theme: 'Dispute resolution',
    themeScorePercent: 20,
    shortTitle: 'Notices are valid by email only',
    shortTitleHindi: 'सभी कानूनी नोटिस केवल ईमेल द्वारा मान्य होंगे',
    shortTitleMarathi: 'सर्व कायदेशीर नोटिसा केवळ ईमेलद्वारे बजावल्या तरी ग्राह्य धरल्या जातील',
    plainHeadline: 'Notices are valid by email only',
    plainHeadlineHindi: 'सभी कानूनी नोटिस केवल ईमेल द्वारा मान्य होंगे, इसलिए अपना ईमेल हमेशा सक्रिय रखें।',
    plainHeadlineMarathi: 'सर्व अधिकृत नोटिसा केवळ ईमेलवर पाठवल्या तरी त्या मिळाल्याचे मानले जाईल.',
    sourceQuote:
      '16. Any notice or communication required under this Deed shall be deemed validly served if dispatched to the registered electronic mail addresses.',
    plainLanguageExplanation:
      'Keep the email address in the deed current and monitored.',
    plainLanguageExplanationHindi:
      'दस्तावेज में दिया गया ईमेल पता हमेशा सही और सक्रिय रखें।',
    plainLanguageExplanationMarathi:
      'खरेदीखतात नोंदवलेला ईमेल आयडी कायम सक्रिय ठेवा आणि नियमित तपासा.',
    practicalConsequences: [
      'Formal legal notices sent via email are considered legally received.',
      'Ensure you provide a permanent personal email that you monitor regularly.',
    ],
    advocateQuestion:
      'Should notices also require registered post (RPAD) in addition to email?',
    advocateWhy:
      'providing dual notice via email and speed post prevents disputes about delivery.',
    inAdvocateBrief: false,
    audioScriptHindi:
      'सभी कानूनी नोटिस केवल ईमेल द्वारा मान्य होंगे, इसलिए अपना ईमेल हमेशा सक्रिय रखें।',
    audioScriptEnglish:
      'Clause 16 provides that notice by email alone is valid service.',
    audioScriptMarathi:
      'कलम 16 नुसार ईमेलवर आलेली नोटीस वैध मानली जाईल.',
    relatedModuleId: 'mod-05',
    sourceSpan: {
      documentId: 'doc-sale-deed-402',
      clauseNumber: 16,
      pageNumber: 17,
      startLine: 6,
      endLine: 9,
      exactQuote:
        'Any notice or communication required under this Deed shall be deemed validly served if dispatched to the registered electronic mail addresses.',
      anchorId: 'clause-16-quote',
    },
    uncertaintySignal: {
      level: 'MEDIUM_UNCERTAINTY',
      label: 'Medium Uncertainty (Risk of spam / proof of dispatch)',
      labelHindi: 'मध्यम अनिश्चितता (ईमेल स्पैम या डिलीवरी विवाद का जोखिम)',
      labelMarathi: 'मध्यम अनिश्चितता (स्पॅम फोल्डर किंवा पोच न मिळण्याचा वाद)',
      reason:
        'Under the Information Technology Act 2000, dispatch is deemed complete upon entry into the recipient computer resource, but disputed email service can cause procedural delays in court.',
      reasonHindi:
        'आईटी एक्ट 2000 के तहत ईमेल डिलीवरी को लेकर तकनीकी विवाद उत्पन्न हो सकते हैं।',
      reasonMarathi:
        'माहिती तंत्रज्ञान कायद्यानुसार ईमेल पोहोचल्याबाबत तांत्रिक वाद निर्माण होऊ शकतात.',
      counselRequiredAction:
        'Request dual service: Registered Post A.D. (RPAD) plus electronic mail.',
    },
  },
];

export const riskThemes = [
  { label: 'Payment & encumbrances', severity: 'HIGH' as const, percent: 85, color: '#B44738' },
  { label: 'Possession & outgoings', severity: 'HIGH' as const, percent: 80, color: '#B44738' },
  { label: 'Title & disclosure', severity: 'MEDIUM' as const, percent: 55, color: '#B08427' },
  { label: 'Costs & stamp duty', severity: 'MEDIUM' as const, percent: 45, color: '#B08427' },
  { label: 'Dispute resolution', severity: 'LOW' as const, percent: 20, color: '#58735C' },
];

export const missingDocumentsList: MissingDocument[] = [
  {
    id: 'm-1',
    title: '30-Year Title Search & Chain of Title Deeds',
    importance: 'Critical',
    reason: 'Verifies unbroken ownership from the original land grant to current seller.',
    uploaded: false,
  },
  {
    id: 'm-2',
    title: 'PMC Sanctioned Building Plan & Occupancy Certificate (OC)',
    importance: 'Critical',
    reason: 'Proves Flat 402 is constructed legally without unauthorized floor space deviations.',
    uploaded: false,
  },
  {
    id: 'm-3',
    title: 'Gulmohar Housing Society No Objection Certificate (NOC)',
    importance: 'Critical',
    reason: 'Confirms no society dues pending and verifies seller is registered member.',
    uploaded: false,
  },
  {
    id: 'm-4',
    title: 'Latest Property Tax Assessment & Nil-Encumbrance Receipt',
    importance: 'Recommended',
    reason: 'Validates that municipal taxes are paid up to date with no municipal charges.',
    uploaded: false,
  },
];

export const learningModules: LearningModule[] = [
  {
    id: 'mod-02',
    number: '02',
    title: 'How property title passes in India',
    titleHindi: 'भारत में संपत्ति का मालिकाना हक कैसे ट्रांसफर होता है',
    status: 'NOW',
    progressText: '4 OF 6',
    category: 'Property',
    readTime: '4 min',
    summary: 'How title passes on registration under Section 54 of the Transfer of Property Act and the Indian Registration Act.',
    keyTakeaways: [
      'Execution alone does not transfer title; registration under Section 17 is mandatory.',
      'Title passes only upon completion of biometric registration and entry in the sub-registrar books.',
      'Encumbrances clear upon registered release deed, not verbal agreements.',
    ],
  },
  {
    id: 'mod-05',
    number: '05',
    title: 'Which court hears which dispute',
    titleHindi: 'कौन सा विवाद किस अदालत में जाता है',
    status: 'NOT STARTED',
    progressText: 'NOT STARTED',
    category: 'Civil procedure',
    readTime: '5 min',
    summary: 'Territorial and pecuniary jurisdiction: how the location of Flat 402 in Kalyani Nagar binds any suit strictly to Pune District Courts.',
    keyTakeaways: [
      'Section 16 of the Civil Procedure Code requires suits concerning immovable property to be instituted where the property sits.',
      'Valuation of ₹86 Lakhs places your dispute with the Civil Judge Senior Division, Pune.',
    ],
  },
  {
    id: 'mod-07',
    number: '07',
    title: 'Stamp duty and registration, step by step',
    titleHindi: 'स्टांप शुल्क और पंजीकरण, चरण-दर-चरण',
    status: 'NOT STARTED',
    progressText: 'NOT STARTED',
    category: 'Registration',
    readTime: '5 min',
    summary: 'The step-by-step process of paying Maharashtra stamp duty, e-challans, sub-registrar appearance, and obtaining the registered index II.',
    keyTakeaways: [
      'Stamp duty must be paid prior to execution via GRAS portal e-challan.',
      'Both parties or authorized POA holders must attend with original documents.',
    ],
  },
];

export const courtLadderStages: CourtStage[] = [
  {
    id: 'sc',
    level: 1,
    name: 'Supreme Court of India',
    nameHindi: 'भारत का सर्वोच्च न्यायालय',
    courtType: 'Apex Constitutional & Appellate Forum (New Delhi)',
    jurisdiction: 'Special Leave Petitions (SLP under Art 136) & Substantial questions of law',
    typicalDuration: '3 – 6 Years',
    costLevel: 'Very High',
    costDetail: 'Senior counsel appearance fees (₹2–5L per hearing)',
    limitationPeriod: '90 days from High Court final decree',
    description: 'The highest court of the nation. It does not re-examine factual witnesses, only legal principles or fundamental rights violations.',
    isUserMatterStart: false,
  },
  {
    id: 'hc',
    level: 2,
    name: 'High Court of Judicature at Bombay',
    nameHindi: 'बॉम्बे उच्च न्यायालय',
    courtType: 'State Appellate & Writ Court (Mumbai / Pune Bench)',
    jurisdiction: 'First and Second Appeals from District Court, Writ Petitions under Art 226/227',
    typicalDuration: '2 – 4 Years',
    costLevel: 'High',
    costDetail: 'Advocate on record & appeal filing fees (₹75k–₹2L)',
    limitationPeriod: '90 days from District Court decree',
    description: 'Hears appeals against decrees passed by Pune District Judges. Evaluates misinterpretation of evidence or substantial law errors.',
    isUserMatterStart: false,
  },
  {
    id: 'dc',
    level: 3,
    name: 'District & Sessions Court, Pune (Shivajinagar)',
    nameHindi: 'जिला एवं सत्र न्यायालय, पुणे',
    courtType: 'Trial Court of First Instance — Civil Judge Senior Division',
    jurisdiction: 'Property matters situated in Pune district with consideration exceeding ₹1 Crore or senior civil suits',
    typicalDuration: '2 – 4 Years',
    costLevel: 'Moderate',
    costDetail: 'Maharashtra Ad Valorem court fees (~₹30k–₹60k) + advocate fees',
    limitationPeriod: '3 years for specific performance of contract (Art 54)',
    description: 'Where evidence is examined, witnesses cross-examined, and title deeds authenticated. Any civil suit concerning Flat 402 must begin here.',
    isUserMatterStart: true,
  },
  {
    id: 'pre-court',
    level: 4,
    name: 'Before-Court Stage (Pre-litigation Options)',
    nameHindi: 'अदालत जाने से पहले के विकल्प',
    courtType: 'Alternative Dispute Resolution & Statutory Notice',
    jurisdiction: 'Consensual & summary conflict resolution before filing a suit',
    typicalDuration: '15 – 60 Days',
    costLevel: 'Low',
    costDetail: 'Minimal notice drafting charges; Lok Adalat has zero court fees',
    limitationPeriod: 'Before statutory limitation expires',
    description: 'Statutory legal demand notice, pre-institution mediation, or Lok Adalat compromise. Resolves over 60% of property settlement friction without entering trial court.',
    preLitigation: true,
  },
];

export const matterTimeline: TimelineEvent[] = [
  {
    id: 't-1',
    date: '28 AUG 2026',
    title: 'Agreement to sell signed',
    description: 'Initial token amount paid; 30 days stipulated for title clearance and draft verification.',
    status: 'COMPLETED',
  },
  {
    id: 't-2',
    date: '11 SEP 2026',
    title: 'Encumbrance certificate obtained',
    description: 'Nil encumbrance search completed for 2009 to 2026.',
    status: 'COMPLETED',
  },
  {
    id: 't-3',
    date: 'DUE THIS WEEK',
    title: 'Advocate consultation',
    description: 'Four questions prepared from flagged clauses ready for advocate.',
    status: 'CURRENT',
  },
  {
    id: 't-4',
    date: '19 SEP 2026',
    title: 'Registration at sub-registrar, Haveli',
    description: 'Execution, biometric fingerprinting, balance consideration handoff, and immediate key possession.',
    status: 'UPCOMING',
    location: 'Sub-Registrar Office, Haveli, Pune',
  },
];

export const askedByPeopleList = [
  {
    id: 'q-1',
    topic: 'PROPERTY',
    readTime: '3 MIN READ',
    question: 'Is an unregistered agreement to sell worth anything?',
    summary: 'Under Section 53A of the Transfer of Property Act and the Registration Act, an unregistered agreement cannot confer legal title, but can protect possession in limited scenarios.',
  },
  {
    id: 'q-2',
    topic: 'RERA',
    readTime: '4 MIN READ',
    question: 'The builder is late on possession. Where do I complain?',
    summary: 'Under Section 18 of RERA, buyers can approach the Real Estate Regulatory Authority to claim interest for every month of delay or seek full refund with interest.',
  },
  {
    id: 'q-3',
    topic: 'REGISTRATION',
    readTime: '2 MIN READ',
    question: 'What does the sub-registrar actually check?',
    summary: 'The sub-registrar verifies identity of parties, proper stamp duty payment, and jurisdictional authority, but does not investigate or certify unbroken title history.',
  },
];

export const glossaryItems: GlossaryItem[] = [
  {
    term: 'Jurisdiction',
    termDevanagari: 'अधिकार क्षेत्र (Jurisdiction)',
    category: 'Procedural',
    definition: 'The legal authority of a court to hear and decide a case based on location (territorial) and property value (pecuniary).',
    plainExample: 'Because Flat 402 is located in Kalyani Nagar, Pune courts have territorial jurisdiction, not Mumbai courts.',
  },
  {
    term: 'Specific Performance',
    termDevanagari: 'विशिष्ट अनुपालन (Specific Performance)',
    category: 'Remedy',
    definition: 'A court order compelling a party to fulfill their exact contractual obligation rather than merely paying monetary damages.',
    plainExample: 'Forcing the seller to sign and register the deed rather than just refunding your deposit.',
  },
  {
    term: 'Limitation',
    termDevanagari: 'परिसीमा अवधि (Limitation Period)',
    category: 'Statutory',
    definition: 'The strict legal deadline set by the Limitation Act within which a suit or claim must be filed in court.',
    plainExample: 'You have 3 years from the date of refusal to file a suit for specific performance.',
  },
  {
    term: 'Decree',
    termDevanagari: 'अदालती डिक्री (Decree)',
    category: 'Judgment',
    definition: 'The formal, binding determination by a civil court that conclusively settles the rights of the parties.',
    plainExample: 'A court decree declaring you the absolute sole owner of Flat 402.',
  },
  {
    term: 'Ad Valorem Fee',
    termDevanagari: 'मूल्यानुसार कोर्ट फीस (Ad Valorem Fee)',
    category: 'Costs',
    definition: 'A court filing fee calculated as a percentage of the financial value or market worth of the property in dispute.',
    plainExample: 'In Maharashtra, a ₹86 Lakh flat suit requires approximately ₹30,000 to ₹60,000 in official court stamps.',
  },
  {
    term: 'Lis Pendens',
    termDevanagari: 'लंबित वाद सिद्धांत (Lis Pendens)',
    category: 'Property Law',
    definition: 'Under Section 52 of the Transfer of Property Act, property under active litigation cannot be transferred without court permission.',
    plainExample: 'If someone files a suit over Flat 402 before your registration, your purchase becomes subject to the court verdict.',
  },
  {
    term: 'Encumbrance',
    termDevanagari: 'भार / प्रभार (Encumbrance)',
    category: 'Title',
    definition: 'A legal claim, charge, or liability attached to real property, such as an outstanding mortgage or tax lien.',
    plainExample: 'An unpaid bank loan on the flat is an encumbrance until a formal Deed of Reconveyance is registered.',
  },
  {
    term: 'Indemnity',
    termDevanagari: 'क्षतिपूर्ति (Indemnity)',
    category: 'Contract',
    definition: 'A contractual promise by one party to reimburse and protect the other from financial loss or damages caused by third-party claims.',
    plainExample: 'The seller promises to pay all your legal fees if an unknown relative later challenges the sale.',
  },
];

export const sampleSourceDocumentPages: { [key: number]: string } = {
  7: `DEED OF ABSOLUTE SALE (PUNE JURISDICTION)
PAGE 7 OF 18 · SECTION II: COVENANTS AS TO CONSIDERATION & ENCUMBRANCES

3. The Vendor hereby declares that the Schedule Property is free from all prior mortgages, attachments, court orders, or liens, save and except the existing housing finance term facility availed from the State Bank of India, Deccan Gymkhana Branch, against deposit of title deeds.

[FLAGGED_CLAUSE_4]
4. The Purchaser covenants to remit the balance sale consideration of ₹68,80,000/- (Rupees Sixty Eight Lakhs Eighty Thousand only) on or before the execution of this Indenture, and shall not withhold, set-off, or condition such remittance upon the production of release deeds, No-Objection Certificates, or clearance from any financial institutions having existing charges on the said Property.
[/FLAGGED_CLAUSE_4]

5. The Vendor further agrees to apply the consideration received towards regular loan servicing, and to make reasonable endeavors to obtain the original title documents from the lending institution within forty-five (45) bank working days subsequent to the registration hereof.

6. The Purchaser acknowledges that pending receipt of original deeds, the certified true copy issued by the Sub-Registrar of Haveli shall constitute prima facie evidence of title for municipal record entry.`,

  11: `DEED OF ABSOLUTE SALE (PUNE JURISDICTION)
PAGE 11 OF 18 · SECTION IV: POSSESSION, ACCESS & ENTRY

8. The Vendor warrants that no tenant, licensee, or unlawful occupant is presently in occupation of any portion of the Unit hereby conveyed.

[FLAGGED_CLAUSE_9]
9. Physical, vacant, and peaceful possession of the Unit shall be delivered by the Vendor within a reasonable period following registration, subject to administrative conveniences and clearance of Vendor\'s personal belongings. Time shall not be deemed the essence of this contract as regards delivery of possession.
[/FLAGGED_CLAUSE_9]

10. In the event of minor delays attributable to relocation of Vendor\'s effects, the Purchaser agrees to grant access for inspection upon seventy-two (72) hours prior written notice.`,

  14: `DEED OF ABSOLUTE SALE (PUNE JURISDICTION)
PAGE 14 OF 18 · SECTION V: OUTGOINGS, TAXES & RECKONER VALUES

12. The Purchaser shall pay all future municipal property taxes, cess, and society maintenance charges starting from the date of execution.

[FLAGGED_CLAUSE_13]
13. All statutory outgoings, property assessments, society maintenance dues, and water cess accrued or levied on the Schedule Property shall be borne and liquidated by the Purchaser from the date hereof, notwithstanding any arrears prior thereto.
[/FLAGGED_CLAUSE_13]

14. The Vendor shall furnish copies of the latest available utility payment slips upon request by the Purchaser.`,

  15: `DEED OF ABSOLUTE SALE (PUNE JURISDICTION)
PAGE 15 OF 18 · SECTION VI: INDEMNITY & TITLE COVENANTS

15. The Vendor covenants that he holds good, marketable, and unencumbered title to the Schedule Property, with full right, power, and authority to convey the same.

[FLAGGED_CLAUSE_16]
16. The Vendor covenants to indemnify the Purchaser against third-party title challenges, provided that such claim or notice is brought within 12 (twelve) calendar months from execution, failing which the Vendor\'s obligations under this indemnity shall extinguish absolutely.
[/FLAGGED_CLAUSE_16]

17. The Purchaser shall promptly notify the Vendor of any adverse claim received in writing within fifteen (15) days of receipt.`,

  16: `DEED OF ABSOLUTE SALE (PUNE JURISDICTION)
PAGE 16 OF 18 · SECTION VII: COMMON AMENITIES & UNDIVIDED SHARE

18. The sale includes undivided, impartible proportionate share in the land underneath the building, admeasuring approximately 34.2 sq. meters.

[FLAGGED_CLAUSE_19]
19. The Purchaser hereby accords unconditional consent to the Vendor or original developer to carry out future alterations, allocations, or vertical expansions in the common terrace, stilt areas, and compound without further concurrence.
[/FLAGGED_CLAUSE_19]

20. The Purchaser shall abide by all regulations framed by the Gulmohar Co-operative Housing Society Ltd.`,

  17: `DEED OF ABSOLUTE SALE (PUNE JURISDICTION)
PAGE 17 OF 18 · SECTION VIII: DISPUTE RESOLUTION & ARBITRATION

21. The parties shall endeavor to resolve any dispute or difference amicably within thirty (30) days of formal notice.

[FLAGGED_CLAUSE_22]
22. Any dispute arising out of or in connection with this deed shall be referred to arbitration before a Sole Arbitrator appointed by the Vendor, with seat and venue strictly situated in Mumbai, Maharashtra.
[/FLAGGED_CLAUSE_22]

23. The arbitration proceedings shall be governed by the Arbitration and Conciliation Act, 1996. The language of arbitration shall be English.`,

  18: `DEED OF ABSOLUTE SALE (PUNE JURISDICTION)
PAGE 18 OF 18 · SECTION IX: STAMP DUTY, REGISTRATION & EXECUTION

25. The market value of the property for the purpose of stamp duty has been assessed at ₹86,00,000/-, and applicable stamp duty of 7% (including LBT and Metro Cess) has been remitted through Government Receipt Accounting System (GRAS).

[FLAGGED_CLAUSE_26]
26. Stamp duty and registration charges are calculated based on the stated consideration. In the event of audit by the Collector of Stamps resulting in deficit duty or penalty, the Purchaser alone shall bear such enhancement.
[/FLAGGED_CLAUSE_26]

IN WITNESS WHEREOF the parties have set their respective hands and seals on this 19th day of September 2026.`,
};

export const uiTranslations = {
  EN: {
    appName: 'VIDHI',
    appSubtitle: 'Legal assistant for citizens',
    tagline: 'Citizen-first legal clarity',
    overview: 'Overview',
    myDocuments: 'My documents',
    askQuestion: 'Ask a question',
    learnSystem: 'Learn the system',
    matterTimeline: 'Matter timeline',
    disclaimerText:
      'Vidhi explains documents and procedure in plain language. It is not a law firm, does not provide legal advice, and concludes reviews with questions to take to an advocate.',
    greetingDate: 'SATURDAY, 12 SEPTEMBER 2026',
    greetingTitle: 'Good evening, Rohan.',
    greetingStatus:
      'One document is awaiting your review before the sub-registrar appointment on 19 September.',
    askButton: 'Ask a question',
    checkDocButton: 'Check a document',
    openReport: 'Open report',
    openBrief: 'Open the brief',
    downloadPdf: 'Download PDF',
    pointsFlagged: 'points flagged',
    nextStepLabel: 'NEXT STEP',
    nextStepTitle: 'Take four questions to your advocate',
    nextStepDesc:
      'Vidhi has drafted a one-page brief summarizing key negotiation clauses before the sub-registrar registration.',
    missingDocsTitle: 'Missing documents to verify',
    missingDocsSubtitle: 'Important records to obtain before releasing final payment',
    addMissingDocs: 'Add the documents still missing',
    continueLearning: 'Continue learning the system',
    askedByPeople: 'Questions asked by citizens like you',
    timelineTitle: 'Matter timeline',
    documentView: 'Document',
    plainView: 'Plain-language version',
    sideBySideView: 'Side by side',
    questionsForAdvocate: 'Questions for my advocate',
    riskScoreLabel: 'RISK TO YOU AS PURCHASER',
    provisionalNote:
      '*Treat numerical score as provisional orientation. Focus on individual flagged clauses.',
    sortSeverity: 'Sort by severity',
    allSeverities: 'All findings',
    readDetail: 'Read the detail',
    addToBrief: 'Add to advocate brief',
    addedToBrief: 'Added to your brief ✓',
    briefTitle: 'BRIEF FOR YOUR ADVOCATE',
    briefSubtitle: 'Four questions, and why each one is being asked',
    courtLadderTitle: 'LEARN THE SYSTEM · MODULE 03',
    courtLadderSubtitle:
      'If a property dispute arose, where would it go? Follow the path of a civil suit over a flat in Pune.',
    yourMatterStartsHere: 'YOUR MATTER WOULD START HERE',
    fromYourOwnDoc: 'FROM YOUR OWN DOCUMENT',
    backToReport: 'Back to the report',
    listenAudio: 'Listen in Hindi',
    whatItMeans: 'WHAT IT MEANS',
    whyItMatters: 'WHY IT MATTERS IN PRACTICE',
    sourceClause: 'SOURCE CLAUSE',
    desktopMode: 'Desktop View',
    mobileMode: 'Mobile Experience (Preview)',
    versionHistory: 'Version History',
    versionHistorySubtitle: 'Track document revisions, review dates, and risk score evolution',
  },
  HI: {
    appName: 'विधि (VIDHI)',
    appSubtitle: 'नागरिकों के लिए सरल कानूनी सहायक',
    tagline: 'सरल भाषा में कानूनी समझ',
    overview: 'मुख्य पृष्ठ (Overview)',
    myDocuments: 'मेरे दस्तावेज़',
    askQuestion: 'सवाल पूछें',
    learnSystem: 'कानूनी प्रणाली समझें',
    matterTimeline: 'मामले की समयरेखा',
    disclaimerText:
      'विधि दस्तावेज़ों और कानूनी प्रक्रियाओं को सरल भाषा में समझाती है। यह कोई लॉ फर्म नहीं है, कानूनी सलाह नहीं देती, और समीक्षा के अंत में आपके वकील से पूछने योग्य सवाल तैयार करती है।',
    greetingDate: 'शनिवार, 12 सितंबर 2026',
    greetingTitle: 'शुभ संध्या, रोहन।',
    greetingStatus:
      '19 सितंबर को सब-रजिस्ट्रार अपॉइंटमेंट से पहले एक दस्तावेज़ आपकी समीक्षा की प्रतीक्षा कर रहा है।',
    askButton: 'सवाल पूछें',
    checkDocButton: 'नया दस्तावेज़ जांचें',
    openReport: 'रिपोर्ट खोलें',
    openBrief: 'वकील का संक्षिप्त ब्रीफ देखें',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    pointsFlagged: 'मुद्दे पाए गए',
    nextStepLabel: 'अगला कदम',
    nextStepTitle: 'अपने वकील के पास ये चार सवाल लेकर जाएं',
    nextStepDesc:
      'विधि ने सब-रजिस्ट्रार रजिस्ट्री से पहले आपके लिए एक पन्ने का वकील परामर्श ब्रीफ तैयार किया है।',
    missingDocsTitle: 'जांच के लिए आवश्यक लापता दस्तावेज़',
    missingDocsSubtitle: 'अंतिम भुगतान जारी करने से पहले यह रिकॉर्ड जरूर प्राप्त करें',
    addMissingDocs: 'लापता दस्तावेज़ जोड़ें',
    continueLearning: 'कानूनी समझ जारी रखें',
    askedByPeople: 'आप जैसे नागरिकों द्वारा पूछे गए सवाल',
    timelineTitle: 'मामले की समयरेखा',
    documentView: 'मूल दस्तावेज़',
    plainView: 'सरल भाषा संस्करण',
    sideBySideView: 'आमने-सामने (Side by side)',
    questionsForAdvocate: 'वकील के लिए सवाल',
    riskScoreLabel: 'खरीदार के रूप में आपके लिए जोखिम',
    provisionalNote:
      '*संख्यात्मक स्कोर को केवल मार्गदर्शन मानें। मुख्य ध्यान चिन्हित नियमों पर दें।',
    sortSeverity: 'गंभीरता के अनुसार क्रमबद्ध करें',
    allSeverities: 'सभी मुद्दे',
    readDetail: 'विस्तार से पढ़ें',
    addToBrief: 'वकील ब्रीफ में जोड़ें',
    addedToBrief: 'ब्रीफ में जोड़ा गया ✓',
    briefTitle: 'आपके वकील के लिए तैयार ब्रीफ',
    briefSubtitle: 'चार मुख्य सवाल, और प्रत्येक सवाल पूछने का कानूनी कारण',
    courtLadderTitle: 'कानूनी प्रणाली समझें · मॉड्यूल 03',
    courtLadderSubtitle:
      'यदि संपत्ति विवाद उत्पन्न हुआ, तो मामला कहाँ जाएगा? पुणे में फ्लैट विवाद का रास्ता देखें।',
    yourMatterStartsHere: 'आपका मामला यहाँ से शुरू होगा',
    fromYourOwnDoc: 'आपके अपने दस्तावेज़ से',
    backToReport: 'रिपोर्ट पर वापस जाएं',
    listenAudio: 'हिंदी में सुनें (ऑडियो)',
    whatItMeans: 'इसका क्या अर्थ है',
    whyItMatters: 'व्यावहारिक रूप में इसका क्या असर होगा',
    sourceClause: 'दस्तावेज़ की मूल धारा',
    desktopMode: 'डेस्कटॉप दृश्य',
    mobileMode: 'मोबाइल अनुभव (प्रीव्यू)',
    versionHistory: 'दस्तावेज़ इतिहास',
    versionHistorySubtitle: 'दस्तावेज़ के पिछले संस्करण, समीक्षा तिथियां और जोखिम स्कोर में बदलाव देखें',
  },
  MR: {
    appName: 'विधि (VIDHI)',
    appSubtitle: 'नागरिकांसाठी सोपा कायदेशीर मार्गदर्शक',
    tagline: 'सोप्या भाषेत कायदेशीर मदत',
    overview: 'एकंदर आढावा (Overview)',
    myDocuments: 'माझी कागदपत्रे',
    askQuestion: 'प्रश्न विचारा',
    learnSystem: 'न्यायप्रणाली समजून घ्या',
    matterTimeline: 'प्रकरणाची कालमर्यादा',
    disclaimerText:
      'विधि ही कागदपत्रे आणि प्रक्रिया सोप्या भाषेत समजावून सांगते. ही कोणतीही कायदा फर्म नाही, कायदेशीर सल्ला देत नाही, आणि वकिलांना विचारण्यासाठी प्रश्न तयार करते.',
    greetingDate: 'शनिवार, 12 सप्टेंबर 2026',
    greetingTitle: 'शुभ संध्याकाळ, रोहन.',
    greetingStatus:
      '19 सप्टेंबरच्या दुय्यम निबंधक (Sub-Registrar) भेटीपूर्वी एका दस्तऐवजाची तपासणी प्रलंबित आहे.',
    askButton: 'प्रश्न विचारा',
    checkDocButton: 'कागदपत्र तपासा',
    openReport: 'अहवाल उघडा',
    openBrief: 'वकिलांसाठी ब्रीफ पहा',
    downloadPdf: 'पीडीएफ डाउनलोड करा',
    pointsFlagged: 'मुद्दे नोंदवले',
    nextStepLabel: 'पुढील पाऊल',
    nextStepTitle: 'तुमच्या वकिलांकडे हे चार प्रश्न घेऊन जा',
    nextStepDesc:
      'खरेदीखत नोंदणीपूर्वी चर्चा करण्यासाठी विधीने एक पानाचा संक्षिप्त ब्रीफ तयार केला आहे.',
    missingDocsTitle: 'तपासावयाची उर्वरित कागदपत्रे',
    missingDocsSubtitle: 'अंतिम रक्कम देण्यापूर्वी ही कागदपत्रे पडताळून घ्या',
    addMissingDocs: 'उर्वरित कागदपत्रे जोडा',
    continueLearning: 'कायदेशीर साक्षरता मॉड्यूल',
    askedByPeople: 'इतर नागरिकांनी विचारलेले नेहमीचे प्रश्न',
    timelineTitle: 'प्रकरणाचा घटनाक्रम',
    documentView: 'मूळ कागदपत्र',
    plainView: 'सोप्या भाषेतील आवृत्ती',
    sideBySideView: 'तुलनात्मक दृश्य',
    questionsForAdvocate: 'वकिलांसाठी प्रश्न',
    riskScoreLabel: 'खरेदीदार म्हणून तुमच्यासाठी धोका',
    provisionalNote:
      '*संख्यात्मक गुणांकन केवळ दिशादर्शनासाठी आहे. मुख्य लक्ष आक्षेपार्ह अटींवर द्या.',
    sortSeverity: 'तीव्रतेनुसार वर्गीकरण',
    allSeverities: 'सर्व मुद्दे',
    readDetail: 'तपशील वाचा',
    addToBrief: 'ब्रीफमध्ये जोडा',
    addedToBrief: 'ब्रीफमध्ये जोडले ✓',
    briefTitle: 'तुमच्या वकिलांसाठी तयार केलेला ब्रीफ',
    briefSubtitle: 'चार महत्त्वाचे प्रश्न आणि त्यामागील कायदेशीर कारण',
    courtLadderTitle: 'न्यायप्रणाली समजून घ्या · विभाग 03',
    courtLadderSubtitle:
      'पुण्यातील फ्लॅटच्या व्यवहारात वाद निर्माण झाल्यास खटला कुठे चालेल?',
    yourMatterStartsHere: 'तुमचा खटला येथून सुरू होईल',
    fromYourOwnDoc: 'तुमच्या मूळ खरेदीखतातून',
    backToReport: 'अहवालाकडे परत जा',
    listenAudio: 'हिंदीत ऐका (ऑडिओ)',
    whatItMeans: 'याचा नेमका अर्थ काय',
    whyItMatters: 'प्रत्यक्षात याचा काय परिणाम होईल',
    sourceClause: 'मूळ अट (Clause)',
    desktopMode: 'डेस्कटॉप दृश्य',
    mobileMode: 'मोबाइल अनुभव (पूर्वावलोकन)',
    versionHistory: 'दस्तऐवज इतिहास',
    versionHistorySubtitle: 'दस्तऐवजाच्या मागील आवृत्त्या, तपासणीच्या तारखा आणि धोक्यातील बदल तपासा',
  },
};

export const documentVersionsList: DocumentVersion[] = [
  {
    id: 'doc-v1-0',
    versionNumber: 'Draft v1.0',
    label: 'Initial Seller / Builder Draft',
    reviewDate: '12 Sep 2026',
    reviewedTimestamp: '2026-09-12T14:30:00Z',
    reviewedBy: 'Vidhi AI Ingestion Pipeline',
    fileName: 'Draft_Sale_Deed_Gulmohar_402_Initial.pdf',
    fileSize: '3.1 MB',
    pageCount: 16,
    riskScore: 78,
    riskVerdict: 'High Risk — Substantial Amendments Required',
    highCount: 5,
    mediumCount: 4,
    lowCount: 2,
    isCurrent: false,
    status: 'FLAGGED_RISKS',
    summaryOfChanges: [
      'Original baseline draft submitted by Seller Shri Rajesh Verma\'s legal counsel.',
      'Contains total forfeiture of earnest deposit (₹17.2L) if registration is delayed by even 3 days.',
      'Zero seller obligation for outstanding property taxes, water charges, or society assessment prior to execution.',
      'Full unconditional balance payment required with no provision for mortgage discharge from SBI.',
      'Short 6-month title defect indemnity cutoff.',
    ],
    keyDifferencesFromPrior: ['Initial draft received from seller.'],
    clausesChangedCount: 0,
    clausesResolvedCount: 0,
    advocateNotes:
      'Unacceptable terms. Seller attempting to pass historical property liabilities and mortgage risks to purchaser. Redline required immediately.',
    criticalIssuesRemaining: [
      'Clause 3: 100% deposit forfeiture on 3-day delay',
      'Clause 4: Unconditional payment without bank loan release',
      'Clause 6: Buyer bears past municipal dues',
      'Clause 9: No deadline for key delivery',
      'Clause 14: 6-month indemnity limit',
    ],
  },
  {
    id: 'doc-v1-1',
    versionNumber: 'Draft v1.1',
    label: 'Advocate Redline & Counter-Draft',
    reviewDate: '16 Sep 2026',
    reviewedTimestamp: '2026-09-16T18:15:00Z',
    reviewedBy: 'Adv. Milind Kulkarni (Pune Bar) + Vidhi AI',
    fileName: 'Sale_Deed_Flat402_Redline_AdvKulkarni.pdf',
    fileSize: '3.4 MB',
    pageCount: 17,
    riskScore: 71,
    riskVerdict: 'Needs Revision — Significant Counter-Points',
    highCount: 3,
    mediumCount: 4,
    lowCount: 2,
    isCurrent: false,
    status: 'ADVOCATE_AMENDED',
    summaryOfChanges: [
      'Adv. Kulkarni struck down 100% deposit forfeiture, replacing it with a mandatory 15-day formal cure notice period.',
      'Mandated Seller to clear all Pune Municipal Corporation (PMC) property taxes up to execution date.',
      'Introduced escrow mechanism for SBI housing loan settlement.',
      'Extended indemnity period to statutory 12-year limitation.',
    ],
    keyDifferencesFromPrior: [
      'Resolved deposit forfeiture penalty (Clause 3).',
      'Resolved historical municipal tax shift (Clause 6).',
      'Seller counsel rejected bank escrow but agreed to tax clearance.',
    ],
    clausesChangedCount: 6,
    clausesResolvedCount: 2,
    advocateNotes:
      'Seller counsel conceded on municipal tax clearance and deposit cure notice, but is pushing back on simultaneous mortgage release.',
    criticalIssuesRemaining: [
      'Clause 4: Seller refused escrow for SBI mortgage release',
      'Clause 9: Possession handover timeline remains open-ended',
      'Clause 16: Seller agreed to 12 months indemnity, rejecting 12 years',
    ],
  },
  {
    id: 'doc-v2-0',
    versionNumber: 'Draft v2.0',
    label: 'Seller Compromise & Society Allocation Draft',
    reviewDate: '20 Sep 2026',
    reviewedTimestamp: '2026-09-20T11:45:00Z',
    reviewedBy: 'Vidhi AI Review Engine',
    fileName: 'Gulmohar_402_Sale_Deed_Revision_v2.0.pdf',
    fileSize: '3.5 MB',
    pageCount: 18,
    riskScore: 66,
    riskVerdict: 'Review Recommended — 2 High Flags Persist',
    highCount: 2,
    mediumCount: 4,
    lowCount: 1,
    isCurrent: false,
    status: 'FLAGGED_RISKS',
    summaryOfChanges: [
      'Seller incorporated Annexure B: Covered stilt car parking space P-14 formal allocation diagram.',
      'Added cooperative housing society share certificate transfer procedure and NOC commitment.',
      'Clarified RTGS payment schedule for balance ₹68,80,000.',
      'Seller still insisted on retaining Clause 4 unlinked payment phrasing.',
    ],
    keyDifferencesFromPrior: [
      'Added concrete car parking bay identification (P-14).',
      'Added society share transfer covenants.',
      'Reduced risk score from 71 to 66.',
    ],
    clausesChangedCount: 4,
    clausesResolvedCount: 1,
    advocateNotes:
      'Progress on parking and society membership. However, Clause 4 must not be accepted without bank foreclosure statement or direct banker\'s cheque.',
    criticalIssuesRemaining: [
      'Clause 4: Balance payment unconditioned on mortgage release',
      'Clause 9: Key delivery lacks time essence',
      'Clause 16: Indemnity period capped at 12 months',
    ],
  },
  {
    id: 'doc-v2-1',
    versionNumber: 'Draft v2.1',
    label: 'Current Working Draft (Active Review)',
    reviewDate: '23 Sep 2026',
    reviewedTimestamp: '2026-09-23T08:30:00Z',
    reviewedBy: 'Vidhi AI Dual-Layer Ingestion',
    fileName: 'Sale_Deed_Flat402_Gulmohar_v2.1_FinalDraft.pdf',
    fileSize: '3.6 MB',
    pageCount: 18,
    riskScore: 62,
    riskVerdict: 'Review recommended before execution',
    highCount: 2,
    mediumCount: 3,
    lowCount: 2,
    isCurrent: true,
    status: 'CURRENT_ACTIVE',
    summaryOfChanges: [
      'Incorporated Pune Haveli Sub-Registrar valuation schedule and government e-Stamp certificate number IN-MH92847291038472U (₹6,02,000 paid).',
      'Dual-layer PII masking applied (Aadhaar, PAN, Bank account, phone numbers sanitized).',
      '3 Critical risks isolated with specific questions formulated for advocate consultation.',
      'Ready for final lawyer sign-off prior to 19 September sub-registrar execution.',
    ],
    keyDifferencesFromPrior: [
      'Added verified government stamp duty endorsement and registration schedule.',
      'Consolidated 4 advocate consultation questions in citizen brief.',
      'Risk score stabilized at 62/100 (down from initial 78/100).',
    ],
    clausesChangedCount: 2,
    clausesResolvedCount: 1,
    advocateNotes:
      'Active working draft. Do not execute until the 4 advocate questions on Clause 4, Clause 9, and Clause 16 are addressed.',
    criticalIssuesRemaining: [
      'Clause 4: Unlinked payment vs SBI mortgage clearance',
      'Clause 9: Asymmetric possession keys delivery obligation',
      'Clause 16: 12-Month title indemnity limitation',
    ],
  },
];

