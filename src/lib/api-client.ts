import type { Locale } from "./i18n";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // use relative url on client

  const nodeEnv = process.env.NODE_ENV || "development";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const vercelUrl = process.env.VERCEL_URL;

  // In development, always use NEXT_PUBLIC_APP_URL (HTTP) or localhost to avoid SSL errors
  if (nodeEnv === "development") {
    return appUrl ?? "http://localhost:3000";
  }

  // In production (Vercel), prioritize NEXT_PUBLIC_APP_URL if it exists
  if (appUrl) return appUrl;
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
};

export async function fetchApi<T>(path: string, lang: Locale = "pt"): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);
  url.searchParams.set("lang", lang);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });

    if (!res.ok) {
      console.error(`[fetchApi] Error ${res.status} fetching ${url.toString()}`);
      throw new Error(`Failed to fetch API: ${path} (Status: ${res.status})`);
    }

    return res.json();
  } catch (error) {
    console.error(`[fetchApi] Exception fetching ${url.toString()}:`, error);
    throw error;
  }
}
