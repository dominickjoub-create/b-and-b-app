import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  amountMatches,
  confirmWithPayfast,
  payfastConfig,
  verifyItnSignature,
} from '@/lib/payfast';

// PayFast ITN webhook: payment confirmed → record it → unlock access.
// Verification layers (per PayFast docs):
//   1. signature check with passphrase
//   2. merchant id check
//   3. amount check against the course price
//   4. server-to-server postback to PayFast (VALID/INVALID)
// PayFast retries failed notifications, so non-200 responses are safe.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const { valid, data } = verifyItnSignature(rawBody);

  if (!valid) {
    console.error('ITN rejected: bad signature');
    return new NextResponse('bad signature', { status: 400 });
  }

  const cfg = payfastConfig();
  if (data.merchant_id !== cfg.merchantId) {
    console.error('ITN rejected: merchant_id mismatch');
    return new NextResponse('merchant mismatch', { status: 400 });
  }

  if (data.payment_status === 'COMPLETE' && !amountMatches(data.amount_gross)) {
    console.error('ITN rejected: amount mismatch', data.amount_gross);
    return new NextResponse('amount mismatch', { status: 400 });
  }

  const confirmed = await confirmWithPayfast(rawBody);
  if (!confirmed) {
    console.error('ITN rejected: PayFast postback said INVALID');
    return new NextResponse('not confirmed', { status: 400 });
  }

  const userId = data.custom_str1;
  const admin = createAdminClient();

  const { error: paymentError } = await admin.from('payments').upsert(
    {
      user_id: userId || null,
      m_payment_id: data.m_payment_id,
      pf_payment_id: data.pf_payment_id ?? null,
      amount_gross: data.amount_gross ? Number(data.amount_gross) : null,
      amount_fee: data.amount_fee ? Number(data.amount_fee) : null,
      amount_net: data.amount_net ? Number(data.amount_net) : null,
      status: data.payment_status ?? 'UNKNOWN',
      raw: data,
    },
    { onConflict: 'm_payment_id' }
  );

  if (paymentError) {
    console.error('ITN: failed to record payment', paymentError);
    // 500 → PayFast retries later, so the payment isn't lost.
    return new NextResponse('db error', { status: 500 });
  }

  if (data.payment_status === 'COMPLETE' && userId) {
    const { error: accessError } = await admin
      .from('profiles')
      .update({ has_access: true })
      .eq('id', userId);
    if (accessError) {
      console.error('ITN: failed to grant access', accessError);
      return new NextResponse('db error', { status: 500 });
    }
  }

  return new NextResponse('ok', { status: 200 });
}
