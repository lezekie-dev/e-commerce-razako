/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: false,
  },
  images: {
    remotePatterns: [
      // ─────────────────────────────────────────────────────────────────
      // Production domain (à surcharger via NEXT_PUBLIC_SITE_HOST en prod)
      // ─────────────────────────────────────────────────────────────────
      { protocol: 'https', hostname: 'maison14.fr' },
      { protocol: 'https', hostname: 'www.maison14.fr' },
      // ─────────────────────────────────────────────────────────────────
      // Local dev
      // ─────────────────────────────────────────────────────────────────
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
      // ─────────────────────────────────────────────────────────────────
      // Cloudflare R2 public host (R2_PUBLIC_HOST env var)
      // ─────────────────────────────────────────────────────────────────
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.cloudflarestorage.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig