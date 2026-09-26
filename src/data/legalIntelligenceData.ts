import {
  FullClauseExplanation,
  RedFlagRubricItem,
  ChecklistItem,
  DisputePathway,
} from '../types';

/**
 * 1. Comprehensive Clause-by-Clause Dataset
 * Every single clause of the 18-page Sale Deed (Clauses 1 to 16)
 * with original text, plain explanation, obligations, and risk level.
 */
export const fullDocumentClauses: FullClauseExplanation[] = [
  {
    clauseNumber: 1,
    pageNumber: 2,
    title: 'Recitals & Description of the Subject Property',
    category: 'Parties & Title',
    originalLegalText:
      '1. The Vendor is the absolute and sole lawful owner of Flat No. 402, admeasuring 1,120 square feet built-up area, on the Fourth Floor of Gulmohar Residency, Kalyani Nagar, Pune, together with one covered stilt car parking space and proportionate undivided share in the underlying freehold land.',
    plainExplanation:
      'Defines the property being sold: Flat 402 (1,120 sq ft), 4th floor, one covered parking space, and a share of the land underneath.',
    buyerObligation: 'Verify that flat area and car parking match the society records and building layout plans.',
    sellerObligation: 'Warrants that he is the sole absolute owner entitled to convey the flat and parking slot.',
    riskLevel: 'STANDARD',
    riskReason: 'Standard property definition clause, matches RERA registration details.',
    isFlagged: false,
  },
  {
    clauseNumber: 2,
    pageNumber: 3,
    title: 'Agreement to Sell & Root of Title',
    category: 'Parties & Title',
    originalLegalText:
      '2. By an Agreement to Sell executed on 14th August 2026, the Vendor agreed to transfer and convey all his right, title, and interest in the said Flat free from all charges, subject to payment of total agreed consideration of ₹ 86,00,000.',
    plainExplanation:
      'Confirms the prior preliminary agreement from August 2026 and re-states the total purchase price of ₹86 Lakhs.',
    buyerObligation: 'Adhere to total price agreed in August preliminary agreement.',
    sellerObligation: 'Bound to convey full title without hiking consideration.',
    riskLevel: 'STANDARD',
    isFlagged: false,
  },
  {
    clauseNumber: 3,
    pageNumber: 5,
    title: 'Earnest Money & Advance Consideration',
    category: 'Financial & Consideration',
    originalLegalText:
      '3. Out of the said total consideration, the Purchaser has prior to the execution of these presents paid an earnest sum of ₹ 8,60,000 via RTGS, receipt whereof the Vendor doth hereby admit and acknowledge.',
    plainExplanation:
      'Acknowledges receipt of ₹8.6 Lakhs (10% booking token) already paid by the buyer via bank transfer.',
    buyerObligation: 'Ensure bank UTR receipt number is recorded in the final registered deed.',
    sellerObligation: 'Gives formal legal discharge for the 10% advance received.',
    riskLevel: 'STANDARD',
    isFlagged: false,
  },
  {
    clauseNumber: 4,
    pageNumber: 7,
    title: 'Balance Consideration & Encumbrance Discharge Severance',
    category: 'Financial & Consideration',
    originalLegalText:
      '4. The Purchaser shall pay the balance consideration of ₹ 86,00,000 (Rupees Eighty-Six Lakhs only) to the Vendor on or before the date of execution hereof, whether or not the encumbrances recorded against the said Flat as on the date hereof have been discharged by the Vendor.',
    plainExplanation:
      'CRITICAL TRAP: You must pay the full remaining money even if the seller’s existing bank loan or mortgage charge has NOT been cleared.',
    buyerObligation: 'Currently forces you to pay in full regardless of whether the bank still holds the flat.',
    sellerObligation: 'Promises to clear the loan eventually as an independent covenant, after taking your money.',
    riskLevel: 'HIGH',
    riskReason: 'Unlinks payment from mortgage release. If seller defaults, SBI can seize the flat under SARFAESI Act.',
    recommendedRevision:
      'Amend to state that balance consideration will be paid via split DD directly to SBI loan account against formal pre-closure letter, or held in escrow.',
    isFlagged: true,
    findingId: 'f-1',
  },
  {
    clauseNumber: 5,
    pageNumber: 7,
    title: 'Encumbrance-Free Title Declaration & Schedule III Exception',
    category: 'Warranties & Indemnity',
    originalLegalText:
      '5. The Vendor declares that the said Flat is free from all encumbrances, charges, liens, attachments and claims of any nature whatsoever, save as disclosed in Schedule III hereto, and undertakes to indemnify the Purchaser against any claim arising from any act of the Vendor prior to the date hereof.',
    plainExplanation:
      'The seller claims the title is clean, EXCEPT for liabilities listed in Schedule III. However, Schedule III is missing from this draft!',
    buyerObligation: 'Requires accepting title subject to exceptions you haven\'t read.',
    sellerObligation: 'Indemnifies buyer, but cuts down protection with the mystery Schedule III.',
    riskLevel: 'MEDIUM',
    riskReason: 'Hidden liabilities, liens, or court attachments could be buried in unattached Schedule III.',
    recommendedRevision:
      'Demand immediate inspection of Schedule III. If blank, explicitly state "Schedule III: NIL / None".',
    isFlagged: true,
    findingId: 'f-3',
  },
  {
    clauseNumber: 6,
    pageNumber: 7,
    title: 'Possession Timeline & Premature Outgoings Shift',
    category: 'Possession & Handover',
    originalLegalText:
      '6. Possession of the said Flat shall be handed over to the Purchaser within a reasonable time after registration, and the Purchaser shall bear all outgoings from the date of this Deed irrespective of the date on which possession is actually delivered.',
    plainExplanation:
      'CRITICAL TRAP: Handover date is vague ("within a reasonable time"), yet you must pay society maintenance and municipal taxes immediately.',
    buyerObligation: 'Forced to pay maintenance and taxes immediately even while locked out.',
    sellerObligation: 'Can delay handing over keys indefinitely without facing a breach.',
    riskLevel: 'HIGH',
    riskReason: 'No fixed possession date; shifts financial liabilities onto buyer before actual physical access.',
    recommendedRevision:
      'Possession must be delivered on date of registration at sub-registrar desk; outgoings payable only from actual key handover.',
    isFlagged: true,
    findingId: 'f-2',
  },
  {
    clauseNumber: 7,
    pageNumber: 8,
    title: 'Stamp Duty, Registration & Open-Ended Incidental Expenses',
    category: 'Taxes & Outgoings',
    originalLegalText:
      '7. All stamp duty, registration charges and incidental expenses in respect of this Deed shall be borne and paid by the Purchaser alone.',
    plainExplanation:
      'Buyer pays stamp duty and registration fees, PLUS undefined "incidental expenses" without any financial ceiling.',
    buyerObligation: 'Liable for unspecified third-party costs or administrative fees.',
    sellerObligation: 'Exempt from all transaction and liaison expenses.',
    riskLevel: 'MEDIUM',
    riskReason: '"Incidental expenses" is unitemized and could include seller\'s personal society transfer penalties.',
    recommendedRevision:
      'Clarify: "Stamp duty and official sub-registrar fees by Purchaser; Vendor pays own legal and society clearance fees."',
    isFlagged: true,
    findingId: 'f-5',
  },
  {
    clauseNumber: 8,
    pageNumber: 9,
    title: 'Default Interest & Penalty Asymmetry',
    category: 'Financial & Consideration',
    originalLegalText:
      '8. If the Purchaser delays payment of any installment beyond the due date, interest at 18% per annum shall accrue, without prejudice to Vendor\'s right to terminate.',
    plainExplanation:
      'If you pay late by even one week, seller charges you 18% penal interest. But if seller delays handing over possession, he pays 0%.',
    buyerObligation: 'High 18% annual interest penalty on any payment delay.',
    sellerObligation: 'No reciprocal penalty for failing to deliver possession or NOCs on time.',
    riskLevel: 'LOW',
    riskReason: 'One-sided financial penalty lacking reciprocity.',
    recommendedRevision:
      'Add reciprocal clause: "Vendor shall pay ₹2,000 per day of delay in handing over physical vacant possession."',
    isFlagged: false,
  },
  {
    clauseNumber: 9,
    pageNumber: 10,
    title: 'Physical Fixtures, Fittings & Current Condition',
    category: 'Possession & Handover',
    originalLegalText:
      '9. The Purchaser has inspected the said Flat along with all permanent fixtures, electrical installations, and fittings, and accepts the same in its present as-is condition without any warranty as to internal latent defects.',
    plainExplanation:
      'You accept the apartment in "as-is" condition. Seller will not repair hidden plumbing or electrical defects.',
    buyerObligation: 'Conduct thorough pre-possession snagging inspection before signing.',
    sellerObligation: 'Hands over flat without ongoing repair obligations.',
    riskLevel: 'STANDARD',
    riskReason: 'Standard resale condition; requires buyer due diligence on electricity meter and water seepage.',
    isFlagged: false,
  },
  {
    clauseNumber: 10,
    pageNumber: 11,
    title: 'Municipal Taxes & Society Arrears Clearance',
    category: 'Taxes & Outgoings',
    originalLegalText:
      '10. The Vendor covenants to pay and discharge all property taxes, water cess, electricity bills, and society maintenance charges accrued up to the date of execution hereof.',
    plainExplanation:
      'Seller is obligated to clear all past municipal taxes, electricity bills, and society maintenance up to the signing date.',
    buyerObligation: 'Collect receipt copies and zero-dues certificates prior to signing.',
    sellerObligation: 'Legally required to show zero arrears on execution date.',
    riskLevel: 'STANDARD',
    riskReason: 'Protective standard clause. Must be verified with physical PMC tax receipts.',
    isFlagged: false,
  },
  {
    clauseNumber: 11,
    pageNumber: 12,
    title: 'Co-Ownership Authority & Defective Party Representation',
    category: 'Parties & Title',
    originalLegalText:
      '11. The Vendor declares that he has full right and authority to convey the said Flat on behalf of the registered co-owners without necessity of separate concurrence.',
    plainExplanation:
      'RISKY: Title search shows two registered co-owners, but only one is signing this deed, claiming verbal authority.',
    buyerObligation: 'Exposed to challenge by non-signing co-owner under Hindu Succession / Transfer of Property Act.',
    sellerObligation: 'Assumes authority without providing a registered General Power of Attorney.',
    riskLevel: 'MEDIUM',
    riskReason: 'A co-owner who does not sign or grant registered POA can file a civil suit to invalidate the sale.',
    recommendedRevision:
      'Both co-owners must execute the deed in person before the Sub-Registrar, or produce registered POA.',
    isFlagged: true,
    findingId: 'f-4',
  },
  {
    clauseNumber: 12,
    pageNumber: 13,
    title: 'Original Title Documents Delivery',
    category: 'Parties & Title',
    originalLegalText:
      '12. The Vendor shall hand over original registered parent deeds, share certificate, and society allotment letter to the Purchaser upon registration of this Deed.',
    plainExplanation:
      'Seller must hand over original physical documents (Share Certificate, 2009 Parent Sale Deed) upon registration.',
    buyerObligation: 'Inspect originals at registration table before handing over final payment.',
    sellerObligation: 'Relinquish physical custody of all chain deeds and society share certificate.',
    riskLevel: 'STANDARD',
    isFlagged: false,
  },
  {
    clauseNumber: 13,
    pageNumber: 14,
    title: 'Society Membership & Transfer Formalities',
    category: 'Parties & Title',
    originalLegalText:
      '13. The Vendor undertakes to sign and submit Form 20(1) and transfer forms to Gulmohar Co-operative Housing Society Ltd. to effectuate transfer of shares into Purchaser\'s name.',
    plainExplanation:
      'Seller agrees to sign society transfer forms to transfer the share certificate into your name.',
    buyerObligation: 'Pay society transfer premium (max ₹25,000 under Maharashtra bylaws).',
    sellerObligation: 'Sign resignation and transfer papers without withholding consent.',
    riskLevel: 'STANDARD',
    isFlagged: false,
  },
  {
    clauseNumber: 14,
    pageNumber: 15,
    title: 'Arbitration Agreement & Local Pune Seat',
    category: 'Dispute Resolution & General',
    originalLegalText:
      '14. In case of any dispute arising out of this Deed, the same shall be referred to a sole arbitrator appointed mutually, with the seat and venue of arbitration in Pune under the Arbitration and Conciliation Act, 1996.',
    plainExplanation:
      'Disputes bypass open civil courts and go to a private sole arbitrator seated in Pune.',
    buyerObligation: 'Must submit to arbitration before filing civil suits; split arbitrator fees.',
    sellerObligation: 'Bound to Pune arbitration seat under Indian Arbitration Act.',
    riskLevel: 'LOW',
    riskReason: 'Fairly standard, but unilateral appointment traps must be guarded against.',
    isFlagged: true,
    findingId: 'f-6',
  },
  {
    clauseNumber: 15,
    pageNumber: 16,
    title: 'Specific Performance & Equitable Remedies',
    category: 'Dispute Resolution & General',
    originalLegalText:
      '15. In the event of breach by either party, the non-defaulting party shall be entitled to specific performance under the Specific Relief Act, 1963, in addition to damages.',
    plainExplanation:
      'If either party backs out, the other can legally force the transaction to complete in court.',
    buyerObligation: 'Entitled to compel transfer if seller refuses to sign after accepting money.',
    sellerObligation: 'Cannot escape transfer simply by refunding token money.',
    riskLevel: 'STANDARD',
    isFlagged: false,
  },
  {
    clauseNumber: 16,
    pageNumber: 17,
    title: 'Service of Notices by Email & Indemnity Duration Cap',
    category: 'Dispute Resolution & General',
    originalLegalText:
      '16. Any notice required under this Deed shall be deemed validly served if dispatched to the registered electronic mail addresses. Vendor\'s indemnity under Clause 5 shall subsist for a period of 12 months from execution.',
    plainExplanation:
      'Emails are legally binding notices. Seller also restricts title defect indemnity to only 12 months (statutory is 12 years).',
    buyerObligation: 'Keep designated email inbox monitored. Face loss of indemnity after 1 year.',
    sellerObligation: 'Email notices valid. Escapes title claims after 12 months.',
    riskLevel: 'LOW',
    riskReason: '12-month cap curtails statutory 12-year adverse possession limitation under Article 65.',
    recommendedRevision:
      'Delete 12-month indemnity restriction. Add Registered Post (RPAD) delivery as backup notice.',
    isFlagged: true,
    findingId: 'f-7',
  },
];

