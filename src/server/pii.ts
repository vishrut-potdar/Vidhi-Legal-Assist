/**
 * PII masking layers applied to all text before it is sent to the Gemini API.
 *
 * Layer 1: fixed statutory layouts (card numbers, Aadhaar, PAN, voter ID, passport)
 * Layer 2: pre-caution sweep (phone, email, UPI ID, IFSC, bank account numbers)
 */

export type PIIType =
  | 'AADHAAR'
  | 'PAN'
  | 'CARD'
  | 'VOTER_ID'
  | 'PASSPORT'
  | 'PHONE'
  | 'EMAIL'
  | 'UPI'
  | 'BANK_ACCOUNT'
  | 'IFSC';

export interface MaskedEntity {
  type: PIIType;
  originalToken: string;
  maskedToken: string;
  position: { start: number; end: number };
}

interface MaskRule {
  type: PIIType;
  regex: RegExp;
  mask: (match: string) => string;
}

const digitsOnly = (s: string) => s.replace(/\D/g, '');

const LAYER1_RULES: MaskRule[] = [
  // Card numbers first so their first 12 digits are not mistaken for Aadhaar.
  {
    type: 'CARD',
    regex: /(?<!\d)(?:\d{4}[\s-]){3}\d{1,7}(?!\d)|(?<!\d)\d{15,16}(?!\d)/g,
    mask: (m) => `[REDACTED_CARD_${digitsOnly(m).slice(-4)}]`,
  },
  {
    type: 'AADHAAR',
    regex: /(?<!\d)[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}(?!\d)/g,
    mask: (m) => `[REDACTED_AADHAAR_${digitsOnly(m).slice(-4)}]`,
  },
  {
    type: 'PAN',
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    mask: (m) => `[REDACTED_PAN_${m.slice(-2)}]`,
  },
  {
    type: 'VOTER_ID',
    regex: /\b[A-Z]{3}\d{7}\b/g,
    mask: () => '[REDACTED_VOTER_ID]',
  },
  {
    type: 'PASSPORT',
    regex: /\b[A-PR-WY][1-9]\d\s?\d{4}[1-9]\b/g,
    mask: () => '[REDACTED_PASSPORT]',
  },
];

const LAYER2_RULES: MaskRule[] = [
  {
    type: 'PHONE',
    // +91 / 0 prefix optional, allows a space or hyphen after the first five digits
    regex: /(?<![\w\d])(?:\+91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g,
    mask: (m) => `[REDACTED_PHONE_${digitsOnly(m).slice(-4)}]`,
  },
  {
    type: 'EMAIL',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    mask: () => '[REDACTED_EMAIL]',
  },
  {
    type: 'UPI',
    regex: /\b[\w.-]{2,64}@(?:ok[a-z]+|ybl|ibl|axl|paytm|upi|apl|yapl|icici|sbi|hdfcbank|axisbank|kotak|barodampay|pt[a-z]+|jupiteraxis|fam|slc|wa[a-z]+|freecharge|airtel|idfcbank|indus|federal)\b/gi,
    mask: () => '[REDACTED_UPI]',
  },
  {
    type: 'IFSC',
    regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    mask: (m) => `[REDACTED_IFSC_${m.slice(0, 4)}]`,
  },
  {
    type: 'BANK_ACCOUNT',
    regex: /(?<!\d)\d{9,18}(?!\d)/g,
    mask: (m) => `[REDACTED_BANK_A/C_${m.slice(-4)}]`,
  },
];

function applyRules(text: string, rules: MaskRule[]) {
  const entities: MaskedEntity[] = [];
  let maskedText = text;
  for (const rule of rules) {
    maskedText = maskedText.replace(rule.regex, (match: string, ...args: any[]) => {
      const offset = args.find((a) => typeof a === 'number') ?? 0;
      const masked = rule.mask(match);
      entities.push({
        type: rule.type,
        originalToken: match,
        maskedToken: masked,
        position: { start: offset, end: offset + match.length },
      });
      return masked;
    });
  }
  return { maskedText, entities };
}

/** Step 3: Masking Layer 1 — identifiers with fixed statutory layouts. */
export function applyMaskingLayer1(text: string) {
  return applyRules(text, LAYER1_RULES);
}

/** Step 4: Masking Layer 2 — pre-caution sweep for contact and banking details. */
export function applyMaskingLayer2(text: string) {
  return applyRules(text, LAYER2_RULES);
}

/** Runs both layers. The original tokens are returned for audit only and must never be sent to the model. */
export function maskPII(text: string) {
  const l1 = applyMaskingLayer1(text || '');
  const l2 = applyMaskingLayer2(l1.maskedText);
  return {
    maskedText: l2.maskedText,
    layer1: l1.entities,
    layer2: l2.entities,
    count: l1.entities.length + l2.entities.length,
  };
}
