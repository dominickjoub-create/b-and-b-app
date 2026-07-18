import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import SiteHeader from './site-header';

export const metadata: Metadata = {
  title: 'B&B Driving Academy',
  description:
    'Pass your K53 learners test first time. Online video classes + study book for Code A, 8, 10 and 14.',
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
        <SiteHeader signedIn={Boolean(user)} isAdmin={isAdmin} />
        <main>{children}</main>
        <footer className="site-footer">
          © {new Date().getFullYear()} B&amp;B Driving Academy · Learn safely ·
          Drive confidently
          <br />
          <Link href="/privacy">Privacy policy</Link>
        </footer>
      </body>
    </html>
  );
}
