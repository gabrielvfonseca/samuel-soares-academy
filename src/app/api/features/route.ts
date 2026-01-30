import type { NextRequest } from "next/server";
import { FeaturesSchema } from "@/models/feature";
import { getDictionary, type Locale } from "@/lib/i18n";
import { success, internalError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") || request.headers.get("accept-language") || "en") as Locale;
  
  const dictionary = await getDictionary(lang);
  const features = dictionary.web.sections.about.features;

  const result = FeaturesSchema.safeParse(features);

  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }
  
  return success(result.data);
}