/**
 * 2. Curated Red-Flag / Risk Rubric Dataset
 * 16 benchmark red flags commonly found in Indian property and commercial transactions.
 */
export const redFlagRubricList: RedFlagRubricItem[] = [
  {
    id: 'rubric-01',
    rubricNumber: 1,
    title: 'Unconditional Payment Despite Undischarged Loan / Mortgage',
    category: 'Financial & Payment',
    severity: 'HIGH',
    status: 'DETECTED',
    reason: 'Buyer pays 100% price before seller obtains bank loan release deed.',
    theTrap:
      'Sellers take the sale consideration promising to clear their loan later. If they divert the funds, the lending bank retains first charge and can auction your home under SARFAESI.',
    benchmarkStandard:
      'Section 55(1)(g) of Transfer of Property Act requires seller to discharge all encumbrances on or before completion.',
    currentDraftStatus:
      'Clause 4 explicitly compels payment "whether or not encumbrances have been discharged".',
    clauseReference: 'Clause 4, Page 7',
    recommendedRemedy:
      'Condition final payment on production of SBI loan pre-closure letter; pay loan balance via split DD directly to bank.',
  },
  {
    id: 'rubric-02',
    rubricNumber: 2,
    title: 'Indefinite Possession Handover ("Reasonable Time")',
    category: 'Possession & Handover',
    severity: 'HIGH',
    status: 'DETECTED',
    reason: 'Possession date is vague with no fixed calendar deadline or delay penalty.',
    theTrap:
      'Allows seller or tenant to continue occupying the flat for months without contractual breach, while you pay EMI.',
    benchmarkStandard:
      'Standard conveyancing requires simultaneous physical key handover at the Sub-Registrar table upon execution.',
    currentDraftStatus:
      'Clause 6 states possession "within a reasonable time after registration".',
    clauseReference: 'Clause 6, Page 7',
    recommendedRemedy:
      'Specify exact date: "Possession handed over simultaneously upon registration on 19 Sep 2026, with ₹2,000/day penalty for delay."',
  },
  {
    id: 'rubric-03',
    rubricNumber: 3,
    title: 'Missing or Omitted Disclosure Schedules (Schedule III)',
    category: 'Title & Encumbrances',
    severity: 'MEDIUM',
    status: 'DETECTED',
    reason: 'Title warranty is conditioned on exceptions in an unattached schedule.',
    theTrap:
      'Seller claims clear title "except as in Schedule III", but omits Schedule III from draft, leaving hidden liens undisclosed.',
    benchmarkStandard:
      'All schedules, negative covenants, and encumbrance disclosures must be attached and initialed by both parties.',
    currentDraftStatus:
      'Clause 5 refers to Schedule III, which is absent from Draft v2.1.',
    clauseReference: 'Clause 5, Page 7',
    recommendedRemedy:
      'Demand complete Schedule III before signing. If no encumbrances exist, write "Schedule III: NIL".',
  },
  {
    id: 'rubric-04',
    rubricNumber: 4,
    title: 'Defective Execution: Single Co-Owner Signs Without Registered POA',
    category: 'Title & Encumbrances',
    severity: 'MEDIUM',
    status: 'DETECTED',
    reason: 'Only one recorded co-owner executes the conveyance deed.',
    theTrap:
      'Excluded co-owner or family member can challenge the sale in civil court as unauthorized, causing years of injunction.',
    benchmarkStandard:
      'Section 44 Transfer of Property Act & Section 17 Registration Act require all registered owners to execute deed.',
    currentDraftStatus:
      'Clause 11 asserts unilateral authority without attaching a registered Power of Attorney.',
    clauseReference: 'Clause 11, Page 12',
    recommendedRemedy:
      'Require both co-owners to execute the deed in person before the Sub-Registrar, or produce registered POA.',
  },
  {
    id: 'rubric-05',
    rubricNumber: 5,
    title: 'Premature Liability Shift: Outgoings & Taxes Prior to Possession',
    category: 'Liabilities & Outgoings',
    severity: 'MEDIUM',
    status: 'DETECTED',
    reason: 'Buyer bears taxes and society maintenance before taking physical keys.',
    theTrap:
      'You are billed for electricity, municipal tax, and society maintenance while seller retains possession.',
    benchmarkStandard:
      'Section 55(5)(d) Transfer of Property Act: Buyer pays public charges and outgoings only from the date possession is delivered.',
    currentDraftStatus:
      'Clause 6 shifts all outgoings from deed date "irrespective of actual possession delivery".',
    clauseReference: 'Clause 6, Page 7',
    recommendedRemedy:
      'Amend: "Purchaser liable for outgoings strictly from the date physical vacant possession is formally delivered."',
  },
  {
    id: 'rubric-06',
    rubricNumber: 6,
    title: 'Truncated Title Indemnity Limitation (12 Months vs 12 Years)',
    category: 'Title & Encumbrances',
    severity: 'MEDIUM',
    status: 'DETECTED',
    reason: 'Seller limits title defect claims to 12 months.',
    theTrap:
      'Under Indian law, third-party title challenges can be filed up to 12 years later. A 12-month cap strips your legal remedy.',
    benchmarkStandard:
      'Article 65 of the Limitation Act, 1963 provides 12 years for recovery of immovable property based on title.',
    currentDraftStatus:
      'Clause 16 limits seller indemnity under Clause 5 to a period of 12 months from execution.',
    clauseReference: 'Clause 16, Page 17',
    recommendedRemedy:
      'Delete the 12-month limitation sentence entirely, allowing general law of statutory limitation to govern.',
  },
  {
    id: 'rubric-07',
    rubricNumber: 7,
    title: 'Open-Ended "Incidental Expenses" Imposed Solely on Buyer',
    category: 'Financial & Payment',
    severity: 'MEDIUM',
    status: 'DETECTED',
    reason: 'Ambiguous incidental costs shifted onto purchaser without itemization.',
    theTrap:
      'Seller attempts to pass off past society transfer penalties or builder liaison fees under "incidental expenses".',
    benchmarkStandard:
      'Standard practice: Buyer pays stamp duty and registration fees; seller pays own NOC and clearance costs.',
    currentDraftStatus:
      'Clause 7 mandates all incidental expenses borne by Purchaser alone.',
    clauseReference: 'Clause 7, Page 8',
    recommendedRemedy:
      'Amend to: "Stamp duty and registration fees by Purchaser; Vendor pays all pending society NOC and liaison charges."',
  },
  {
    id: 'rubric-08',
    rubricNumber: 8,
    title: 'Asymmetric Default Penalties (18% on Buyer, 0% on Seller)',
    category: 'Contractual Balance',
    severity: 'LOW',
    status: 'DETECTED',
    reason: 'Heavy interest penalty on buyer delay with zero compensation for seller delay.',
    theTrap:
      'Creates unfair bargaining asymmetry where buyer is penalized heavily for banking delays while seller has no deadline.',
    benchmarkStandard:
      'Section 74 of Indian Contract Act requires reasonable, bilateral compensation clauses.',
    currentDraftStatus:
      'Clause 8 charges 18% p.a. on buyer delay with no matching clause for vendor.',
    clauseReference: 'Clause 8, Page 9',
    recommendedRemedy:
      'Introduce reciprocal penalty or reduce interest rate to standard SBI MCLR + 2%.',
  },
  {
    id: 'rubric-09',
    rubricNumber: 9,
    title: 'Unilateral Sole Arbitrator Appointment Traps',
    category: 'Dispute Resolution',
    severity: 'LOW',
    status: 'DETECTED',
    reason: 'Arbitration clauses that allow one party to handpick the arbitrator.',
    theTrap:
      'Supreme Court (Perkins Eastman) invalidated unilateral appointments; draft must require mutual agreement.',
    benchmarkStandard:
      'Section 12(5) of Arbitration & Conciliation Act 1996 mandates impartial, mutually agreed appointments.',
    currentDraftStatus:
      'Clause 14 specifies mutual appointment in Pune. (Safe, but procedural rules should be confirmed).',
    clauseReference: 'Clause 14, Page 15',
    recommendedRemedy:
      'Maintain "mutually agreed" language; provide fallback to High Court of Bombay under Section 11(6).',
  },
  {
    id: 'rubric-10',
    rubricNumber: 10,
    title: 'Digital-Only Email Notice Service Without Postal Fallback',
    category: 'Dispute Resolution',
    severity: 'LOW',
    status: 'DETECTED',
    reason: 'Formal legal notices validly served via email without physical registered post.',
    theTrap:
      'Important notices sent to spam folders or unused email IDs can cause default proceedings without knowledge.',
    benchmarkStandard:
      'Civil Procedure Code requires formal notice by Registered Post A.D. or Speed Post.',
    currentDraftStatus:
      'Clause 16 provides that email alone constitutes valid legal service.',
    clauseReference: 'Clause 16, Page 17',
    recommendedRemedy:
      'Require dual notice: Email AND Registered Post Acknowledge Due (RPAD) to physical address.',
  },
  {
    id: 'rubric-11',
    rubricNumber: 11,
    title: 'Immediate Token / Earnest Money Forfeiture Without Cure Period',
    category: 'Financial & Payment',
    severity: 'HIGH',
    status: 'SAFE',
    reason: 'Seller forfeits entire 10% advance upon minor 24-48 hr procedural delay.',
    theTrap:
      'Common builder trap where buyer loses ₹8.6L if bank disbursement is delayed by 3 days.',
    benchmarkStandard:
      'Supreme Court doctrine (Maula Bux, Kailash Nath) prohibits non-genuine pre-estimate forfeitures without cure notice.',
    currentDraftStatus:
      'SAFE IN DRAFT V2.1: 15-day mandatory formal cure notice period was successfully added in revision.',
    clauseReference: 'Amended in Clause 3',
    recommendedRemedy:
      'Ensure 15-day cure notice language remains intact in the final execution print.',
  },
  {
    id: 'rubric-12',
    rubricNumber: 12,
    title: 'Waiver of Statutory RERA or Consumer Protection Rights',
    category: 'Contractual Balance',
    severity: 'HIGH',
    status: 'SAFE',
    reason: 'Clauses forcing buyer to waive statutory protections under RERA or Consumer Protection Act.',
    theTrap:
      'Clauses claiming buyer waives right to approach consumer forum or RERA authority.',
    benchmarkStandard:
      'Section 23 of Indian Contract Act: Any agreement contracting out of statutory public law is void ab initio.',
    currentDraftStatus:
      'SAFE: No statutory waiver clause present in this resale deed.',
    clauseReference: 'Not Present (Clean)',
    recommendedRemedy: 'Maintain exclusion of any clause attempting to restrict statutory remedies.',
  },
  {
    id: 'rubric-13',
    rubricNumber: 13,
    title: 'Blanket Irrevocable Power of Attorney Inserted into Sale Deed',
    category: 'Contractual Balance',
    severity: 'HIGH',
    status: 'SAFE',
    reason: 'Seller or developer takes irrevocable power to alter plans or sign documents for buyer.',
    theTrap:
      'Enables developer to consume extra FSI, add unauthorized floors, or pledge land without your consent.',
    benchmarkStandard:
      'Supreme Court in Suraj Lamp Industries ruled POA cannot substitute or diminish registered conveyancing.',
    currentDraftStatus:
      'SAFE: No POA clauses inserted in this individual resale conveyance.',
    clauseReference: 'Not Present (Clean)',
    recommendedRemedy: 'Never sign an irrevocable POA in favor of seller or developer.',
  },
  {
    id: 'rubric-14',
    rubricNumber: 14,
    title: 'Absence of Original Parent Deeds Handover Obligation',
    category: 'Title & Encumbrances',
    severity: 'MEDIUM',
    status: 'WATCHLIST',
    reason: 'Deed does not explicitly list each link in the title chain to be handed over physically.',
    theTrap:
      'If seller retains original 2009 mother deed, he can fraudulently deposit it with a private moneylender for an illegal loan.',
    benchmarkStandard:
      'Section 55(3) Transfer of Property Act requires seller to deliver all title deeds relating to the property.',
    currentDraftStatus:
      'WATCHLIST: Clause 12 mentions handing over deeds generally, but lacks an exhaustive schedule of original documents.',
    clauseReference: 'Clause 12, Page 13',
    recommendedRemedy:
      'Add Annexure "Schedule IV - Inventory of Original Documents Handed Over" (2009 deed, share cert, tax receipts).',
  },
  {
    id: 'rubric-15',
    rubricNumber: 15,
    title: 'Undefined Society Transfer Fee Apportionment',
    category: 'Liabilities & Outgoings',
    severity: 'LOW',
    status: 'WATCHLIST',
    reason: 'Silence on who pays society entrance fee, share premium, and donation demands.',
    theTrap:
      'Societies often demand ₹25,000 to ₹1,00,000 transfer premium; seller refuses to pay after registration.',
    benchmarkStandard:
      'Maharashtra Co-operative Societies Bye-law No. 38 caps transfer premium at ₹25,000.',
    currentDraftStatus:
      'WATCHLIST: Clause 13 mentions signing transfer forms, but does not allocate the transfer fee.',
    clauseReference: 'Clause 13, Page 14',
    recommendedRemedy:
      'Clarify: "Official society transfer fee up to ₹25,000 split 50:50; any past society penalty paid solely by Vendor."',
  },
  {
    id: 'rubric-16',
    rubricNumber: 16,
    title: 'Vendor Reservation of Terrace or Undivided Land Rights',
    category: 'Title & Encumbrances',
    severity: 'HIGH',
    status: 'SAFE',
    reason: 'Seller retains exclusive rooftop terrace or rights to future vertical construction FSI.',
    theTrap:
      'Prevents society formation and allows third parties to build commercial towers or cellphone towers above you.',
    benchmarkStandard:
      'MOFA & Maharashtra Ownership Flats Rules mandate conveyance of full undivided proportionate interest in common areas.',
    currentDraftStatus:
      'SAFE: Clause 1 conveys proportionate undivided land interest and common areas without reservation.',
    clauseReference: 'Clause 1, Page 2',
    recommendedRemedy: 'Preserve full proportionate undivided share in land without exception.',
  },
];

