'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updateLessonContent(lessonId: string, formData: FormData) {
  await requireAdmin();
  const content = String(formData.get('content') ?? '');
  const admin = createAdminClient();
  await admin.from('lessons').update({ content }).eq('id', lessonId);
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function addQuestion(lessonId: string, formData: FormData) {
  await requireAdmin();

  const question = String(formData.get('question') ?? '').trim();
  const raw = [0, 1, 2, 3].map((i) =>
    String(formData.get(`option_${i}`) ?? '').trim()
  );
  const correctRaw = Number(formData.get('correct') ?? 0);

  const options = raw.filter(Boolean);
  if (!question || options.length < 2) return; // ignore incomplete

  // Map the "correct" choice to its position after empty options dropped.
  const correctValue = raw[correctRaw];
  const correctIndex = Math.max(0, options.indexOf(correctValue));

  const admin = createAdminClient();
  const { data: last } = await admin
    .from('questions')
    .select('sort_order')
    .eq('lesson_id', lessonId)
    .order('sort_order', { ascending: false })
    .limit(1);
  const sortOrder = (last?.[0]?.sort_order ?? 0) + 1;

  await admin.from('questions').insert({
    lesson_id: lessonId,
    question,
    options,
    correct_index: correctIndex,
    sort_order: sortOrder,
  });
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function deleteQuestion(
  lessonId: string,
  questionId: string,
  _formData: FormData
) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from('questions').delete().eq('id', questionId);
  revalidatePath(`/admin/lessons/${lessonId}`);
}
