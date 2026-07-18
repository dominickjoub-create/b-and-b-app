import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy · B&B Driving Academy',
};

// Plain-language POPIA-style privacy notice. Have it reviewed by a legal
// professional before relying on it for real customers.
export default function PrivacyPage() {
  return (
    <div className="prose">
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: {new Date().getFullYear()}</p>

      <p>
        B&amp;B Driving Academy (“we”, “us”) respects your privacy and handles
        your personal information in line with South Africa’s Protection of
        Personal Information Act (POPIA). This notice explains what we collect
        and what you can do about it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Your name and email address (to create and secure your account).</li>
        <li>The license code you’re studying for.</li>
        <li>Your class progress and quiz scores.</li>
        <li>Payment records (handled by PayFast; we never see your card details).</li>
      </ul>

      <h2>Why we collect it</h2>
      <p>
        To give you access to the course, track your progress, provide support,
        and keep records of purchases. We do not sell your information or share
        it except with the service providers that run the app (Supabase for
        data and hosting, PayFast for payments).
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your account data while your account is active. You can delete
        your account and personal data at any time from your{' '}
        <Link href="/account">account page</Link>. Payment records may be kept
        as required for financial and tax purposes, with your identity removed.
      </p>

      <h2>Your rights</h2>
      <p>
        You may access, correct or delete your personal information. Account
        deletion is available in the app; for anything else, contact us at{' '}
        {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@bnbdriving.co.za'}.
      </p>

      <h2>Security</h2>
      <p>
        Your password is stored securely (hashed and salted). Access to course
        material is protected and served over encrypted connections.
      </p>

      <p className="muted">
        Questions? Email{' '}
        {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@bnbdriving.co.za'}.
      </p>
    </div>
  );
}
