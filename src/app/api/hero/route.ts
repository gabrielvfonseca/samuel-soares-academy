import type { NextRequest } from "next/server";
import { HeroSchema } from "@/models/hero";
import { getDictionary, type Locale } from "@/lib/i18n";
import { success, internalError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") || request.headers.get("accept-language") || "en") as Locale;
  
  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.hero;

  const heroData = {
    badge: data.badge,
    title: data.title,
    description: data.description,
    buttons: [
      { label: data.primaryCta, href: "#contact", variant: "default" },
      { label: data.secondaryCta, href: "#training", variant: "ghost" }
    ],
    image: {
      src: "/placeholder.svg?height=600&width=1200",
      alt: data.title
    }
  };

  const result = HeroSchema.safeParse(heroData);
  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }

  return success(result.data);
}
