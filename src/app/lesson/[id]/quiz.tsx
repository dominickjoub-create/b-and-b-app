'use client';

import { useState } from 'react';
import type { Question } from '@/lib/course';
import { submitQuiz, type QuizResult } from './quiz-actions';

export default function Quiz({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    const r = await submitQuiz(lessonId, answers);
    if ('error' in r) {
      setError(r.error);
    } else {
      setResult(r);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    setSubmitting(false);
  }

  function tryAgain() {
    setResult(null);
    setAnswers({});
  }

  return (
    <section className="quiz">
      <h2>Quiz</h2>
      <p className="muted">
        Answer all {questions.length} questions. You need{' '}
        {questions[0] ? '95%' : ''} to complete this class.
      </p>

      <ol className="quiz-list">
        {questions.map((q, qi) => {
          const picked = answers[q.id];
          const graded = result?.results[q.id];
          return (
            <li key={q.id} className="quiz-q">
              <p className="quiz-question">
                {qi + 1}. {q.question}
              </p>
              <div className="quiz-options">
                {q.options.map((opt, oi) => {
                  const selected = picked === oi;
                  let cls = 'quiz-option';
                  if (selected) cls += ' selected';
                  if (result && selected) cls += graded ? ' correct' : ' wrong';
                  return (
                    <label key={oi} className={cls}>
                      <input
                        type="radio"
                        name={q.id}
                        checked={selected}
                        disabled={!!result}
                        onChange={() =>
                          setAnswers((a) => ({ ...a, [q.id]: oi }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
              {result && (
                <p className={`quiz-mark ${graded ? 'ok' : 'no'}`}>
                  {graded ? '✓ Correct' : '✗ Incorrect'}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && <p className="error">{error}</p>}

      {result ? (
        <div className={`quiz-result ${result.passed ? 'pass' : 'fail'}`}>
          <p className="quiz-score">
            {result.correct}/{result.total} correct · {result.score}%
          </p>
          {result.passed ? (
            <p className="notice">🎉 Passed! This class is now complete.</p>
          ) : (
            <>
              <p className="error">
                You need {result.threshold}% to pass. Review and try again.
              </p>
              <button className="button" onClick={tryAgain}>
                Try again
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          className="button"
          disabled={!allAnswered || submitting}
          onClick={onSubmit}
        >
          {submitting ? 'Grading…' : 'Submit answers'}
        </button>
      )}
    </section>
  );
}
