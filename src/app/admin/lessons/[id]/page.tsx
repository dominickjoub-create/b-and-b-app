import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { PASS_THRESHOLD } from '@/lib/course';
import { addQuestion, deleteQuestion, updateLessonContent } from './actions';

export const dynamic = 'force-dynamic';

type QuestionRow = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  sort_order: number;
};

export default async function AdminLessonPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const admin = createAdminClient();

  // Core columns first so a missing `content` column (0004 not run yet)
  // can't 404 this page; content is fetched separately and gracefully.
  const { data: lesson } = await admin
    .from('lessons')
    .select('id, title')
    .eq('id', params.id)
    .single();

  if (!lesson) notFound();

  const { data: contentRow } = await admin
    .from('lessons')
    .select('content')
    .eq('id', params.id)
    .maybeSingle();
  const lessonContent = (contentRow as { content?: string } | null)?.content ?? '';

  const { data: questions } = await admin
    .from('questions')
    .select('id, question, options, correct_index, sort_order')
    .eq('lesson_id', lesson.id)
    .order('sort_order')
    .returns<QuestionRow[]>();

  return (
    <div>
      <p className="breadcrumbs">
        <Link href="/admin/content">Upload content</Link>
        <span aria-hidden> / </span>
        <span>{lesson.title}</span>
      </p>
      <h1>{lesson.title}</h1>

      {/* Lesson text */}
      <div className="card">
        <h2>Lesson text</h2>
        <p className="muted">
          Shown alongside the video. Leave a blank line between paragraphs.
        </p>
        <form action={updateLessonContent.bind(null, lesson.id)}>
          <textarea
            name="content"
            rows={6}
            defaultValue={lessonContent}
            className="admin-textarea"
            placeholder="Type the notes for this class…"
          />
          <button type="submit" className="button">
            Save text
          </button>
        </form>
      </div>

      {/* Existing questions */}
      <div className="card">
        <h2>Quiz questions ({questions?.length ?? 0})</h2>
        <p className="muted">
          Students need {PASS_THRESHOLD}% to complete a class that has
          questions. Add as many as you like, any time.
        </p>
        {(questions ?? []).length === 0 && (
          <p className="muted">No questions yet.</p>
        )}
        <ol className="admin-q-list">
          {(questions ?? []).map((q) => (
            <li key={q.id}>
              <div>
                <p className="quiz-question">{q.question}</p>
                <ul className="admin-q-options">
                  {q.options.map((opt, i) => (
                    <li key={i} className={i === q.correct_index ? 'is-correct' : ''}>
                      {i === q.correct_index ? '✓ ' : ''}
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
              <form action={deleteQuestion.bind(null, lesson.id, q.id)}>
                <button type="submit" className="button ghost small">
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ol>
      </div>

      {/* Add a question */}
      <div className="card">
        <h2>Add a question</h2>
        <form action={addQuestion.bind(null, lesson.id)} className="add-q-form">
          <label>
            Question
            <input name="question" type="text" required />
          </label>
          <p className="muted">
            Fill the answer options and select the correct one. Leave unused
            options blank.
          </p>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="opt-row">
              <input
                type="radio"
                name="correct"
                value={i}
                defaultChecked={i === 0}
                aria-label={`Mark option ${i + 1} correct`}
              />
              <input
                name={`option_${i}`}
                type="text"
                placeholder={`Option ${i + 1}`}
                required={i < 2}
              />
            </div>
          ))}
          <button type="submit" className="button">
            Add question
          </button>
        </form>
      </div>
    </div>
  );
}
