'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/bnb-logo.jpeg';
import { signOut } from '@/app/(auth)/actions';

export default function SiteHeader({
  signedIn,
  isAdmin,
}: {
  signedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" onClick={close}>
          <Image
            src={logo}
            alt="B&B Driving Academy"
            className="brand-img"
            priority
          />
        </Link>

        {signedIn ? (
          <>
            <button
              type="button"
              className={`nav-toggle${open ? ' is-open' : ''}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
            <nav className={`site-nav${open ? ' open' : ''}`}>
              <Link href="/dashboard" onClick={close}>
                My classes
              </Link>
              <Link href="/book" onClick={close}>
                Book
              </Link>
              <Link href="/account" onClick={close}>
                Account
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={close}>
                  Admin
                </Link>
              )}
              <form action={signOut}>
                <button type="submit" className="nav-signout">
                  Sign out
                </button>
              </form>
            </nav>
          </>
        ) : (
          <nav className="site-nav guest">
            <Link href="/login">Log in</Link>
            <Link href="/signup" className="button small">
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
