import 'server-only';
import { createHash } from 'crypto';

// PayFast integration — signature generation for checkout and full
// ITN (Instant Transaction Notification) verification.
// Docs: https://developers.payfast.co.za/docs

export function payfastConfig() {
  const sandbox = process.env.PAYFAST_MODE !== 'live';
  return {
    sandbox,
    merchantId: process.env.PAYFAST_MERCHANT_ID!,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
    passphrase: process.env.PAYFAST_PASSPHRASE ?? '',
    processUrl: sandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process',
    validateUrl: sandbox
      ? 'https://sandbox.payfast.co.za/eng/query/validate'
      : 'https://www.payfast.co.za/eng/query/validate',
  };
}

// PayFast expects PHP-style urlencoding: spaces as '+', uppercase hex.
function pfEncode(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, '+')
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase());
}

function md5ParamString(
  entries: [string, string][],
  passphrase: string
): string {
  const parts = entries
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${pfEncode(v)}`);
  if (passphrase !== '') {
    parts.push(`passphrase=${pfEncode(passphrase)}`);
  }
  return createHash('md5').update(parts.join('&')).digest('hex');
}

// Field order matters: the signature must be generated over the fields
// in the exact order PayFast documents them for the payment form.
const CHECKOUT_FIELD_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'name_first',
  'email_address',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_str1',
] as const;

export type CheckoutFields = Record<string, string>;

export function buildCheckoutFields(input: {
  userId: string;
  email: string;
  firstName: string;
  mPaymentId: string;
}): { fields: CheckoutFields; processUrl: string } {
  const cfg = payfastConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!; // includes /app
  const amount = Number(process.env.COURSE_PRICE_ZAR!).toFixed(2);

  const raw: CheckoutFields = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: `${siteUrl}/payment/success`,
    cancel_url: `${siteUrl}/payment/cancelled`,
    notify_url: `${siteUrl}/api/payfast/itn`,
    name_first: input.firstName,
    email_address: input.email,
    m_payment_id: input.mPaymentId,
    amount,
    item_name: 'K50 Learners Course',
    item_description: 'Learners Drive Academy — full K50 online course',
    custom_str1: input.userId,
  };

  const ordered: [string, string][] = CHECKOUT_FIELD_ORDER.map((k) => [
    k,
    raw[k] ?? '',
  ]);
  const signature = md5ParamString(ordered, cfg.passphrase);

  return { fields: { ...raw, signature }, processUrl: cfg.processUrl };
}

// --- ITN verification ------------------------------------------------

// 1. Signature check: rebuild the param string from the POST body in the
//    order received (everything except `signature`), append passphrase.
export function verifyItnSignature(rawBody: string): {
  valid: boolean;
  data: Record<string, string>;
} {
  const cfg = payfastConfig();
  const entries: [string, string][] = [];
  const data: Record<string, string> = {};
  let receivedSignature = '';

  for (const pair of rawBody.split('&')) {
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const key = decodeURIComponent(pair.slice(0, eq));
    const value = decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '));
    data[key] = value;
    if (key === 'signature') {
      receivedSignature = value;
    } else {
      entries.push([key, value]);
    }
  }

  const expected = md5ParamString(entries, cfg.passphrase);
  return { valid: expected === receivedSignature, data };
}

// 2. Server confirmation: post the exact payload back to PayFast, which
//    answers VALID/INVALID. Defeats spoofed notifications.
export async function confirmWithPayfast(rawBody: string): Promise<boolean> {
  const cfg = payfastConfig();
  const withoutSignature = rawBody
    .split('&')
    .filter((p) => !p.startsWith('signature='))
    .join('&');

  const res = await fetch(cfg.validateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: withoutSignature,
  });
  const text = await res.text();
  return text.trim().startsWith('VALID');
}

// 3. Amount check: the notified gross must match the course price.
export function amountMatches(amountGross: string | undefined): boolean {
  const expected = Number(process.env.COURSE_PRICE_ZAR!);
  const received = Number(amountGross);
  return Number.isFinite(received) && Math.abs(received - expected) < 0.01;
}
