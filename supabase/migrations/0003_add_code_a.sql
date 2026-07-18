-- Add Code A (motorcycles) alongside Code 8/10/14.
-- License codes become text ('A','8','10','14') instead of integers,
-- since "A" isn't a number. Run after 0002.

-- profiles.license_code: integer -> text
alter table public.profiles
  alter column license_code type text using license_code::text;

alter table public.profiles
  drop constraint if exists profiles_license_code_check;

alter table public.profiles
  add constraint profiles_license_code_check
  check (license_code is null or license_code in ('A', '8', '10', '14'));

-- lessons.license_codes: integer[] -> text[]
alter table public.lessons
  alter column license_codes type text[] using license_codes::text[];

alter table public.lessons
  alter column license_codes set default '{A,8,10,14}';

-- New motorcycle-specific control classes (Code A only). Road-rules and
-- signs classes already apply to everyone, so Code A students get those
-- automatically. Explicit casts on the first row give every VALUES column
-- a definite type. Safe to run more than once — skips paths that exist.
insert into public.lessons (section, title, description, sort_order, video_path, license_codes)
select v.section, v.title, v.description, v.sort_order, v.video_path, v.license_codes
from (values
  ('controls'::text, 'Motorcycle pre-ride inspection (Code A)'::text, 'The full safety check every rider does before setting off.'::text, 6::int, 'controls-06-codeA.mp4'::text, array['A']::text[]),
  ('controls', 'Motorcycle controls & balance (Code A)', 'Clutch, throttle, both brakes, gears and low-speed balance.', 7, 'controls-07-codeA.mp4', array['A']),
  ('controls', 'Motorcycle yard manoeuvres (Code A)', 'The figure-of-eight, slow ride and incline test, demonstrated.', 8, 'controls-08-codeA.mp4', array['A'])
) as v(section, title, description, sort_order, video_path, license_codes)
where not exists (
  select 1 from public.lessons l where l.video_path = v.video_path
);
