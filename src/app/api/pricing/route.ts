import type { NextRequest } from "next/server";
import { PricingSectionSchema } from "@/models/pricing";
import { getDictionary, type Locale } from "@/lib/i18n";
import { success, internalError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") || request.headers.get("accept-language") || "en") as Locale;
  
  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.pricing;

  const result = PricingSectionSchema.safeParse(data);
  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }

  return success(result.data);
}
