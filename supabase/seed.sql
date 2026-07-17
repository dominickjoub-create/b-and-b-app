-- Sample lessons for the K50 course. Edit titles/paths to match the real
-- videos you upload to the `videos` bucket, then run in the SQL editor.
insert into public.lessons (title, description, sort_order, video_path) values
  ('Welcome & how the K50 test works', 'What to expect on test day and how this course prepares you.', 1, 'lesson-01.mp4'),
  ('Rules of the road', 'Right of way, speed limits, and the rules examiners test most.', 2, 'lesson-02.mp4'),
  ('Road signs & markings', 'Every sign category you must know, with memory tricks.', 3, 'lesson-03.mp4'),
  ('Vehicle controls & pre-trip inspection', 'The full inspection sequence, step by step.', 4, 'lesson-04.mp4'),
  ('Yard test manoeuvres', 'Alley docking, parallel parking and the hill start.', 5, 'lesson-05.mp4'),
  ('Mock test & final tips', 'A complete practice run-through and common mistakes to avoid.', 6, 'lesson-06.mp4');
