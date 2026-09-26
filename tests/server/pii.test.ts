import { describe, expect, it } from 'vitest';
import { applyMaskingLayer1, applyMaskingLayer2, maskPII } from '../../src/server/pii';

describe('maskPII', () => {
  it.each([
    ['Aadhaar with spaces', 'Aadhaar 2345 6789 0123', '[REDACTED_AADHAAR_0123]', '2345 6789 0123'],
    ['Aadhaar without spaces', 'UID 234567890123 on file', '[REDACTED_AADHAAR_0123]', '234567890123'],
    ['PAN', 'PAN: ABCDE1234F', '[REDACTED_PAN_4F]', 'ABCDE1234F'],
    ['mobile with +91 and space', 'Call +91 98220 12345 today', '[REDACTED_PHONE_2345]', '98220 12345'],
    ['plain 10-digit mobile', 'Phone 9876543210.', '[REDACTED_PHONE_3210]', '9876543210'],
    ['email', 'Mail rajesh.verma@example.co.in now', '[REDACTED_EMAIL]', 'rajesh.verma@example.co.in'],
    ['UPI ID', 'Pay to rajesh@okaxis', '[REDACTED_UPI]', 'rajesh@okaxis'],
    ['IFSC', 'IFSC SBIN0001234', '[REDACTED_IFSC_SBIN]', 'SBIN0001234'],
    ['bank account', 'A/c 10293847561 at SBI', '[REDACTED_BANK_A/C_7561]', '10293847561'],
    ['card number', 'Card 4111 1111 1111 1111', '[REDACTED_CARD_1111]', '4111 1111 1111 1111'],
    ['voter ID', 'EPIC ABC1234567', '[REDACTED_VOTER_ID]', 'ABC1234567'],
  ])('masks %s', (_label, input, token, original) => {
    const { maskedText, count } = maskPII(input);
    expect(maskedText).toContain(token);
    expect(maskedText).not.toContain(original);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('does not treat a 12-digit Aadhaar inside a card number as Aadhaar', () => {
    const { layer1 } = maskPII('4111 1111 1111 1111');
    expect(layer1.map((e) => e.type)).toEqual(['CARD']);
  });

  it('leaves ordinary legal text, amounts, dates and clause numbers alone', () => {
    const text = 'Clause 4: The Purchaser shall pay ₹ 86,00,000 on 18/09/2026 for Flat 402, Pune 411006.';
    const { maskedText, count } = maskPII(text);
    expect(maskedText).toBe(text);
    expect(count).toBe(0);
  });

  it('reports what each layer found', () => {
    const l1 = applyMaskingLayer1('PAN ABCDE1234F, Aadhaar 2345 6789 0123');
    const l2 = applyMaskingLayer2('Email a@b.com, phone 9876543210');
    expect(l1.entities.map((e) => e.type).sort()).toEqual(['AADHAAR', 'PAN']);
    expect(l2.entities.map((e) => e.type).sort()).toEqual(['EMAIL', 'PHONE']);
  });

  it('handles empty input', () => {
    expect(maskPII('')).toMatchObject({ maskedText: '', count: 0 });
  });
});
