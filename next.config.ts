import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  trailingSlash: true,
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/**": ["./data/**"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.caloriewize.com" }],
        destination: "https://caloriewize.com/:path*",
        permanent: true,
      },
      // 2026-04-24 — /es/food/* removed (thin translation, same trap as nameblooms /es/name).
      // Prior 6K+ Spanish food URLs were indexed. 301 to English canonical consolidates signal
      // and lets Google drop the es/ variants from its index via redirect chain.
      {
        source: "/es/food/:slug/",
        destination: "/food/:slug/",
        permanent: true,
      },
      {
        source: "/es/food/:slug",
        destination: "/food/:slug/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};
export default nextConfig;