/**
 * 3. Actionable Pre-Signing Checklist & Negotiation Protocol
 */
export const preSigningChecklist: ChecklistItem[] = [
  {
    id: 'chk-01',
    title: 'IGR Search & Index II Nil-Encumbrance Verification',
    category: 'DOCUMENTS_VERIFICATION',
    importance: 'CRITICAL_BLOCKER',
    description:
      'Complete online and physical search at Haveli Sub-Registrar office for all registered transactions against Flat 402 for the last 15–30 years.',
    status: 'VERIFIED',
    actionableStep:
      'Verify that Nil-Encumbrance Certificate (EC) covers years 2009 to September 2026 with no court attachments.',
    authorityOrSource: 'Inspector General of Registration (IGR Maharashtra)',
  },
  {
    id: 'chk-02',
    title: 'SBI Home Loan Foreclosure & Title Deeds Release Letter',
    category: 'DOCUMENTS_VERIFICATION',
    importance: 'CRITICAL_BLOCKER',
    description:
      'Vendor must obtain formal loan outstanding settlement letter directly from State Bank of India, Kalyani Nagar branch.',
    status: 'FLAGGED_FOR_ADVOCATE',
    actionableStep:
      'Issue split demand draft of loan balance directly to SBI at registration; collect original deeds release acknowledgment.',
    relevantClause: 'Clause 4',
    authorityOrSource: 'State Bank of India (SBI)',
  },
  {
    id: 'chk-03',
    title: 'Gulmohar Housing Society No-Dues Certificate & NOC',
    category: 'DOCUMENTS_VERIFICATION',
    importance: 'HIGH',
    description:
      'Obtain official NOC from managing committee certifying zero maintenance arrears, sinking fund paid, and original share certificate intact.',
    status: 'PENDING',
    actionableStep:
      'Society Secretary must issue signed letter stating no legal disputes or outstanding dues against Flat 402.',
    relevantClause: 'Clause 10 & 13',
    authorityOrSource: 'Gulmohar CHS Ltd. Managing Committee',
  },
  {
    id: 'chk-04',
    title: 'PMC Property Tax Assessment & Latest Nil-Receipt',
    category: 'DOCUMENTS_VERIFICATION',
    importance: 'HIGH',
    description:
      'Verify Pune Municipal Corporation (PMC) property tax ledger to confirm annual tax is cleared up to current assessment quarter.',
    status: 'VERIFIED',
    actionableStep:
      'Download e-receipt from PMC tax portal verifying zero arrears under Property Tax ID #PUN-KLN-402.',
    relevantClause: 'Clause 10',
    authorityOrSource: 'Pune Municipal Corporation (PMC)',
  },
  {
    id: 'chk-05',
    title: 'Original Title Chain Inspection (2009 to Present)',
    category: 'DOCUMENTS_VERIFICATION',
    importance: 'CRITICAL_BLOCKER',
    description:
      'Physically inspect original registered sale deed dated 12 October 2009 between promoter and vendor before releasing draft.',
    status: 'PENDING',
    actionableStep:
      'Ensure advocate verifies watermarks, registration stamp duty seal, and Index II copy of mother deed.',
    relevantClause: 'Clause 12',
    authorityOrSource: 'Sub-Registrar Office Haveli No. 12',
  },
  {
    id: 'chk-06',
    title: 'Amend Clause 4: Link Balance Payment to Mortgage Release',
    category: 'NEGOTIATION_PUNCH_LIST',
    importance: 'CRITICAL_BLOCKER',
    description:
      'Delete unconditional payment sentence. Replace with condition precedent that balance is paid against simultaneous loan closure.',
    status: 'FLAGGED_FOR_ADVOCATE',
    actionableStep:
      'Insert revised wording: "Balance consideration shall be paid by Demand Draft in name of lending bank towards full and final discharge of recorded mortgage."',
    relevantClause: 'Clause 4',
    authorityOrSource: 'Sale Deed Draft Negotiation',
  },
  {
    id: 'chk-07',
    title: 'Amend Clause 6: Fixed Possession Date & Delay Penalty',
    category: 'NEGOTIATION_PUNCH_LIST',
    importance: 'CRITICAL_BLOCKER',
    description:
      'Delete "within a reasonable time". Insert firm calendar date of 19 September 2026 with key handover at sub-registrar office.',
    status: 'FLAGGED_FOR_ADVOCATE',
    actionableStep:
      'Insert per-day liquidated damages clause (₹2,000/day) if vacant possession is not delivered simultaneously on registration day.',
    relevantClause: 'Clause 6',
    authorityOrSource: 'Sale Deed Draft Negotiation',
  },
  {
    id: 'chk-08',
    title: 'Demand Missing Schedule III Disclosure or Written "NIL"',
    category: 'NEGOTIATION_PUNCH_LIST',
    importance: 'HIGH',
    description:
      'Clause 5 refers to Schedule III for exceptions to clear title. Require vendor to provide the page or write "Schedule III: NIL".',
    status: 'PENDING',
    actionableStep:
      'Prevent open-ended exception to vendor\'s title indemnity before signing.',
    relevantClause: 'Clause 5',
    authorityOrSource: 'Sale Deed Draft Negotiation',
  },
  {
    id: 'chk-09',
    title: 'Require Both Registered Co-Owners to Execute Deed',
    category: 'NEGOTIATION_PUNCH_LIST',
    importance: 'CRITICAL_BLOCKER',
    description:
      'Index II records two owners. Both must appear in person before the Sub-Registrar or grant a registered Power of Attorney.',
    status: 'FLAGGED_FOR_ADVOCATE',
    actionableStep:
      'Do not rely on verbal representation in Clause 11. Insist on second co-owner signature on deed and sub-registrar register.',
    relevantClause: 'Clause 11',
    authorityOrSource: 'Sub-Registrar Office Haveli',
  },
  {
    id: 'chk-10',
    title: 'Sub-Registrar Biometric Slot & e-Challan Generation',
    category: 'REGISTRATION_DAY',
    importance: 'HIGH',
    description:
      'Generate GRAS challan for 6% stamp duty + 1% registration fee; book biometric time slot at Haveli No. 12.',
    status: 'PENDING',
    actionableStep:
      'Confirm two witnesses with valid Aadhaar/PAN cards are present at Haveli office at 11:30 AM on 19 September 2026.',
    relevantClause: 'Clause 7',
    authorityOrSource: 'IGR Maharashtra e-Stepin Portal',
  },
  {
    id: 'chk-11',
    title: 'Physical Flat Handover & Meter Inspection Protocol',
    category: 'REGISTRATION_DAY',
    importance: 'HIGH',
    description:
      'Conduct final walk-through inspection before sub-registrar appointment. Check electricity meter reading and collect all 3 sets of keys.',
    status: 'PENDING',
    actionableStep:
      'Take photos of MSEDCL electricity meter reading; verify apartment is completely vacant and broom-clean.',
    relevantClause: 'Clause 9',
    authorityOrSource: 'Physical Site Inspection',
  },
];

