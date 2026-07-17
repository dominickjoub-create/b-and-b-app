/** @type {import('next').NextConfig} */
const nextConfig = {
  // The app is served at learnersdrive.co.za/app — every route, asset and
  // link is automatically prefixed. PayFast return/notify URLs must include
  // this prefix too (see NEXT_PUBLIC_SITE_URL in .env.example).
  basePath: '/app',
};

export default nextConfig;
