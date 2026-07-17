'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit';

function clientIp(): string {
  const h = headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    'unknown'
  );
}

// `next` comes from the login redirect; only ever follow relative paths
// so the parameter can't be abused to bounce users to another site.
function safeNext(value: FormDataEntryValue | null): string {
  const v = typeof value === 'string' ? value : '';
  return v.startsWith('/') && !v.startsWith('//') ? v : '/dashboard';
}

export async function signIn(
  _prev: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const key = `login:${clientIp()}:${email}`;
  const limit = checkRateLimit(key);
  if (!limit.allowed) {
    return {
      error: `Too many login attempts. Try again in ${limit.retryAfterMinutes} minutes.`,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Generic message — don't reveal whether the email exists.
    return { error: 'Incorrect email or password.' };
  }

  clearRateLimit(key);
  redirect(safeNext(formData.get('next')));
}

export async function signUp(
  _prev: { error?: string; notice?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; notice?: string } | undefined> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const limit = checkRateLimit(`signup:${clientIp()}`);
  if (!limit.allowed) {
    return {
      error: `Too many attempts. Try again in ${limit.retryAfterMinutes} minutes.`,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is enabled in Supabase, no session is returned.
  if (!data.session) {
    return {
      notice: 'Check your email for a confirmation link, then log in.',
    };
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}
