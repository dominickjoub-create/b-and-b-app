import Link from 'next/link';

export default function PaymentCancelledPage() {
  return (
    <div>
      <h1>Payment cancelled</h1>
      <div className="card">
        <p>
          No money was taken. You can try again whenever you&apos;re ready.
        </p>
        <Link href="/buy" className="button">
          Back to checkout
        </Link>
      </div>
    </div>
  );
}
