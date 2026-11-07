import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@repo/validation/locale";
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
    title: rawData.title,
    description: rawData.description,
    items: rawData.items.map((item: any) => ({
      ...item,
      image: item.image || "/images/court.jpg",
    })),
  };

  return (
    <section id="facilities" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {data.title}
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {data.items.map((facility, index) => (
            <div
              key={facility.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="relative aspect-3/2 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <h3 className="text-xl font-semibold text-foreground">{facility.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{facility.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
