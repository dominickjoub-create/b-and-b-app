import Link from 'next/link';
import { requireAdmin } from '@/lib/access';
import { orderLessons, type Lesson } from '@/lib/course';
import Uploader from './uploader';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const { supabase } = await requireAdmin();

  const { data: lessonRows } = await supabase
    .from('lessons')
    .select('id, section, title, description, sort_order, video_path, license_codes')
    .returns<Lesson[]>();

  const lessons = orderLessons(lessonRows ?? []);

  return (
    <div>
      <p className="breadcrumbs">
        <Link href="/admin">Admin</Link>
        <span aria-hidden> / </span>
        <span>Upload content</span>
      </p>
      <h1>Upload class videos &amp; the book</h1>
      <p className="muted">
        Files upload straight to storage from your browser — big videos won&apos;t
        time out. Uploading over an existing file replaces it. Students see the
        change immediately, no redeploy needed.
      </p>
      <Uploader lessons={lessons} />
    </div>
  );
}
