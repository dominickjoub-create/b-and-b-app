# Learners Drive Academy — K50 Course App

Online K50 learners-test prep course: video lessons, a downloadable study
book (PDF), secure login, and once-off payment via PayFast.

**Stack:** Next.js 14 (App Router) · Supabase (auth + Postgres + storage) ·
PayFast (payments) · Vercel (hosting at `learnersdrive.co.za/app`).

## How it works

- Students sign up with email + password (Supabase Auth; passwords are
  bcrypt-hashed and salted by Supabase automatically).
- Paying via PayFast fires an ITN webhook to `/api/payfast/itn`, which
  verifies the notification (signature, merchant ID, amount, and a
  server-to-server confirmation with PayFast) and then unlocks the course.
- Videos and the PDF live in **private** Supabase Storage buckets and are
  served through short-lived signed URLs — only after the server checks
  the student has paid. Nothing is publicly reachable.
- The player saves per-lesson progress every ~10 seconds ("resume where
  you left off"), which also powers the admin engagement report.
- `/admin` is a read-only sales dashboard (total sales, revenue this
  month, students, recent transactions, who watched what) for accounts
  with `is_admin = true`. Refunds are done in PayFast's own dashboard.

Login hardening: rate limiting on login/signup attempts (5 per 15 min per
IP+email) on top of Supabase Auth's own server-side rate limits, generic
error messages that don't reveal whether an email exists, and an
open-redirect-safe `next` parameter.

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. In the **SQL Editor**, run `supabase/migrations/0001_init.sql`, then
   `supabase/seed.sql` (edit the lesson titles/paths first if you like).
3. In **Storage**, you'll see two private buckets created by the migration:
   - `videos` — upload lesson videos (mp4). File names must match each
     lesson's `video_path` (e.g. `lesson-01.mp4`).
   - `materials` — upload the study book PDF as `k50-study-book.pdf`
     (or change `BOOK_PDF_PATH`). To publish an updated edition later,
     just upload a new file over the same name.
4. In **Authentication → Providers**, keep Email enabled. Leave "Confirm
   email" on. In **Authentication → URL Configuration**, set the Site URL
   to your `NEXT_PUBLIC_SITE_URL` value.
5. Copy the Project URL, `anon` key and `service_role` key from
   **Project Settings → API** into your env vars.

To make someone an admin (e.g. the course owner), run in the SQL editor:

```sql
update public.profiles set is_admin = true where email = 'owner@example.com';
```

Admins see `/admin` and get course access without paying.

### 2. PayFast

1. Sandbox first: log in at [sandbox.payfast.co.za](https://sandbox.payfast.co.za)
   to get sandbox merchant credentials, and set a **passphrase** there.
   Put all three in your env vars with `PAYFAST_MODE=sandbox`.
2. The ITN webhook URL is `<NEXT_PUBLIC_SITE_URL>/api/payfast/itn`. PayFast
   must be able to reach it over the public internet — for local testing,
   run something like `ngrok http 3000` and set `NEXT_PUBLIC_SITE_URL` to
   the ngrok URL + `/app`.
3. Do a full sandbox test: sign up → buy → pay with the sandbox test buyer
   → confirm the course unlocks and the payment shows in `/admin`.
4. Go live by switching the env vars to your real merchant ID/key/passphrase
   and `PAYFAST_MODE=live`. Nothing else changes.

### 3. Run locally

```bash
cp .env.example .env.local   # then fill it in
npm install
npm run dev                  # → http://localhost:3000/app
```

Note the `/app` base path — the root URL 404s by design.

### 4. Deploy (Vercel)

1. Push this repo to GitHub and import it in [vercel.com](https://vercel.com).
   Every push to `main` auto-deploys; PRs get preview URLs.
2. Add all variables from `.env.example` in **Project → Settings →
   Environment Variables**.
3. The app serves under `/app` (see `basePath` in `next.config.mjs`).
   To have it appear at `learnersdrive.co.za/app` alongside the marketing
   site, point the marketing host at it:
   - If the marketing site is also on Vercel, add a rewrite in *its* config:
     `{ "source": "/app/:path*", "destination": "https://<this-app>.vercel.app/app/:path*" }`
   - Otherwise configure the equivalent proxy rule wherever the marketing
     site is hosted.
4. Set `NEXT_PUBLIC_SITE_URL=https://learnersdrive.co.za/app` in Vercel,
   and the same URL as the Site URL in Supabase Auth settings.

## Project map

```
supabase/migrations/0001_init.sql  schema, RLS policies, storage buckets
supabase/seed.sql                  sample lessons
src/middleware.ts                  session refresh + protected routes
src/lib/payfast.ts                 checkout signature + ITN verification
src/lib/rate-limit.ts              login/signup rate limiting
src/lib/access.ts                  requireUser / requirePaidUser / requireAdmin
src/app/(auth)/                    login, signup, server actions
src/app/dashboard/                 lesson list + progress
src/app/lesson/[id]/               video player (signed URL, progress saving)
src/app/book/                      PDF download (signed URL)
src/app/buy/                       PayFast checkout
src/app/payment/                   return/cancel pages
src/app/admin/                     read-only sales dashboard
src/app/api/payfast/itn/           payment webhook → unlock access
src/app/api/progress/              progress upsert endpoint
```

## Scope decisions (MVP)

- Single course, hard-coded — no courses table. Adding a second course
  later means adding one and pointing lessons at it.
- Videos stream from Supabase Storage. If bandwidth costs or playback
  quality become a problem at scale, move files to a video CDN (e.g.
  Bunny Stream) and store the new URLs in `lessons.video_path`.
- One study book PDF, re-downloadable any time while logged in.
- One-way payments; refunds handled manually in PayFast.
- No 2FA (email + password with rate limiting).
