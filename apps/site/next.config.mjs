/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
        source: "/:path*",
      },
    ];
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@repo/ui", "@repo/email", "@repo/validation"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
