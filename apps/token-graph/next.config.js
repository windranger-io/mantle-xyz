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
  async headers() {
    return [
      {
        // matching all routes
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST" },
          { key: "Access-Control-Allow-Headers", value: "Origin, X-Requested-With, Content-Type, Accept, Authorization" },
        ]
      }
    ]
  },
  experimental: {
    appDir: true,
    scrollRestoration: true
  }
}

module.exports = nextConfig
