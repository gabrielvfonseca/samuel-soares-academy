import "server-only";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { NextRequest } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import type pt from "@/dictionaries/pt.json";
import languine from "@/languine.json" with { type: "json" };

export const locales = [languine.locale.source, ...languine.locale.targets] as const;

export type Locale = (typeof locales)[number];
export type Dictionary = typeof pt;

const dictionaries: Record<string, () => Promise<Dictionary>> = Object.fromEntries(
  locales.map((locale) => [
    locale,
    () =>
      import(`@/dictionaries/${locale}.json`)
        .then((mod) => mod.default)
        .catch((_err) => import("@/dictionaries/pt.json").then((mod) => mod.default)),
  ])
);

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const normalizedLocale = locale.split("-")[0];

  if (!locales.includes(normalizedLocale as Locale)) {
    return dictionaries.pt();
  }

  try {
    return await dictionaries[normalizedLocale as Locale]();
  } catch (_error) {
    return dictionaries.pt();
  }
};

/** Filter to BCP 47 locale tags valid for Intl.getCanonicalLocales (used inside matchLocale). */
function filterValidLocaleTags(tags: string[]): string[] {
  const valid: string[] = [];
  const intl = globalThis.Intl as { getCanonicalLocales?(locales: string | string[]): string[] };
  const getCanonicalLocales = intl?.getCanonicalLocales;
  if (!getCanonicalLocales) return valid;
  for (const tag of tags) {
    if (!tag || tag === "*") continue;
    try {
      getCanonicalLocales(tag);
      valid.push(tag);
    } catch {
      // skip invalid tags
    }
  }
  return valid;
}

const I18nMiddleware = createI18nMiddleware({
  locales: [...locales],
  defaultLocale: languine.locale.source,
  urlMappingStrategy: "rewriteDefault",
  resolveLocaleFromRequest: (request: NextRequest) => {
    const defaultLocale = languine.locale.source;
    try {
      const headers = Object.fromEntries(request.headers.entries());
      const negotiator = new Negotiator({ headers });
      const acceptedLanguages = negotiator.languages();
      const validRequested = filterValidLocaleTags(acceptedLanguages);

      const matchedLocale = matchLocale(
        validRequested.length > 0 ? validRequested : [defaultLocale],
        [...locales],
        defaultLocale
      );
      return matchedLocale ?? defaultLocale;
    } catch {
      return defaultLocale;
    }
  },
});

export const internationalizationMiddleware = (request: NextRequest) => I18nMiddleware(request);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
