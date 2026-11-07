import "server-only";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import { localeSchema } from "@repo/validation/locale";
import Negotiator from "negotiator";
import type { NextRequest } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import type pt from "@/dictionaries/pt.json";
import languine from "@/languine.json" with { type: "json" };

export const locales = [
  languine.locale.source,
  ...languine.locale.targets,
] as const;

export type Dictionary = typeof pt;

const dictionaries: Record<string, () => Promise<Dictionary>> =
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      () =>
        import(`@/dictionaries/${locale}.json`)
          .then((mod) => mod.default)
          .catch((_err) =>
            import("@/dictionaries/pt.json").then((mod) => mod.default)
          ),
    ])
  );

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  // Normalize locale
  const normalizedLocale = locale.split("-")[0];

  // Parsed language
  const parsedLang = localeSchema.parse(normalizedLocale);

  // Check if locales includes lang
  if (!locales.includes(parsedLang)) {
    return dictionaries.pt();
  }

  try {
    return await dictionaries[parsedLang]();
  } catch {
    return dictionaries.pt();
  }
};

/**
 * Filter to BCP 47 locale tags valid for Intl.getCanonicalLocales (used inside matchLocale).
 */
function filterValidLocaleTags(tags: string[]): string[] {
  const valid: string[] = [];
  const intl = globalThis.Intl as {
    getCanonicalLocales?: (locales: string | string[]) => string[];
  };
  const getCanonicalLocales = intl?.getCanonicalLocales;
  if (!getCanonicalLocales) {
    return valid;
  }
  for (const tag of tags) {
    if (!tag || tag === "*") {
      continue;
    }
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
  defaultLocale: languine.locale.source,
  locales: [...locales],
  resolveLocaleFromRequest: (request: NextRequest) => {
    const defaultLocale = languine.locale.source;

    // Parse default locale
    const parsedLang = localeSchema.parse(defaultLocale);

    try {
      const headers = Object.fromEntries(request.headers.entries());
      const negotiator = new Negotiator({ headers });
      const acceptedLanguages = negotiator.languages();
      const validRequested = filterValidLocaleTags(acceptedLanguages);

      const matchedLocale = matchLocale(
        validRequested.length > 0 ? validRequested : [parsedLang],
        [...locales],
        parsedLang
      );
      return matchedLocale ?? parsedLang;
    } catch {
      return parsedLang;
    }
  },
  urlMappingStrategy: "rewriteDefault",
});

export const internationalizationMiddleware = (request: NextRequest) =>
  I18nMiddleware(request);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
