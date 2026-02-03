import { type NextRequest, NextResponse } from "next/server";
import { internationalizationMiddleware } from "@/lib/i18n";
import { noseconeOptions, secure, securityMiddleware } from "@/lib/security";

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets, public images, and Posthog ingest
  matcher: ["/((?!api|_next/static|_next/image|ingest|favicon.ico|images|.*\\..*).*)"],
};

const securityHeaders = securityMiddleware(noseconeOptions);

export async function middleware(request: NextRequest) {
  // Apply security headers
  const response = await securityHeaders();

  const arcjetKey = process.env.ARCJET_KEY;

  // Custom middleware for Arcjet security checks
  if (arcjetKey) {
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
    } catch (error: any) {
      const message = error?.message || String(error);
      const errorResponse = NextResponse.json({ error: message }, { status: 403 });
      // Add security headers to error response
      response.headers.forEach((value: any, key: any) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }
  }

  // Run i18n
  // next-international handles locale rewriting with urlMappingStrategy: "rewriteDefault"
  const i18nResponse = internationalizationMiddleware(request);

  if (i18nResponse) {
    // Add security headers to i18n response
    response.headers.forEach((value, key) => {
      i18nResponse.headers.set(key, value);
    });
    return i18nResponse;
  }

  return response;
}
