'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SECTIONS, type Lesson } from '@/lib/course';
import { createBookUploadUrl, createVideoUploadUrl } from './actions';

type Status = { state: 'idle' | 'uploading' | 'done' | 'error'; message?: string };

export default function Uploader({ lessons }: { lessons: Lesson[] }) {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [bookStatus, setBookStatus] = useState<Status>({ state: 'idle' });

  function setStatus(key: string, s: Status) {
    setStatuses((prev) => ({ ...prev, [key]: s }));
  }

  async function uploadTo(
    target: { bucket: string; path: string; token: string } | { error: string },
    file: File,
    onStatus: (s: Status) => void
  ) {
    if ('error' in target) {
      onStatus({ state: 'error', message: target.error });
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(target.bucket)
      .uploadToSignedUrl(target.path, target.token, file);
    if (error) {
      onStatus({ state: 'error', message: error.message });
    } else {
      onStatus({ state: 'done', message: `Uploaded ${file.name}` });
    }
  }

  async function onVideoPick(lesson: Lesson, file: File | undefined) {
    if (!file) return;
    setStatus(lesson.id, { state: 'uploading', message: `Uploading ${file.name}…` });
    const target = await createVideoUploadUrl(lesson.id);
    await uploadTo(target, file, (s) => setStatus(lesson.id, s));
  }

  async function onBookPick(file: File | undefined) {
    if (!file) return;
    setBookStatus({ state: 'uploading', message: `Uploading ${file.name}…` });
    const target = await createBookUploadUrl();
    await uploadTo(target, file, setBookStatus);
  }

  const statusText = (s?: Status) => {
    if (!s || s.state === 'idle') return null;
    const cls =
      s.state === 'done' ? 'up-ok' : s.state === 'error' ? 'up-err' : 'up-busy';
    return <span className={`up-status ${cls}`}>{s.message}</span>;
  };

  return (
    <div>
      <div className="card book-upload">
        <div>
          <h2>📘 Study book (PDF)</h2>
          <p className="muted">Upload or replace the K53 study book.</p>
          {statusText(bookStatus)}
        </div>
        <label className="button ghost">
          Choose PDF
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => onBookPick(e.target.files?.[0])}
          />
        </label>
      </div>

      {SECTIONS.map((section) => {
        const sectionLessons = lessons.filter((l) => l.section === section.key);
        if (sectionLessons.length === 0) return null;
        return (
          <div key={section.key} className={`section-block accent-${section.accent}`}>
            <header className="section-header">
              <span className="section-emoji">{section.emoji}</span>
              <h2>{section.label}</h2>
            </header>
            <ul className="upload-list">
              {sectionLessons.map((lesson) => {
                const s = statuses[lesson.id];
                return (
                  <li key={lesson.id}>
                    <div className="up-info">
                      <span className="title">{lesson.title}</span>
                      <span className="muted code-tags">
                        Code {lesson.license_codes.join(', ')} ·{' '}
                        <code>{lesson.video_path}</code>
                      </span>
                      {statusText(s)}
                    </div>
                    <label className="button ghost small">
                      {s?.state === 'uploading' ? 'Uploading…' : 'Upload video'}
                      <input
                        type="file"
                        accept="video/mp4,video/*"
                        hidden
                        disabled={s?.state === 'uploading'}
                        onChange={(e) => onVideoPick(lesson, e.target.files?.[0])}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
