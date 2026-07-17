import Link from 'next/link';
import { requireUser } from '@/lib/access';

export const dynamic = 'force-dynamic';

// PayFast checkout is parked for now — the full integration (signed
// checkout form + verified ITN webhook in src/lib/payfast.ts and
// src/app/api/payfast/itn) is built and ready to wire back in.
export default async function BuyPage() {
  await requireUser();

  return (
    <div>
      <h1>Payments coming soon</h1>
      <div className="card">
        <p>
          While we&apos;re getting set up, all classes are free for signed-in
          students. Enjoy!
        </p>
        <Link href="/dashboard" className="button">
          Go to my classes
        </Link>
      </div>
    </div>
  );
}
