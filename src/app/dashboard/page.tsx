import Link from 'next/link';
import { requirePaidUser } from '@/lib/access';

export const dynamic = 'force-dynamic';

type LessonRow = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
};

type ProgressRow = {
  lesson_id: string;
  completed: boolean;
  last_position_seconds: number;
};

export default async function DashboardPage() {
  const { supabase, user, profile } = await requirePaidUser();

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title, description, sort_order')
      .order('sort_order')
      .returns<LessonRow[]>(),
    supabase
      .from('lesson_progress')
      .select('lesson_id, completed, last_position_seconds')
      .eq('user_id', user.id)
      .returns<ProgressRow[]>(),
  ]);

  const progressByLesson = new Map(
    (progress ?? []).map((p) => [p.lesson_id, p])
  );
  const completedCount = (progress ?? []).filter((p) => p.completed).length;

  return (
    <div>
      <h1>Welcome back{profile.full_name ? `, ${profile.full_name}` : ''}</h1>
      <p className="muted">
        {completedCount} of {lessons?.length ?? 0} lessons completed ·{' '}
        <Link href="/book">Download the study book (PDF)</Link>
      </p>
      <ul className="lesson-list">
        {(lessons ?? []).map((lesson) => {
          const p = progressByLesson.get(lesson.id);
          const status = p?.completed ? '✅' : p ? '▶️' : '⬜';
          return (
            <li key={lesson.id}>
              <span className="status">{status}</span>
              <div>
                <Link href={`/lesson/${lesson.id}`} className="title">
                  {lesson.sort_order}. {lesson.title}
                </Link>
                <div className="muted">{lesson.description}</div>
              </div>
            </li>
          );
        })}
      </ul>
      {(lessons ?? []).length === 0 && (
        <p className="card">
          No lessons published yet — check back soon.
        </p>
      )}
    </div>
  );
}
