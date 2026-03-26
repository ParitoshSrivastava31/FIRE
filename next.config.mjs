/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Capacitor — generates static HTML/JS/CSS in /out
  // API routes (/api/*) are NOT affected — they stay on Vercel.
  // Comment out 'output' if you need SSR features during web-only development.
  output: 'export',

  // Required for Capacitor routing — file-based navigation in WebView
  trailingSlash: true,

  // next/image optimization requires a server — disable for static export
  images: {
    unoptimized: true,
  },

  // Suppress the "missing generateStaticParams" warning for dynamic routes
  // that are auth-gated (they generate at runtime in the browser, not at build time)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

