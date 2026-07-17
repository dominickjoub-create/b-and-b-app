import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets and the PayFast ITN webhook (server-to-server,
  // has no auth cookies and must never be redirected).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/payfast).*)'],
};
