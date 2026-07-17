import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const price = Number(process.env.COURSE_PRICE_ZAR ?? 0).toFixed(2);

  return (
    <div>
      <h1>Pass your K50 learners test — first time</h1>
      <p>
        The complete online course from Learners Drive Academy in Brewer: video
        lessons covering everything the examiners test, plus the full study
        book as a downloadable PDF.
      </p>
      <div className="card">
        <h2>What you get</h2>
        <ul>
          <li>Video lessons — rules of the road, signs, controls and manoeuvres</li>
          <li>The complete K50 study book (PDF, yours to keep)</li>
          <li>Progress tracking — pick up exactly where you left off</li>
          <li>Once-off payment of <strong>R{price}</strong> — no subscription</li>
        </ul>
        {user ? (
          <Link href="/dashboard" className="button">
            Go to my course
          </Link>
        ) : (
          <Link href="/signup" className="button">
            Get started
          </Link>
        )}
      </div>
      <p className="muted">
        Secure payment via PayFast. Already signed up?{' '}
        <Link href="/login">Log in</Link>.
      </p>
    </div>
  );
}
