import 'server-only';

// Fixed-window in-memory rate limiter for login/signup attempts.
// Per serverless instance, so it's a first line of defence on top of
// Supabase Auth's own server-side rate limits (which are per-project
// and always apply). Swap for Upstash Redis if stronger cross-instance
// guarantees are ever needed.

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterMinutes: number;
} {
  const now = Date.now();
  const w = windows.get(key);

  if (!w || now > w.resetAt) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMinutes: 0 };
  }

  w.count += 1;
  if (w.count > MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterMinutes: Math.ceil((w.resetAt - now) / 60_000),
    };
  }
  return { allowed: true, retryAfterMinutes: 0 };
}

// Successful logins clear the window so users aren't locked out by
// their own earlier typos.
export function clearRateLimit(key: string) {
  windows.delete(key);
}
