import type { NextRequest } from "next/server";
import { getDictionary, type Locale } from "@/lib/i18n";
import { internalError, success } from "@/lib/response";
import { CtaSchema } from "@/models/cta";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") ||
    request.headers.get("accept-language") ||
    "en") as Locale;

  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.cta;

  const ctaData = {
    title: data.title,
    description: data.description,
    buttons: [
      { label: data.primaryCta, href: "#contact", variant: "secondary" },
      { label: data.secondaryCta, href: "tel:+351912345678", variant: "ghost" },
    ],
    image: {
      src: data.image?.src || "/images/team_cta.JPG",
      alt: data.image?.alt || data.title,
    },
  };

  const result = CtaSchema.safeParse(ctaData);

  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }

  return success(result.data);
}
