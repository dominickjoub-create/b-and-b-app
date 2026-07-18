/** @type {import('next').NextConfig} */

// Baseline security headers applied to every response. These are the cheap,
// high-value hardening headers that don't risk breaking the app (a strict
// Content-Security-Policy needs per-request nonces in Next and is left as a
// future step). Vercel serves everything over HTTPS, so HSTS is safe.
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

const nextConfig = {
  // The app is served at learnersdrive.co.za/app — every route, asset and
  // link is automatically prefixed. PayFast return/notify URLs must include
  // this prefix too (see NEXT_PUBLIC_SITE_URL in .env.example).
  basePath: '/app',
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
