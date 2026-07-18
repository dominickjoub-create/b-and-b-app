'use server';

import { requireAdmin } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';

type UploadTarget =
  | { bucket: string; path: string; token: string }
  | { error: string };

// Issues a short-lived signed URL the browser can upload one file to.
// Admin-only: requireAdmin() redirects anyone else before a URL is minted.
export async function createVideoUploadUrl(
  lessonId: string
): Promise<UploadTarget> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: lesson, error: lessonError } = await admin
    .from('lessons')
    .select('video_path')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson?.video_path) {
    return { error: 'Lesson not found.' };
  }

  const { data, error } = await admin.storage
    .from('videos')
    .createSignedUploadUrl(lesson.video_path, { upsert: true });

  if (error || !data) return { error: error?.message ?? 'Could not start upload.' };
  return { bucket: 'videos', path: data.path, token: data.token };
}

export async function createBookUploadUrl(): Promise<UploadTarget> {
  await requireAdmin();
  const admin = createAdminClient();
  const path = process.env.BOOK_PDF_PATH ?? 'k53-study-book.pdf';

  const { data, error } = await admin.storage
    .from('materials')
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) return { error: error?.message ?? 'Could not start upload.' };
  return { bucket: 'materials', path: data.path, token: data.token };
}
