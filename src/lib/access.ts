import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  has_access: boolean;
  is_admin: boolean;
  license_code: number | null;
};

// For protected pages: middleware already guarantees a session, but we
// re-check here (defence in depth) and load the profile.
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, has_access, is_admin, license_code')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');
  return { supabase, user, profile };
}

// Course pages: must be signed in AND have picked a license code.
// (Payment gating is parked until PayFast goes live — at that point,
// also check profile.has_access here and redirect to /buy.)
export async function requireStudent() {
  const result = await requireUser();
  if (!result.profile.license_code) redirect('/choose-code');
  return result;
}

export async function requireAdmin() {
  const result = await requireUser();
  if (!result.profile.is_admin) redirect('/dashboard');
  return result;
}
