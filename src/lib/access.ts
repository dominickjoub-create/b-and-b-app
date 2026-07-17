import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  has_access: boolean;
  is_admin: boolean;
};

// For protected pages: middleware already guarantees a session, but we
// re-check here (defence in depth) and load the profile for access gating.
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, has_access, is_admin')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');
  return { supabase, user, profile };
}

export async function requirePaidUser() {
  const result = await requireUser();
  if (!result.profile.has_access && !result.profile.is_admin) {
    redirect('/buy');
  }
  return result;
}

export async function requireAdmin() {
  const result = await requireUser();
  if (!result.profile.is_admin) redirect('/dashboard');
  return result;
}
