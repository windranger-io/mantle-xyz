/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@design-system/ui'],
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
