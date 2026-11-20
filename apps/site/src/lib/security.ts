export { secureHeaders } from "./secure-headers";

/**
 * Security middleware for the site app.
 *
 * Replaces the old Arcjet + Nosecone setup. On Cloudflare Workers, security
 * is handled at the edge (WAF, bot detection, rate limiting). This file
 * provides the security headers that were previously set by Nosecone.
 */
export const secure = async (_allow: string[], _sourceRequest?: Request) => {
  // Bot detection and rate limiting are handled by Cloudflare's edge
  // security services. No client-side action needed.
};
