'use client';

import { useCallback, useEffect, useRef } from 'react';

const SAVE_INTERVAL_MS = 10_000;
// Watching to within the last 30 seconds counts as completing the lesson.
const COMPLETE_THRESHOLD_SECONDS = 30;

export default function VideoPlayer({
  lessonId,
  src,
  startAt,
}: {
  lessonId: string;
  src: string;
  startAt: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedAt = useRef(0);

  const save = useCallback(
    (position: number, completed: boolean) => {
      // sendBeacon-style fire-and-forget; progress loss is harmless.
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? '/app'}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          position: Math.floor(position),
          completed,
        }),
        keepalive: true,
      }).catch(() => {});
    },
    [lessonId]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      if (startAt > 0 && startAt < video.duration - 5) {
        video.currentTime = startAt;
      }
    };

    const onTimeUpdate = () => {
      const now = Date.now();
      if (now - lastSavedAt.current < SAVE_INTERVAL_MS) return;
      lastSavedAt.current = now;
      const nearEnd =
        video.duration > 0 &&
        video.duration - video.currentTime < COMPLETE_THRESHOLD_SECONDS;
      save(video.currentTime, nearEnd);
    };

    const onEnded = () => save(video.duration, true);
    const onPause = () => save(video.currentTime, false);

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('pause', onPause);
    };
  }, [save, startAt]);

  return (
    <video
      ref={videoRef}
      className="video-frame"
      src={src}
      controls
      controlsList="nodownload"
      playsInline
    />
  );
}
