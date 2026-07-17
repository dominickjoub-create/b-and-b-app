import Link from 'next/link';
import { requireStudent } from '@/lib/access';
import { LICENSE_CODES, SECTIONS, orderLessons, type Lesson } from '@/lib/course';

export const dynamic = 'force-dynamic';

type ProgressRow = {
  lesson_id: string;
  completed: boolean;
  last_position_seconds: number;
};

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireStudent();
  const code = profile.license_code!;
  const codeMeta = LICENSE_CODES.find((c) => c.code === code);

  const [{ data: lessonRows }, { data: progress }] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, section, title, description, sort_order, license_codes')
      .contains('license_codes', [code])
      .returns<Lesson[]>(),
    supabase
      .from('lesson_progress')
      .select('lesson_id, completed, last_position_seconds')
      .eq('user_id', user.id)
      .returns<ProgressRow[]>(),
  ]);

  const lessons = orderLessons(lessonRows ?? []);
  const progressByLesson = new Map(
    (progress ?? []).map((p) => [p.lesson_id, p])
  );
  const completed = (id: string) => progressByLesson.get(id)?.completed ?? false;

  const totalDone = lessons.filter((l) => completed(l.id)).length;
  const pct = lessons.length ? Math.round((totalDone / lessons.length) * 100) : 0;

  // "Continue" = first lesson that isn't completed yet.
  const nextLesson = lessons.find((l) => !completed(l.id));

  const firstName = profile.full_name?.split(' ')[0];

  return (
    <div>
      <section className="dash-hero">
        <div>
          <p className="eyebrow">
            {codeMeta?.name} · {codeMeta?.vehicle}{' '}
            <Link href="/choose-code" className="switch-link">
              switch
            </Link>
          </p>
          <h1>{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}</h1>
          <div className="progress-line">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-label">
              {totalDone}/{lessons.length} classes · {pct}%
            </span>
          </div>
        </div>
        {nextLesson && (
          <Link href={`/lesson/${nextLesson.id}`} className="button">
            {totalDone === 0 ? 'Start your first class' : 'Continue learning'} →
          </Link>
        )}
      </section>

      {SECTIONS.map((section) => {
        const sectionLessons = lessons.filter((l) => l.section === section.key);
        if (sectionLessons.length === 0) return null;
        const done = sectionLessons.filter((l) => completed(l.id)).length;

        return (
          <section key={section.key} className={`section-block accent-${section.accent}`}>
            <header className="section-header">
              <span className="section-emoji">{section.emoji}</span>
              <div>
                <h2>{section.label}</h2>
                <p className="muted">{section.tagline}</p>
              </div>
              <span className="section-count">
                {done}/{sectionLessons.length}
              </span>
            </header>
            <ol className="lesson-list">
              {sectionLessons.map((lesson) => {
                const p = progressByLesson.get(lesson.id);
                const state = p?.completed
                  ? 'done'
                  : p
                    ? 'started'
                    : 'todo';
                return (
                  <li key={lesson.id}>
                    <Link href={`/lesson/${lesson.id}`} className={`lesson-row ${state}`}>
                      <span className="status" aria-hidden>
                        {state === 'done' ? '✓' : state === 'started' ? '▶' : lesson.sort_order}
                      </span>
                      <span className="lesson-text">
                        <span className="title">{lesson.title}</span>
                        <span className="muted">{lesson.description}</span>
                      </span>
                      <span className="chevron" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {lessons.length === 0 && (
        <p className="card">No classes published yet — check back soon.</p>
      )}

      <section className="book-banner">
        <div>
          <h2>📘 K50 Study Book</h2>
          <p className="muted">
            The full book as a PDF — download it and study offline.
          </p>
        </div>
        <Link href="/book" className="button ghost">
          Get the book
        </Link>
      </section>
    </div>
  );
}
