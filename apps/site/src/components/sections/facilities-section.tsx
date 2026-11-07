import { localeSchema } from "@repo/validation/locale";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function FacilitiesSection({ lang = "pt" }: SectionProps) {
  // Parse the locale
  const parsedLocale = localeSchema.parse(lang);

  // Get the dictionary
  const dictionary = await getDictionary(parsedLocale);

  // Get facilities section data
  const rawData = dictionary.web.sections.facilities;

  // Format data
  const data = {
    description: rawData.description,
    items: rawData.items.map(
      (item: (typeof rawData.items)[number] & { image?: string }) => ({
        ...item,
        image: item.image || "/images/court.jpg",
      })
    ),
    title: rawData.title,
  };

  return (
    <section className="bg-muted/50 px-4 py-24 sm:px-6 lg:px-8" id="facilities">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
            {data.description}
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {data.items.map((facility, index) => (
            <div
              className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
              key={facility.title}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="bg-muted relative aspect-3/2 overflow-hidden rounded-lg">
                  <Image
                    alt={facility.title}
                    className="object-cover"
                    fill
                    src={facility.image || "/placeholder.svg"}
                  />
                </div>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <h3 className="text-foreground text-xl font-semibold">
                  {facility.title}
                </h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  {facility.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
