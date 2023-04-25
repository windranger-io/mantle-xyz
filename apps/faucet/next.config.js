/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateEtags: false,
  transpilePackages: ['@design-system/ui'],
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
