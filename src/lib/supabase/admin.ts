import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Service-role client: bypasses RLS. Server-side only — used for signed
// storage URLs, the PayFast webhook, and the admin dashboard queries.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
