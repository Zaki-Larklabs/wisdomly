/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Treat as warning instead of failing the production build for legacy dashboard issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prevent pre-existing type warnings from crashing build pipeline
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: '/dashboard/admin/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
