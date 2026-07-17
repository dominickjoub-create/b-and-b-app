import Link from 'next/link';
import { requireUser } from '@/lib/access';

export const dynamic = 'force-dynamic';

export default async function PaymentSuccessPage() {
  const { profile } = await requireUser();

  return (
    <div>
      <h1>Thank you!</h1>
      {profile.has_access ? (
        <div className="card">
          <p className="notice">
            Payment confirmed — your course is unlocked. 🎉
          </p>
          <Link href="/dashboard" className="button">
            Start learning
          </Link>
        </div>
      ) : (
        <div className="card">
          <p>
            Your payment is being confirmed by PayFast. This usually takes a
            few seconds — refresh this page in a moment.
          </p>
          <Link href="/payment/success" className="button">
            Refresh
          </Link>
          <p className="muted" style={{ marginTop: '1rem' }}>
            Still locked after a few minutes? Email us at{' '}
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@learnersdrive.co.za'}{' '}
            and we&apos;ll sort it out.
          </p>
        </div>
      )}
    </div>
  );
}
