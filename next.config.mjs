/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: "standalone", // Reduce bundle size by ~60%
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode

  typescript: {
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' blob: https://*.suncarsrl.com https://*.supabase.co https://www.google-analytics.com https://cdn.jsdelivr.net https://unpkg.com https://www.gstatic.com https://lottie.host wss:",
              "worker-src 'self' blob:",
              "media-src 'self' blob: https://*.suncarsrl.com https://*.supabase.co",
              "frame-src 'self' https://www.google.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Disable Next.js image optimization (not using <Image> component)
  images: {
    unoptimized: true, // Disable image optimization to save RAM
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3.suncarsrl.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