/**
 * 4. Grounded Q&A Knowledge Base
 * Strictly verified against the 18-page Kalyani Nagar Sale Deed.
 * Contains both document-grounded answers with citations,
 * AND explicitly tested refusal responses for unstated queries.
 */
export interface GroundedQAEntry {
  id: string;
  query: string;
  isGroundedInDocument: boolean;
  citation?: {
    clauseNumber: number;
    pageNumber: number;
    verbatimQuote: string;
  };
  answerPlain: string;
  citizenAction: string;
  category: string;
}

export const groundedQADatabase: GroundedQAEntry[] = [
  // Grounded entries (In Document)
  {
    id: 'qa-01',
    query: 'What is the total purchase price and how has it been paid so far?',
    isGroundedInDocument: true,
    citation: {
      clauseNumber: 3,
      pageNumber: 5,
      verbatimQuote:
        '3. Out of the said total consideration, the Purchaser has prior to the execution of these presents paid an earnest sum of ₹ 8,60,000 via RTGS... balance consideration of ₹ 86,00,000 payable on execution.',
    },
    answerPlain:
      'The total agreed purchase price is ₹86,00,000 (Rupees Eighty-Six Lakhs). You have already paid 10% (₹8,60,000) as an earnest deposit via RTGS, acknowledged under Clause 3. The remaining balance of ₹86,00,000 is stipulated for payment on or before execution under Clause 4.',
    citizenAction:
      'Ensure the specific bank RTGS UTR transaction number is typed into the final registered deed before biometric execution.',
    category: 'Consideration & Money',
  },
  {
    id: 'qa-02',
    query: 'When does the seller promise to hand over physical possession of Flat 402?',
    isGroundedInDocument: true,
    citation: {
      clauseNumber: 6,
      pageNumber: 7,
      verbatimQuote:
        '6. Possession of the said Flat shall be handed over to the Purchaser within a reasonable time after registration, and the Purchaser shall bear all outgoings from the date of this Deed irrespective of the date on which possession is actually delivered.',
    },
    answerPlain:
      'Clause 6 does NOT give a fixed calendar date. It states possession will be given "within a reasonable time after registration". Furthermore, it transfers all maintenance and tax liabilities onto you from the deed date even before you get the keys.',
    citizenAction:
      'Negotiate this immediately with your advocate: replace "reasonable time" with simultaneous key handover at the Sub-Registrar desk on 19 September 2026.',
    category: 'Possession & Handover',
  },
  {
    id: 'qa-03',
    query: 'Do I have to pay the seller if the existing home loan is not closed?',
    isGroundedInDocument: true,
    citation: {
      clauseNumber: 4,
      pageNumber: 7,
      verbatimQuote:
        '4. The Purchaser shall pay the balance consideration... whether or not the encumbrances recorded against the said Flat as on the date hereof have been discharged by the Vendor.',
    },
    answerPlain:
      'Under the current draft text of Clause 4, YES — the wording explicitly requires you to pay in full "whether or not the encumbrances... have been discharged". This is a serious legal hazard because the lender\'s legal mortgage will remain attached to your flat.',
    citizenAction:
      'Do not sign this clause as drafted. Demand a split payment where the loan balance is paid directly to SBI against a formal loan closure letter.',
    category: 'Encumbrance & Loan',
  },
  {
    id: 'qa-04',
    query: 'Who pays stamp duty and registration expenses?',
    isGroundedInDocument: true,
    citation: {
      clauseNumber: 7,
      pageNumber: 8,
      verbatimQuote:
        '7. All stamp duty, registration charges and incidental expenses in respect of this Deed shall be borne and paid by the Purchaser alone.',
    },
    answerPlain:
      'Clause 7 places all stamp duty, registration charges, and "incidental expenses" solely upon you as the Purchaser. The term "incidental expenses" is unitemized and could be used by the seller to pass on society transfer fees.',
    citizenAction:
      'Ask your advocate to cap or itemize "incidental expenses" to strictly mean official government sub-registrar fees.',
    category: 'Costs & Taxes',
  },
  {
    id: 'qa-05',
    query: 'Where will legal disputes be heard if a disagreement arises?',
    isGroundedInDocument: true,
    citation: {
      clauseNumber: 14,
      pageNumber: 15,
      verbatimQuote:
        '14. In case of any dispute arising out of this Deed, the same shall be referred to a sole arbitrator appointed mutually, with the seat and venue of arbitration in Pune under the Arbitration and Conciliation Act, 1996.',
    },
    answerPlain:
      'Disputes are referred to arbitration before a mutually agreed sole arbitrator with the seat and venue in Pune under the Arbitration and Conciliation Act, 1996. It avoids court backlogs, but both parties must share arbitrator fees.',
    citizenAction:
      'Ensure the clause retains "appointed mutually" so the seller cannot unilaterally nominate their personal acquaintance as arbitrator.',
    category: 'Dispute Resolution',
  },
  {
    id: 'qa-06',
    query: 'What is Schedule III mentioned in Clause 5?',
    isGroundedInDocument: true,
    citation: {
      clauseNumber: 5,
      pageNumber: 7,
      verbatimQuote:
        '5. The Vendor declares that the said Flat is free from all encumbrances... save as disclosed in Schedule III hereto...',
    },
    answerPlain:
      'Schedule III is cited as an annexure containing exceptions to the seller\'s clear-title warranty. However, in the uploaded 18-page Draft v2.1, Schedule III is entirely missing. This means you do not know what encumbrances or third-party claims are being excluded from the warranty.',
    citizenAction:
      'Do not execute the deed without reviewing Schedule III. If the seller asserts title is 100% clean, insist on writing "Schedule III: NIL / None".',
    category: 'Title & Warranties',
  },

  // Out-of-document entries (Explicit Grounding Refusal)
  {
    id: 'qa-refusal-01',
    query: 'What is the seller\'s PAN number or Aadhaar card details?',
    isGroundedInDocument: false,
    answerPlain:
      'NOT FOUND IN UPLOADED DOCUMENT: The 18-page Sale Deed for Flat 402, Kalyani Nagar does not contain the seller\'s PAN card number or Aadhaar identification details in the draft recitals. Vidhi answers strictly from the provided text to prevent legal hallucination.',
    citizenAction:
      'Both PAN and Aadhaar copies are mandatory for Sub-Registrar e-Stepin slot booking and TDS deduction under Section 194-IA. Request certified copies directly from the vendor.',
    category: 'Out of Document',
  },
  {
    id: 'qa-refusal-02',
    query: 'What is the monthly society maintenance charge for Flat 402?',
    isGroundedInDocument: false,
    answerPlain:
      'NOT FOUND IN UPLOADED DOCUMENT: The uploaded Sale Deed specifies that the purchaser is liable for outgoings after execution (Clause 6), but does NOT specify the monthly maintenance amount or sinking fund dues for Gulmohar Residency.',
    citizenAction:
      'Inspect the latest maintenance bill from Gulmohar Co-operative Housing Society Ltd. to verify exact monthly charges (typically ₹3,500–₹5,000/mo in Kalyani Nagar).',
    category: 'Out of Document',
  },
  {
    id: 'qa-refusal-03',
    query: 'Is there a commercial mortgage or tenant currently living in Flat 402?',
    isGroundedInDocument: false,
    answerPlain:
      'NOT FOUND IN UPLOADED DOCUMENT: The deed does not disclose existing tenancy agreements, leasehold terms, or physical occupancy status in the recitals. Furthermore, Schedule III (which would list such exceptions) is omitted.',
    citizenAction:
      'Conduct a mandatory physical site inspection before 19 September to verify the flat is vacant and tenant-free.',
    category: 'Out of Document',
  },
  {
    id: 'qa-refusal-04',
    query: 'What is the builder\'s MahaRERA registration number for Gulmohar Residency?',
    isGroundedInDocument: false,
    answerPlain:
      'NOT FOUND IN UPLOADED DOCUMENT: The uploaded deed is a private resale conveyance between individual co-owners from 2009 and does not state the original project MahaRERA registration number.',
    citizenAction:
      'Check the MahaRERA portal under "Gulmohar Residency Kalyani Nagar" or inspect the original 2009 parent deed.',
    category: 'Out of Document',
  },
];

