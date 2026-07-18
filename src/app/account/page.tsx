import Link from 'next/link';
import { requireUser } from '@/lib/access';
import { deleteAccount } from './actions';

export const dynamic = 'force-dynamic';

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { profile } = await requireUser();

  return (
    <div>
      <h1>My account</h1>

      <div className="card">
        <h2>Your details</h2>
        <p>
          <strong>Name:</strong> {profile.full_name || '—'}
          <br />
          <strong>Email:</strong> {profile.email}
          <br />
          <strong>License code:</strong>{' '}
          {profile.license_code ? `Code ${profile.license_code}` : 'Not chosen'}{' '}
          <Link href="/choose-code">change</Link>
        </p>
      </div>

      <div className="card">
        <h2>Your data &amp; privacy</h2>
        <p className="muted">
          We store your name, email and class progress to run your course.
          See our <Link href="/privacy">privacy policy</Link> for details.
        </p>
      </div>

      <div className="card danger-card">
        <h2>Delete my account</h2>
        <p className="muted">
          This permanently removes your account, your personal details and
          your class progress. It cannot be undone.
        </p>
        {searchParams.error && (
          <p className="error">Couldn&apos;t delete your account — please try again.</p>
        )}
        <form action={deleteAccount}>
          <button type="submit" className="button danger">
            Delete my account permanently
          </button>
        </form>
      </div>
    </div>
  );
}
