/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone', // Reduce bundle size by ~60%
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable Next.js image optimization (not using <Image> component)
  images: {
    unoptimized: true, // Disable image optimization to save RAM
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ejemplo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.suncarsrl.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
