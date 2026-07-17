import { requireUser } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL_SECONDS = 60 * 10;

export default async function BookPage() {
  await requireUser();

  const admin = createAdminClient();
  const path = process.env.BOOK_PDF_PATH ?? 'k50-study-book.pdf';
  const { data: signed } = await admin.storage
    .from('materials')
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS, { download: true });

  return (
    <div>
      <h1>K50 Study Book</h1>
      <div className="card">
        <p>
          The complete study book that goes with the video lessons. It&apos;s
          yours to keep — come back to this page any time to download it
          again.
        </p>
        {signed?.signedUrl ? (
          <a href={signed.signedUrl} className="button">
            Download the book (PDF)
          </a>
        ) : (
          <p className="error">
            The book isn&apos;t available yet. Please try again later.
          </p>
        )}
        <p className="muted" style={{ marginTop: '1rem' }}>
          The download link on this page expires after 10 minutes — just
          refresh the page for a fresh one.
        </p>
      </div>
    </div>
  );
}
