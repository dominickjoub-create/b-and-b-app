import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStudent } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { SECTIONS, orderLessons, type Lesson, type Question } from '@/lib/course';
import VideoPlayer from './video-player';
import Quiz from './quiz';

export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 3; // outlives any single sitting

export default async function LessonPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, user, profile } = await requireStudent();
  const code = profile.license_code!;

  // One query serves the lesson itself plus prev/next navigation.
  const { data: lessonRows } = await supabase
    .from('lessons')
    .select('id, section, title, description, sort_order, video_path, content, license_codes')
    .contains('license_codes', [code])
    .returns<Lesson[]>();

  const lessons = orderLessons(lessonRows ?? []);
  const index = lessons.findIndex((l) => l.id === params.id);
  if (index === -1) notFound();

  const lesson = lessons[index];
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;
  const section = SECTIONS.find((s) => s.key === lesson.section);

  // Quiz questions — safe columns only (the correct answer never leaves
  // the server; grading happens in the submitQuiz action).
  const { data: questions } = await supabase
    .from('questions')
    .select('id, lesson_id, question, options, sort_order')
    .eq('lesson_id', lesson.id)
    .order('sort_order')
    .returns<Question[]>();
  const hasQuiz = (questions?.length ?? 0) > 0;

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('last_position_seconds, completed')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson.id)
    .maybeSingle();

  // Signed URL from the private bucket — access was verified above.
  const admin = createAdminClient();
  const { data: signed, error: signError } = await admin.storage
    .from('videos')
    .createSignedUrl(lesson.video_path!, SIGNED_URL_TTL_SECONDS);

  return (
    <div className="lesson-page">
      <p className="breadcrumbs">
        <Link href="/dashboard">My classes</Link>
        <span aria-hidden> / </span>
        <span className={`section-chip accent-${section?.accent}`}>
          {section?.emoji} {section?.label}
        </span>
      </p>
      <h1>{lesson.title}</h1>
      <p className="muted">{lesson.description}</p>
      {signed?.signedUrl ? (
        <VideoPlayer
          lessonId={lesson.id}
          src={signed.signedUrl}
          startAt={progress?.completed ? 0 : progress?.last_position_seconds ?? 0}
          hasQuiz={hasQuiz}
        />
      ) : (
        <p className="error">
          This video isn&apos;t available yet ({signError?.message ?? 'not uploaded'}).
          Please try again later.
        </p>
      )}

      {lesson.content?.trim() && (
        <div className="lesson-content">
          {lesson.content
            .split(/\n{2,}/)
            .map((para, i) => <p key={i}>{para}</p>)}
        </div>
      )}

      {hasQuiz && <Quiz lessonId={lesson.id} questions={questions!} />}

      <nav className="lesson-nav">
        {prev ? (
          <Link href={`/lesson/${prev.id}`} className="button ghost">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/lesson/${next.id}`} className="button">
            Next: {next.title} →
          </Link>
        ) : (
          <Link href="/dashboard" className="button">
            Back to my classes
          </Link>
        )}
      </nav>
    </div>
  );
}
