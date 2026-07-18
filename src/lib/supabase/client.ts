import { createBrowserClient } from '@supabase/ssr';

// Browser-side Supabase client. Used by the admin uploader to send files
// DIRECTLY to Supabase Storage (via a signed upload URL), so big video
// files never pass through Vercel's servers or hit its upload limits.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
