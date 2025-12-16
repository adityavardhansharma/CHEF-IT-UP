/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.clerk.dev'],
  },
  // Skip TypeScript type checking during build (Vercel deployments)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build (Vercel deployments)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
