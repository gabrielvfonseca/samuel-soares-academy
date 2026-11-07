/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/email", "@repo/db"],
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
