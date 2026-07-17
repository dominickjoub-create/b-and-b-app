import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePaidUser } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';
import VideoPlayer from './video-player';

export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 3; // outlives any single sitting

export default async function LessonPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, user } = await requirePaidUser();

  // RLS on lessons already restricts this to paying users.
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, title, description, sort_order, video_path')
    .eq('id', params.id)
    .single();

  if (!lesson) notFound();

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
    .createSignedUrl(lesson.video_path, SIGNED_URL_TTL_SECONDS);

  return (
    <div>
      <p>
        <Link href="/dashboard">← Back to all lessons</Link>
      </p>
      <h1>
        {lesson.sort_order}. {lesson.title}
      </h1>
      <p className="muted">{lesson.description}</p>
      {signed?.signedUrl ? (
        <VideoPlayer
          lessonId={lesson.id}
          src={signed.signedUrl}
          startAt={progress?.completed ? 0 : progress?.last_position_seconds ?? 0}
        />
      ) : (
        <p className="error">
          This video isn&apos;t available yet ({signError?.message ?? 'not uploaded'}).
          Please try again later.
        </p>
      )}
    </div>
  );
}
