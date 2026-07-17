import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/(auth)/actions';

export const metadata: Metadata = {
  title: 'Learners Drive Academy — K50 Course',
  description: 'Pass your K50 learners test first time. Online video course + study book.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            🚗 Learners Drive Academy
          </Link>
          <nav>
            {user ? (
              <>
                <Link href="/dashboard">My course</Link>
                <Link href="/book">Book</Link>
                <form action={signOut} className="inline-form">
                  <button type="submit" className="link-button">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/signup" className="button small">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          © {new Date().getFullYear()} Learners Drive Academy, Brewer
        </footer>
      </body>
    </html>
  );
}
