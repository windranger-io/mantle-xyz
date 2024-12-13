/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@design-system/ui"],
  images: {
    domains: [
      "token-list.mantle.xyz",
      "safe-transaction-assets.gnosis-safe.io",
      "safe-transaction-assets.safe.global",
      "static.alchemyapi.io",
    ],
  },
  experimental: {
    appDir: true,
    scrollRestoration: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://app.mantle.xyz/bridge/:path*?network=sepolia",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
