import { createNEMO, type NextMiddleware } from "@rescale/nemo";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { parseError } from "@/lib/error";
import { internationalizationMiddleware } from "@/lib/i18n";
import { noseconeOptionsWithToolbar, secure, securityMiddleware } from "@/lib/security";

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets, public images, and Posthog ingest
  matcher: ["/((?!_next/static|_next/image|ingest|favicon.ico|images).*)"],
};

const securityHeaders = securityMiddleware(noseconeOptionsWithToolbar);

// Custom middleware for Arcjet security checks
const arcjetMiddleware = async (request: NextRequest) => {
  if (!env.ARCJET_KEY) {
    return;
  }

  try {
    await secure(
      [
        // See https://docs.arcjet.com/bot-protection/identifying-bots
        "CATEGORY:SEARCH_ENGINE", // Allow search engines
        "CATEGORY:PREVIEW", // Allow preview links to show OG images
        "CATEGORY:MONITOR", // Allow uptime monitoring services
      ],
      request
    );
  } catch (error) {
    const message = parseError(error);
    return NextResponse.json({ error: message }, { status: 403 });
  }
};

// Run i18n only for non-API routes so /api/* is not rewritten and returns 200
const i18nOrPass: NextMiddleware = async (request) => {
  if (request.nextUrl.pathname.startsWith("/api")) return;
  return internationalizationMiddleware(request);
};

// Compose non-Clerk middleware with Nemo
const composedMiddleware = createNEMO(
  {},
  {
    before: [i18nOrPass, arcjetMiddleware],
  }
);

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  // Run security headers first
  const headersResponse = securityHeaders();

  // Then run composed middleware (i18n + arcjet)
  // next-international handles locale rewriting with urlMappingStrategy: "rewriteDefault"
  // This means: / -> rewrites to /pt (default locale), /en -> stays as /en
  const middlewareResponse = await composedMiddleware(request as unknown as NextRequest, event);

  // Return middleware response if it exists, otherwise headers response
  return middlewareResponse || headersResponse;
}
