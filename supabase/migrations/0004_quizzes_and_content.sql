-- Lesson text + per-lesson quizzes. Run after 0003.

-- Text shown alongside the video on each lesson.
alter table public.lessons add column if not exists content text not null default '';

-- Multiple-choice quiz questions, attached to a lesson. Admins add these
-- any time via the admin panel; students must score the pass threshold
-- (95%) to complete a lesson that has questions.
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_index integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

drop policy if exists "Signed-in users can view questions" on public.questions;
create policy "Signed-in users can view questions"
  on public.questions for select
  using (auth.uid() is not null);

-- Never expose correct_index to the browser — grading is server-side only.
revoke select on public.questions from authenticated, anon;
grant select (id, lesson_id, question, options, sort_order)
  on public.questions to authenticated;

-- Best quiz score per student per lesson (0-100).
alter table public.lesson_progress add column if not exists best_score integer;
