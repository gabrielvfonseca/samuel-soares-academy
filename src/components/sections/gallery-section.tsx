import Image from "next/image";
import { fetchApi } from "@/lib/api-client";
import type { GallerySection as GallerySectionData } from "@/models/gallery";
import type { Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function GallerySection({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<GallerySectionData>("/api/gallery", lang as Locale);

  return (
    <section id="gallery" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              {data.title}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {data.description}
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.items.map((image, index) => (
            <div key={index} className={`${image.span} relative bg-muted rounded-lg overflow-hidden`}>
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
