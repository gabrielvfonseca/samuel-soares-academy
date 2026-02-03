import type { NextRequest } from "next/server";
import { getDictionary, type Locale } from "@/lib/i18n";
import { internalError, success } from "@/lib/response";
import { FacilitiesSectionSchema } from "@/models/facility";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") ||
    request.headers.get("accept-language") ||
    "en") as Locale;

  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.facilities;

  const result = FacilitiesSectionSchema.safeParse({
    title: data.title,
    description: data.description,
    items: data.items.map((item: any) => ({
      ...item,
      image: item.image || "/images/court.jpg",
    })),
  });

  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }

  return success(result.data);
}
