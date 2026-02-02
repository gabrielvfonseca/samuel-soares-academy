import type { NextRequest } from "next/server";
import { getDictionary, type Locale } from "@/lib/i18n";
import { internalError, success } from "@/lib/response";
import { HeroSchema } from "@/models/hero";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") ||
    request.headers.get("accept-language") ||
    "en") as Locale;

  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.hero;

  const heroData = {
    badge: data.badge,
    title: data.title,
    description: data.description,
    buttons: [
      { label: data.primaryCta, href: "#contact", variant: "default" },
      { label: data.secondaryCta, href: "#training", variant: "ghost" },
    ],
    image: data.image,
  };

  const result = HeroSchema.safeParse(heroData);
  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }

  return success(result.data);
}
