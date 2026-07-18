'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POPIA: lets a student permanently delete their own account and personal
// data. Deleting the auth user cascades their profile and lesson progress
// (payment records keep only a nulled user reference, for financial audit).
export async function deleteAccount() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) redirect('/account?error=1');

  await supabase.auth.signOut();
  redirect('/?deleted=1');
}
