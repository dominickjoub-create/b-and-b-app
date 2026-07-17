import { requireUser } from '@/lib/access';
import { LICENSE_CODES } from '@/lib/course';
import { chooseCode } from './actions';

export const dynamic = 'force-dynamic';

export default async function ChooseCodePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { profile } = await requireUser();

  return (
    <div className="choose-code">
      <p className="eyebrow">Your course</p>
      <h1>Which license are you going for?</h1>
      <p className="muted">
        Road rules and signs are the same for everyone — your choice tailors
        the vehicle-controls classes. You can switch any time.
      </p>
      {searchParams.error && (
        <p className="error">Couldn&apos;t save your choice — try again.</p>
      )}
      <div className="code-grid">
        {LICENSE_CODES.map((c) => (
          <form action={chooseCode} key={c.code}>
            <input type="hidden" name="code" value={c.code} />
            <button
              type="submit"
              className={`code-card${profile.license_code === c.code ? ' selected' : ''}`}
            >
              <span className="code-badge">{c.name}</span>
              <span className="code-vehicle">{c.vehicle}</span>
              <span className="code-detail">{c.detail}</span>
              {profile.license_code === c.code && (
                <span className="code-current">Current choice</span>
              )}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
