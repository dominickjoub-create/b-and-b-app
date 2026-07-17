-- Restructure the course into three sections (Road Rules, Signs, Controls)
-- and add license-code selection (Code 8 / 10 / 14). Run after 0001.

-- Every lesson belongs to one section and applies to one or more codes.
alter table public.lessons
  add column section text not null default 'road_rules'
    check (section in ('road_rules', 'signs', 'controls')),
  add column license_codes integer[] not null default '{8,10,14}';

-- The code a student is studying for. Chosen once after signup,
-- changeable any time from the dashboard.
alter table public.profiles
  add column license_code integer check (license_code in (8, 10, 14));

-- Students may update their own row, but ONLY the columns granted below —
-- has_access / is_admin stay service-role-only via column privileges.
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke update on public.profiles from authenticated, anon;
grant update (full_name, license_code) on public.profiles to authenticated;

-- PayFast is parked for now: classes are open to any signed-in student.
-- When payments go live, restore the paid-users-only policy from 0001.
drop policy "Paid users can view lessons" on public.lessons;

create policy "Signed-in users can view lessons"
  on public.lessons for select
  using (auth.uid() is not null);
