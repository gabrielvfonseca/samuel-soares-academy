import { env } from "@/env";
import type { Locale } from "./i18n";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // use relative url on client
  // In development, always use NEXT_PUBLIC_APP_URL (HTTP) to avoid SSL errors
  if (env.NODE_ENV === "development") {
    return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
};

export async function fetchApi<T>(path: string, lang: Locale = "pt"): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);
  url.searchParams.set("lang", lang);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch API: ${path}`);
  }

  return res.json();
}
