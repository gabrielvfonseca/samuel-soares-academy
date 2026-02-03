import { type NextRequest } from "next/server";
import { internationalizationMiddleware } from "@/lib/i18n";

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets, public images, and Posthog ingest
  matcher: ["/((?!api|_next/static|_next/image|ingest|favicon.ico|images|.*\\..*).*)"],
};

export function middleware(request: NextRequest) {
  // Run i18n
  // next-international handles locale rewriting with urlMappingStrategy: "rewriteDefault"
  return internationalizationMiddleware(request);
}
