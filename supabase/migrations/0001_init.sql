-- B&B Driving Academy — K53 course app schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.

-- ============================================================
-- Profiles: one row per auth user. has_access is flipped by the
-- PayFast ITN webhook (service role) when a payment completes.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  has_access boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- No user-facing update policy: has_access / is_admin are only ever
-- changed server-side with the service role, which bypasses RLS.

-- Auto-create a profile when a user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Lessons: single hard-coded K53 course, so no courses table.
-- video_path points at an object in the private `videos` bucket.
-- ============================================================
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  sort_order integer not null,
  video_path text not null,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

-- Only paying students (or admins) can even list the lessons.
create policy "Paid users can view lessons"
  on public.lessons for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.has_access or p.is_admin)
    )
  );

-- ============================================================
-- Payments: written exclusively by the ITN webhook (service role),
-- readable by the owner. Status mirrors PayFast payment_status.
-- ============================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  m_payment_id text not null unique,
  pf_payment_id text,
  amount_gross numeric(10, 2),
  amount_fee numeric(10, 2),
  amount_net numeric(10, 2),
  status text not null,
  raw jsonb,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- ============================================================
-- Lesson progress: one row per user per lesson, upserted by the
-- player. Powers "resume where you left off" + admin analytics.
-- ============================================================
create table public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  last_position_seconds integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Users can view own progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Private storage buckets. Files are served via short-lived
-- signed URLs generated server-side with the service role, so
-- no storage RLS policies are needed — nothing is public.
--   videos/    → lesson videos (mp4), paths match lessons.video_path
--   materials/ → the course book PDF
-- ============================================================
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false), ('materials', 'materials', false)
on conflict (id) do nothing;
