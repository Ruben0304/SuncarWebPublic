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
        // El service worker de /feria vive en la raíz pero solo debe controlar
        // esa ruta: sin esta cabecera el navegador rechaza el scope acotado y
        // habría que darle alcance sobre todo el sitio público.
        source: "/sw-feria.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/feria",
          },
          {
            // El propio worker nunca se cachea: es lo que permite publicar una
            // versión nueva y que la tablet la tome al abrir con wifi.
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
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

  // Next.js image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
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
      {
        protocol: "https",
        hostname: "s3.suncarsrl.com",
        port: "443",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
