/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@design-system/ui"],
  images: {
    domains: [
      "raw.githubusercontent.com",
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
    // return process.env.NEXT_PUBLIC_SHOW_MAINTENANCE === "true"
    //   ? [
    //       {
    //         source: "/",
    //         destination: "/maintenance",
    //         permanent: true,
    //       },
    //       {
    //         source: "/((?!maintenance).*)",
    //         destination: "/maintenance",
    //         permanent: true,
    //       },
    //     ]
    //   : [
    //       {
    //         source: "/maintenance",
    //         destination: "/",
    //         permanent: false,
    //       },
    //     ];

    return [
      {
        source: "/:path*",
        destination: "https://app.mantle.xyz/bridge/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
