import { localeSchema } from "@repo/validation/locale";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

const gallerySpans = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
];

export async function GallerySection({ lang = "pt" }: SectionProps) {
  // Parsed language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw data for gallery section
  const rawData = dictionary.web.sections.gallery;

  // Format data
  const data = {
    description: rawData.description,
    items: rawData.items.map((item, index: number) => ({
      alt: item.alt,
      span: gallerySpans[index] ?? "col-span-1 row-span-1",
      src: item.src,
    })),
    title: rawData.title,
  };

  return (
    <section className="bg-muted/50 px-4 py-24 sm:px-6 lg:px-8" id="gallery">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              {data.title}
            </h2>
            <p className="text-muted-foreground mt-4">{data.description}</p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.items.map((image, index) => (
            <div
              className={`${image.span} bg-muted relative overflow-hidden rounded-lg`}
              key={index}
            >
              <Image
                alt={image.alt}
                className="object-cover transition-transform duration-300 hover:scale-105"
                fill
                src={image.src || "/placeholder.svg"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
