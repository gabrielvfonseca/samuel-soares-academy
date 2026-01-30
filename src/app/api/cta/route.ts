import type { NextRequest } from "next/server";
import { CtaSchema } from "@/models/cta";
import { getDictionary, type Locale } from "@/lib/i18n";
import { success, internalError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") || request.headers.get("accept-language") || "en") as Locale;
  
  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.cta;

  const ctaData = {
    title: data.title,
    description: data.description,
    buttons: [
      { label: data.primaryCta, href: "#contact", variant: "secondary" },
      { label: data.secondaryCta, href: "tel:+351912345678", variant: "ghost" }
    ],
    image: {
      src: "/placeholder.svg?height=400&width=600",
      alt: data.title
    }
  };

  const result = CtaSchema.safeParse(ctaData);
  
  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }

  return success(result.data);
}
