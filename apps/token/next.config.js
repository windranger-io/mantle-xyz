/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@design-system/ui'],
  images: {
    domains: [
      'token-list.mantle.xyz',
      'safe-transaction-assets.gnosis-safe.io',
      'safe-transaction-assets.safe.global',
      'static.alchemyapi.io',
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/graphql',
        permanent: true,
      },
    ]
  },
  experimental: {
    appDir: true,
    scrollRestoration: true
  }
}

module.exports = nextConfig
