'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { signIn } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button" disabled={pending}>
      {pending ? 'Logging in…' : 'Log in'}
    </button>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useFormState(signIn, undefined);

  return (
    <form action={formAction} className="form">
      <h1>Log in</h1>
      <input
        type="hidden"
        name="next"
        value={searchParams.get('next') ?? '/dashboard'}
      />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state?.error && <p className="error">{state.error}</p>}
      <SubmitButton />
      <p className="muted" style={{ marginTop: '1rem' }}>
        No account yet? <Link href="/signup">Sign up</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
