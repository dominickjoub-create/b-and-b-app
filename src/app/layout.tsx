import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/(auth)/actions';

export const metadata: Metadata = {
  title: 'Learners Drive Academy',
  description:
    'Pass your learners test first time. Online video classes + study book for Code 8, 10 and 14.',
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

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    isAdmin = Boolean(profile?.is_admin);
  }

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            <span className="brand-mark">L</span> Learners Drive
          </Link>
          <nav>
            {user ? (
              <>
                <Link href="/dashboard">My classes</Link>
                <Link href="/book">Book</Link>
                {isAdmin && <Link href="/admin">Admin</Link>}
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
