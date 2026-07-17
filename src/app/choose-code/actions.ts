'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isLicenseCode } from '@/lib/course';

export async function chooseCode(formData: FormData) {
  const code = Number(formData.get('code'));
  if (!isLicenseCode(code)) redirect('/choose-code');

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // RLS + column grants: users can only update license_code/full_name
  // on their own row.
  const { error } = await supabase
    .from('profiles')
    .update({ license_code: code })
    .eq('id', user.id);

  if (error) redirect('/choose-code?error=1');
  redirect('/dashboard');
}
