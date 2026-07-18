-- Sample lessons for the three course sections, tagged with the license
-- codes they apply to. Edit titles/paths to match the real videos you
-- upload to the `videos` bucket, then run in the SQL editor.
-- (If you ran the old seed first: truncate public.lessons cascade;)

insert into public.lessons (section, title, description, sort_order, video_path, license_codes) values
  -- Road Rules
  ('road_rules', 'How the learners test works', 'What to expect on test day, how scoring works, and how to use this course.', 1, 'road-rules-01.mp4', '{8,10,14}'),
  ('road_rules', 'Right of way & intersections', 'Four-way stops, traffic circles, and who goes first — the rules examiners love.', 2, 'road-rules-02.mp4', '{8,10,14}'),
  ('road_rules', 'Speed limits & following distance', 'General limits, vehicle-specific limits, and safe following distances.', 3, 'road-rules-03.mp4', '{8,10,14}'),
  ('road_rules', 'Overtaking, parking & penalties', 'Where you may and may not overtake or park, and what it costs you.', 4, 'road-rules-04.mp4', '{8,10,14}'),

  -- Signs
  ('signs', 'Regulatory signs', 'The red-and-blue circle signs that command — stop, yield, no entry and friends.', 1, 'signs-01.mp4', '{8,10,14}'),
  ('signs', 'Warning signs', 'Triangles that warn of what''s ahead, with memory tricks to tell them apart.', 2, 'signs-02.mp4', '{8,10,14}'),
  ('signs', 'Guidance signs & road markings', 'Green boards, painted lines and arrows — reading the road itself.', 3, 'signs-03.mp4', '{8,10,14}'),
  ('signs', 'Traffic signals & officers', 'Robots, flashing signals, and what to do when an officer overrides them all.', 4, 'signs-04.mp4', '{8,10,14}'),

  -- Controls
  ('controls', 'Cockpit drill & pre-trip inspection', 'The full inspection sequence every code must know, step by step.', 1, 'controls-01.mp4', '{8,10,14}'),
  ('controls', 'Light vehicle controls (Code 8)', 'Clutch, brakes, steering and mirrors in a light motor vehicle.', 2, 'controls-02-code8.mp4', '{8}'),
  ('controls', 'Heavy vehicle controls (Code 10)', 'Air brakes, gear splitting and handling a heavy rigid vehicle.', 3, 'controls-03-code10.mp4', '{10}'),
  ('controls', 'Articulated combinations (Code 14)', 'Coupling, uncoupling and controlling an articulated combination.', 4, 'controls-04-code14.mp4', '{14}'),
  ('controls', 'Yard test manoeuvres', 'Alley docking, parallel parking and the hill start, demonstrated.', 5, 'controls-05.mp4', '{8,10,14}'),

  -- Controls — Motorcycle (Code A)
  ('controls', 'Motorcycle pre-ride inspection (Code A)', 'The full safety check every rider does before setting off.', 6, 'controls-06-codeA.mp4', '{A}'),
  ('controls', 'Motorcycle controls & balance (Code A)', 'Clutch, throttle, both brakes, gears and low-speed balance.', 7, 'controls-07-codeA.mp4', '{A}'),
  ('controls', 'Motorcycle yard manoeuvres (Code A)', 'The figure-of-eight, slow ride and incline test, demonstrated.', 8, 'controls-08-codeA.mp4', '{A}');
