import type { NextRequest } from "next/server";
import { getDictionary, type Locale } from "@/lib/i18n";
import { internalError, success } from "@/lib/response";
import { GallerySectionSchema } from "@/models/gallery";

export const dynamic = "force-dynamic";

const gallerySpans = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
];

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") ||
    request.headers.get("accept-language") ||
    "en") as Locale;

  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.gallery;

  const result = GallerySectionSchema.safeParse({
    title: data.title,
    description: data.description,
    items: data.items.map((item, index) => ({
      src: item.src,
      alt: item.alt,
      span: gallerySpans[index] ?? "col-span-1 row-span-1",
    })),
  });

  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }

  return success(result.data);
}
