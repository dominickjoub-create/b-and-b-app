'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signUp } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button" disabled={pending}>
      {pending ? 'Creating account…' : 'Sign up'}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signUp, undefined);

  return (
    <form action={formAction} className="form">
      <h1>Create your account</h1>
      <label htmlFor="full_name">Full name</label>
      <input id="full_name" name="full_name" type="text" autoComplete="name" required />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">Password (min 8 characters)</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {state?.error && <p className="error">{state.error}</p>}
      {state?.notice && <p className="notice">{state.notice}</p>}
      <SubmitButton />
      <p className="muted" style={{ marginTop: '1rem' }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
