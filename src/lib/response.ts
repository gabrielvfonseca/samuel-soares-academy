import { NextResponse } from "next/server";

const NO_CACHE_HEADERS: HeadersInit = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

/**
 * Returns a successful JSON response.
 * Uses no-cache headers by default to prevent caching of API responses.
 */
export function success<T>(data: T, status = 200, headers?: HeadersInit) {
  const mergedHeaders: HeadersInit =
    headers && typeof headers === "object" && !Array.isArray(headers)
      ? { ...NO_CACHE_HEADERS, ...headers }
      : NO_CACHE_HEADERS;
  return NextResponse.json(data, {
    status,
    headers: mergedHeaders,
  });
}

/**
 * Returns an error JSON response.
 */
export function error(message: string, status = 400, details?: unknown) {
  const responseBody: Record<string, unknown> = { error: message };
  if (details !== undefined) {
    responseBody.details = details;
  }
  return NextResponse.json(responseBody, { status });
}

/**
 * Shortcut for 400 Bad Request
 */
export const badRequest = (message = "Bad Request", details?: unknown) =>
  error(message, 400, details);

/**
 * Shortcut for 401 Unauthorized
 */
export const unauthorized = (message = "Unauthorized") => error(message, 401);

/**
 * Shortcut for 404 Not Found
 */
export const notFound = (message = "Resource not found") => error(message, 404);

/**
 * Shortcut for 500 Internal Server Error
 */
export const internalError = (message = "Internal Server Error", details?: unknown) =>
  error(message, 500, details);
