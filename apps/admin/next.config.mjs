/** @type {import("next").NextConfig} */
const nextConfig = {
  serverExternalPackages: ["postgres"],
  transpilePackages: ["@repo/ui", "@repo/email", "@repo/database"],
};

export default nextConfig;
