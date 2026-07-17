import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LICENSE_CODES, SECTIONS } from '@/lib/course';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cta = user
    ? { href: '/dashboard', label: 'Go to my classes' }
    : { href: '/signup', label: 'Start learning free' };

  return (
    <div className="landing">
      <section className="hero">
        <p className="eyebrow">Learners Drive Academy · Brewer</p>
        <h1>
          Pass your learners test — <em>first time</em>
        </h1>
        <p className="hero-sub">
          Video classes and the full study book, built around exactly what the
          examiners test. Pick your license code and start today.
        </p>
        <div className="hero-actions">
          <Link href={cta.href} className="button large">
            {cta.label}
          </Link>
          {!user && (
            <Link href="/login" className="button ghost large">
              Log in
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="section-title">Three sections. Everything covered.</h2>
        <div className="feature-grid">
          {SECTIONS.map((s) => (
            <div key={s.key} className={`feature-card accent-${s.accent}`}>
              <span className="feature-emoji">{s.emoji}</span>
              <h3>{s.label}</h3>
              <p className="muted">{s.tagline}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Made for your license code</h2>
        <div className="feature-grid">
          {LICENSE_CODES.map((c) => (
            <div key={c.code} className="feature-card">
              <span className="code-badge">{c.name}</span>
              <h3>{c.vehicle}</h3>
              <p className="muted">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="closing-cta">
        <h2>Ready when you are</h2>
        <p className="muted">
          Track your progress class by class, and download the study book to
          revise offline.
        </p>
        <Link href={cta.href} className="button large">
          {cta.label}
        </Link>
      </section>
    </div>
  );
}
