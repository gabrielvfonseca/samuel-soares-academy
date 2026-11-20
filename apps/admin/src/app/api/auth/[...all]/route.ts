import { getInstance } from "@/integrations/auth/server";

/**
 * Better Auth catch-all route. Delegates every request to Better Auth's
 * built-in handler, which sets the `better-auth.session_token` cookie on
 * sign-in and clears it on sign-out.
 *
 * Used endpoints:
 *   POST /api/auth/sign-up/email   (create account)
 *   POST /api/auth/sign-in/email   (login)
 *   GET  /api/auth/get-session     (browser session check)
 *   POST /api/auth/sign-out        (logout)
 */

export async function GET(request: Request) {
  return getInstance().handler(request);
}

export async function POST(request: Request) {
  return getInstance().handler(request);
}
