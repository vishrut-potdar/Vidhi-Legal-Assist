export interface DocumentLine {
  lineNumber: number;
  clauseNumber?: number;
  text: string;
  isFlaggedFinding?: boolean;
  findingId?: string;
  findingSeverity?: 'HIGH' | 'MEDIUM' | 'LOW';
  findingTitle?: string;
}

export interface DocumentPage {
  pageNumber: number;
  headerTitle: string;
  stampDutyNote?: string;
  lines: DocumentLine[];
}

export const deedPages: DocumentPage[] = [
  {
    pageNumber: 2,
    headerTitle: 'DEED OF SALE — RECITALS & PROPERTY DESCRIPTION',
    lines: [
      {
        lineNumber: 1,
        clauseNumber: 1,
        text: '1. The Vendor is the absolute and sole lawful owner of Flat No. 402,',
      },
      {
        lineNumber: 2,
        clauseNumber: 1,
        text: 'admeasuring 1,120 square feet built-up area (carpet area 896 sq. ft.), on the Fourth Floor',
      },
      {
        lineNumber: 3,
        clauseNumber: 1,
        text: 'of the building known as "Gulmohar Residency", situated at Kalyani Nagar, Pune - 411006,',
      },
      {
        lineNumber: 4,
        clauseNumber: 1,
        text: 'together with one covered stilt car parking space No. B-12 and proportionate undivided',
      },
      {
        lineNumber: 5,
        clauseNumber: 1,
        text: 'share in the underlying freehold land admeasuring 2,400 sq. meters, cadastral survey No. 192.',
      },
    ],
  },
  {
    pageNumber: 3,
    headerTitle: 'DEED OF SALE — AGREEMENT TO SELL & TOTAL CONSIDERATION',
    lines: [
      {
        lineNumber: 1,
        clauseNumber: 2,
        text: '2. By an Agreement to Sell executed and registered on 14th August 2026 under Serial No. 4821/2026,',
      },
      {
        lineNumber: 2,
        clauseNumber: 2,
        text: 'the Vendor agreed to transfer and convey all his right, title, and interest in the said Flat free from all charges,',
      },
      {
        lineNumber: 3,
        clauseNumber: 2,
        text: 'subject to the due payment of the total agreed consideration of ₹ 86,00,000 (Rupees Eighty-Six Lakhs only).',
      },
      {
        lineNumber: 4,
        clauseNumber: 2,
        text: 'The Purchaser covenants that the agreed consideration is final, fixed, and non-negotiable.',
      },
    ],
  },
  {
    pageNumber: 5,
    headerTitle: 'DEED OF SALE — EARNEST MONEY & ADVANCE PAYMENT',
    lines: [
      {
        lineNumber: 1,
        clauseNumber: 3,
        text: '3. Out of the said total consideration, the Purchaser has prior to the execution of these presents paid an earnest sum',
      },
      {
        lineNumber: 2,
        clauseNumber: 3,
        text: 'of ₹ 8,60,000 (Rupees Eight Lakhs Sixty Thousand only) via RTGS / Bank Transfer UTR # HDFC9284729103,',
      },
      {
        lineNumber: 3,
        clauseNumber: 3,
        text: 'the receipt whereof the Vendor doth hereby admit, acknowledge, and confirm in full satisfaction of earnest money.',
      },
    ],
  },
  {
    pageNumber: 7,
    headerTitle: 'DEED OF SALE — CONSIDERATION, TITLE & POSSESSION',
    stampDutyNote: 'e-Stamp Certificate No. IN-MH92847291038472U • Haveli Sub-Registrar IV',
    lines: [
      {
        lineNumber: 1,
        clauseNumber: 4,
        text: '4. The Purchaser shall pay the balance consideration of ₹ 86,00,000 (Rupees Eighty-Six Lakhs only)',
      },
      {
        lineNumber: 2,
        clauseNumber: 4,
        text: 'to the Vendor on or before the date of execution hereof,',
      },
      {
        lineNumber: 3,
        clauseNumber: 4,
        text: 'whether or not the encumbrances recorded against the said Flat as on the date hereof',
        isFlaggedFinding: true,
        findingId: 'f-1',
        findingSeverity: 'HIGH',
        findingTitle: 'You must pay in full even if the flat still carries a loan or charge',
      },
      {
        lineNumber: 4,
        clauseNumber: 4,
        text: 'have been discharged by the Vendor.',
        isFlaggedFinding: true,
        findingId: 'f-1',
        findingSeverity: 'HIGH',
      },
      {
        lineNumber: 5,
        clauseNumber: 5,
        text: '5. The Vendor declares that the said Flat is free from all encumbrances, charges, liens,',
      },
      {
        lineNumber: 6,
        clauseNumber: 5,
        text: 'attachments and claims of any nature whatsoever,',
      },
      {
        lineNumber: 7,
        clauseNumber: 5,
        text: 'save as disclosed in Schedule III hereto,',
        isFlaggedFinding: true,
        findingId: 'f-3',
        findingSeverity: 'MEDIUM',
        findingTitle: 'Schedule III is referred to but is not attached',
      },
      {
        lineNumber: 8,
        clauseNumber: 5,
        text: 'and undertakes to indemnify the Purchaser against any claim arising from any act of the Vendor prior to the date hereof.',
      },
      {
        lineNumber: 9,
        clauseNumber: 6,
        text: '6. Possession of the said Flat shall be handed over to the Purchaser',
      },
      {
        lineNumber: 10,
        clauseNumber: 6,
        text: 'within a reasonable time after registration,',
        isFlaggedFinding: true,
        findingId: 'f-2',
        findingSeverity: 'HIGH',
        findingTitle: "'Reasonable time' for possession is not a date",
      },
      {
        lineNumber: 11,
        clauseNumber: 6,
        text: 'and the Purchaser shall bear all outgoings from the date of this Deed',
      },
      {
        lineNumber: 12,
        clauseNumber: 6,
        text: 'irrespective of the date on which possession is actually delivered.',
      },
      {
        lineNumber: 13,
        clauseNumber: 7,
        text: '7. All stamp duty, registration charges and incidental expenses in respect of this Deed',
      },
      {
        lineNumber: 14,
        clauseNumber: 7,
        text: 'shall be borne and paid by the Purchaser alone.',
      },
    ],
  },
  {
    pageNumber: 8,
    headerTitle: 'DEED OF SALE — INCIDENTAL EXPENSES & ARREARS',
    lines: [
      {
        lineNumber: 1,
        clauseNumber: 8,
        text: '8. If the Purchaser delays payment of any installment beyond the due date, interest at 18% per annum shall accrue,',
      },
      {
        lineNumber: 2,
        clauseNumber: 8,
        text: "without prejudice to the Vendor's right to terminate this Deed and forfeit the earnest deposit.",
      },
      {
        lineNumber: 3,
        clauseNumber: 8,
        text: 'The Vendor shall incur no liability whatsoever for any incidental delays in sanctioning permissions.',
      },
    ],
  },
  {
    pageNumber: 11,
    headerTitle: 'DEED OF SALE — CO-OWNERSHIP & CONCURRENCE',
    lines: [
      {
        lineNumber: 1,
        clauseNumber: 11,
        text: '11. The Vendor affirms that he is competent to execute this Deed and that no other person or family co-owner',
      },
      {
        lineNumber: 2,
        clauseNumber: 11,
        text: 'holds any right, share, or interest in the subject property. The consent of Mrs. Shailaja Joshi (spouse)',
      },
      {
        lineNumber: 3,
        clauseNumber: 11,
        text: 'is recorded as a consenting party under separate unnotarized declaration dated 12th August 2026.',
        isFlaggedFinding: true,
        findingId: 'f-4',
        findingSeverity: 'LOW',
        findingTitle: 'Consenting co-owner signed unnotarized letter only',
      },
    ],
  },
  {
    pageNumber: 15,
    headerTitle: 'DEED OF SALE — DISPUTE RESOLUTION & ARBITRATION',
    lines: [
      {
        lineNumber: 1,
        clauseNumber: 14,
        text: '14. Any dispute arising out of or in connection with this Deed shall be referred to arbitration',
      },
      {
        lineNumber: 2,
        clauseNumber: 14,
        text: 'before a sole arbitrator appointed exclusively by the Vendor. The seat of arbitration shall be Pune,',
      },
      {
        lineNumber: 3,
        clauseNumber: 14,
        text: 'and proceedings shall be conducted under the Arbitration and Conciliation Act, 1996 in English language.',
      },
    ],
  },
  {
    pageNumber: 17,
    headerTitle: 'DEED OF SALE — NOTICES & SERVICE',
    lines: [
      {
        lineNumber: 1,
        clauseNumber: 16,
        text: '16. Any legal notice under this Deed may be sent by electronic mail to the email addresses specified in Schedule I,',
      },
      {
        lineNumber: 2,
        clauseNumber: 16,
        text: 'and shall be deemed conclusively received 24 hours after dispatch, regardless of delivery failure notices.',
      },
    ],
  },
];
