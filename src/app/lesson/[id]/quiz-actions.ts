'use server';

import { requireStudent } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { PASS_THRESHOLD } from '@/lib/course';

export type QuizResult = {
  score: number;
  passed: boolean;
  total: number;
  correct: number;
  threshold: number;
  results: Record<string, boolean>;
};

// Grades a quiz entirely on the server using the correct answers (which
// never leave the server). On a pass, the lesson is marked completed.
export async function submitQuiz(
  lessonId: string,
  answers: Record<string, number>
): Promise<QuizResult | { error: string }> {
  const { user } = await requireStudent();
  const admin = createAdminClient();

  const { data: questions } = await admin
    .from('questions')
    .select('id, correct_index')
    .eq('lesson_id', lessonId);

  if (!questions || questions.length === 0) {
    return { error: 'This lesson has no quiz.' };
  }

  const results: Record<string, boolean> = {};
  let correct = 0;
  for (const q of questions) {
    const ok = answers[q.id] === q.correct_index;
    results[q.id] = ok;
    if (ok) correct += 1;
  }

  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= PASS_THRESHOLD;

  const { data: existing } = await admin
    .from('lesson_progress')
    .select('best_score, completed')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  await admin.from('lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    best_score: Math.max(existing?.best_score ?? 0, score),
    completed: passed || Boolean(existing?.completed),
    updated_at: new Date().toISOString(),
  });

  return { score, passed, total: questions.length, correct, threshold: PASS_THRESHOLD, results };
}