/**
 * 5. Dispute & Negotiation Pathways (Options & Next-Steps Overview)
 * Neutral, objective walkthrough of standard legal and procedural paths under Indian law.
 */
export const disputePathwaysList: DisputePathway[] = [
  {
    id: 'path-01',
    title: 'Pre-Execution Mark-Up & Advocate Addendum',
    subtitle: 'Standard, zero-litigation path to resolve draft traps before signing',
    type: 'NEGOTIATION',
    typicalTimeline: '3 to 5 Days (Before 19 Sep 2026)',
    estimatedCost: 'Minimal (Advocate consultation fee: ₹5,000–₹15,000)',
    governingLaw: 'Indian Contract Act, 1872 & Transfer of Property Act, 1882',
    forumOrAuthority: 'Direct bilateral negotiation between Buyer & Vendor Advocates',
    summary:
      'The most effective and common path. Instead of accepting the seller\'s broker draft, your advocate sends a formal marked-up counter-draft (Draft v2.2) rectifying Clauses 4, 6, 5, and 11.',
    steps: [
      {
        stage: '1. Prepare Advocate Brief',
        description: 'Take Vidhi\'s 4 structured questions and checklist to your advocate on Monday, 14 September.',
        citizenTip: 'Ensure the advocate drafts specific redline amendments rather than vague verbal objections.',
      },
      {
        stage: '2. Issue Counter-Draft to Vendor',
        description: 'Send revised draft linking final ₹86L payment to SBI loan release and fixing possession on 19 Sep.',
        citizenTip: 'Sellers in resale transactions almost always concede on standard bank release and fixed possession dates.',
      },
      {
        stage: '3. Pre-Closure Letter from SBI',
        description: 'Vendor obtains formal loan settlement letter from SBI Kalyani Nagar branch specifying the exact payoff figure.',
        citizenTip: 'Prepare two demand drafts: one directly to SBI for the loan payoff, and one to vendor for the balance.',
      },
      {
        stage: '4. Simultaneous Registration & Key Handover',
        description: 'Execute deed at Haveli Sub-Registrar desk only when keys, society NOC, and loan receipt are placed on the table.',
        citizenTip: 'Do not hand over the balance Demand Draft until biometric thumbs and signatures are complete.',
      },
    ],
    pros: [
      'Zero court litigation or formal dispute records.',
      'Prevents loss of ₹86,00,000 before money leaves your account.',
      'Fastest and lowest cost resolution.',
    ],
    cons: [
      'Requires vendor cooperation to accept amended clauses.',
      'May delay registration by 2–3 days if bank letter is pending.',
    ],
    suitabilityForMatter: '100% RECOMMENDED: This is the exact phase your matter is currently in.',
  },
  {
    id: 'path-02',
    title: 'Arbitration Under Clause 14',
    subtitle: 'How the private dispute mechanism in your deed actually plays out',
    type: 'ARBITRATION',
    typicalTimeline: '12 to 18 Months',
    estimatedCost: 'Moderate to High (Arbitrator fees ₹1.5L–₹3L split, plus counsel fees)',
    governingLaw: 'Arbitration and Conciliation Act, 1996 (amended 2015 & 2019)',
    forumOrAuthority: 'Sole Arbitrator seated in Pune (Private Tribunal)',
    summary:
      'Clause 14 mandates that disputes arising out of the deed go to arbitration in Pune. This avoids the 5–10 year civil court backlog, but requires upfront private tribunal fees.',
    steps: [
      {
        stage: '1. Section 21 Invocation Notice',
        description: 'Aggrieved party serves a formal legal notice stating the dispute and proposing names of sole arbitrators.',
        citizenTip: 'Under Section 12(5), the seller cannot unilaterally appoint his own lawyer; it must be mutually agreed.',
      },
      {
        stage: '2. Constitution of Tribunal / Sec 11 Petition',
        description: 'If parties agree on an arbitrator within 30 days, the tribunal begins. If not, petition High Court of Bombay under Section 11.',
        citizenTip: 'Retired District Judges or Senior Advocates in Pune typically charge per-hearing or fixed fees per Fourth Schedule.',
      },
      {
        stage: '3. Statement of Claim & Section 17 Interim Relief',
        description: 'Buyer files claim for possession or title indemnity. Can apply for interim injunction restraining third-party sale.',
        citizenTip: 'Section 17 orders carry the same legal weight as civil court injunctions.',
      },
      {
        stage: '4. Arbitral Award & Section 34 Enforcement',
        description: 'Arbitrator passes reasoned award within 12 months. Binding as a court decree unless challenged on narrow Section 34 grounds.',
        citizenTip: 'Section 34 challenge does not automatically stay execution unless High Court grants explicit stay.',
      },
    ],
    pros: [
      'Much faster than civil court (statutory 12-month timeline under Section 29A).',
      'Confidential proceedings; hearings scheduled on mutually convenient weekends/evenings.',
      'Enforceable directly as a civil court decree.',
    ],
    cons: [
      'Parties bear arbitrator fees (unlike civil courts where judge is state-funded).',
      'Requires initial mutual consensus or High Court appointment.',
    ],
    suitabilityForMatter: 'Applicable post-registration if seller fails to clear loan or title defects arise later.',
  },
  {
    id: 'path-03',
    title: 'Specific Performance Suit in Civil Court',
    subtitle: 'Court action if seller accepts token but refuses to execute or hand over',
    type: 'CIVIL_COURT',
    typicalTimeline: '3 to 7 Years (Appellate hierarchy up to High Court)',
    estimatedCost: 'High (Ad-valorem court fee ~₹50,000–₹1,00,000 in Maharashtra + legal fees)',
    governingLaw: 'Specific Relief Act, 1963 & Code of Civil Procedure (CPC), 1908',
    forumOrAuthority: 'Civil Judge Senior Division, Pune (Shivajinagar District Court)',
    summary:
      'If the seller attempts to back out to sell to a higher bidder, you can sue under Section 10 of the Specific Relief Act (post-2018 amendment makes specific performance mandatory rather than discretionary).',
    steps: [
      {
        stage: '1. Legal Notice Demonstrating "Readiness & Willingness"',
        description: 'Serve legal notice proving you have the ₹86L ready and demand execution within 15 days.',
        citizenTip: 'You must preserve bank statements proving financial readiness; courts dismiss suits if funds aren\'t shown.',
      },
      {
        stage: '2. Filing Plaint & Order 39 Temporary Injunction',
        description: 'File suit in Pune Civil Court; obtain immediate ex-parte injunction restraining seller from selling or mortgaging Flat 402.',
        citizenTip: 'Register a Lis Pendens notice under Section 52 Transfer of Property Act with the Sub-Registrar to warn third parties.',
      },
      {
        stage: '3. Evidence, Cross-Examination & Judgment',
        description: 'Both parties produce witnesses. Court orders execution of sale deed upon payment of balance into court treasury.',
        citizenTip: 'If seller refuses to attend sub-registrar after decree, the Court Commissioner signs on seller\'s behalf.',
      },
    ],
    pros: [
      'Mandatory relief under 2018 Specific Relief amendment.',
      'Lis Pendens prevents third-party buyers from acquiring clean title.',
      'Court commissioner can execute deed if seller defaults.',
    ],
    cons: [
      'Lengthy civil court timeline in Pune (3–7 years).',
      'Requires substantial ad-valorem court fees upfront.',
    ],
    suitabilityForMatter: 'Reserve only if seller dishonestly breaches agreement after taking your ₹8.6L token.',
  },
  {
    id: 'path-04',
    title: 'Pre-Litigation Mediation & Lok Adalat',
    subtitle: 'Fast-track, zero court fee dispute settlement with binding consent decree',
    type: 'MEDIATION',
    typicalTimeline: '30 to 60 Days',
    estimatedCost: 'Zero Court Fee / Nominal mediation charges',
    governingLaw: 'Legal Services Authorities Act, 1987 & Mediation Act, 2023',
    forumOrAuthority: 'Pune District Legal Services Authority (DLSA), Shivajinagar',
    summary:
      'A powerful, voluntary ADR process. A trained mediator or Lok Adalat panel facilitates an amicable settlement without cross-examination or adversarial trial.',
    steps: [
      {
        stage: '1. File Pre-Litigation Mediation Application',
        description: 'Submit simple application to Pune DLSA detailing dispute over possession date or loan discharge.',
        citizenTip: 'Notice is served through DLSA official summons, which vendors treat with high seriousness.',
      },
      {
        stage: '2. Joint Mediation Sessions',
        description: 'Parties meet at Pune District Court ADR Centre with a neutral senior mediator.',
        citizenTip: 'Discussions are strictly confidential and cannot be used as admissions in future court cases.',
      },
      {
        stage: '3. Award & Binding Consent Decree',
        description: 'Upon agreement, a settlement agreement is drawn up and passed as a Lok Adalat award.',
        citizenTip: 'A Lok Adalat award has the status of a final civil court decree with NO appeal permitted under law.',
      },
    ],
    pros: [
      '100% refund of any court fees paid.',
      'No appeal lies against Lok Adalat award (finality).',
      'Preserves goodwill between neighbors and society members.',
    ],
    cons: [
      'Voluntary: cannot force vendor to participate if he boycotts.',
    ],
    suitabilityForMatter: 'Excellent fallback if minor possession or maintenance dispute arises on registration day.',
  },
];
