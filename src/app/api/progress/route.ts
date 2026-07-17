import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Upserts the caller's own progress row. The user-scoped client means
// RLS guarantees nobody can write progress for another user.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: { lessonId?: string; position?: number; completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { lessonId, position, completed } = body;
  if (typeof lessonId !== 'string' || typeof position !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Never un-complete a lesson from a routine position save.
  const { data: existing } = await supabase
    .from('lesson_progress')
    .select('completed')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  const { error } = await supabase.from('lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    last_position_seconds: Math.max(0, Math.floor(position)),
    completed: Boolean(completed) || Boolean(existing?.completed),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
