import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/access';
import { buildCheckoutFields, payfastConfig } from '@/lib/payfast';

export const dynamic = 'force-dynamic';

export default async function BuyPage() {
  const { profile } = await requireUser();
  if (profile.has_access || profile.is_admin) redirect('/dashboard');

  const price = Number(process.env.COURSE_PRICE_ZAR!).toFixed(2);
  const { sandbox } = payfastConfig();

  // m_payment_id ties the eventual ITN back to this checkout attempt;
  // custom_str1 carries the user id so the webhook knows who to unlock.
  const { fields, processUrl } = buildCheckoutFields({
    userId: profile.id,
    email: profile.email,
    firstName: profile.full_name?.split(' ')[0] ?? 'Student',
    mPaymentId: randomUUID(),
  });

  return (
    <div>
      <h1>Unlock the full K50 course</h1>
      <div className="card">
        <p>
          Once-off payment of <strong>R{price}</strong> unlocks every video
          lesson and the study book PDF, forever.
        </p>
        <form action={processUrl} method="post">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <button type="submit" className="button">
            Pay R{price} with PayFast
          </button>
        </form>
        {sandbox && (
          <p className="notice">
            Sandbox mode — no real money moves. Use PayFast&apos;s test
            buyer credentials on the next page.
          </p>
        )}
        <p className="muted" style={{ marginTop: '1rem' }}>
          You&apos;ll be taken to PayFast&apos;s secure payment page and
          brought straight back here afterwards. Access unlocks automatically
          once payment is confirmed.
        </p>
      </div>
    </div>
  );
}
