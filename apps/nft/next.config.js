/** @type {import('next').NextConfig} */

const withNextIntl = require('next-intl/plugin')('./src/i18n.ts')

const nextConfig = withNextIntl({
  reactStrictMode: true,
  generateEtags: false,
  transpilePackages: ['@design-system/ui'],
  experimental: {
    appDir: true,
  },
})

module.exports = nextConfig
