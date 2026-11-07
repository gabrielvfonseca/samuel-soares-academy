import { localeSchema } from "@repo/validation/locale";
import Image from "next/image";
import type { JSX } from "react";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function CoachesSection({
  lang = "pt",
}: SectionProps): Promise<JSX.Element> {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw coaches section
  const rawData = dictionary.web.sections.coaches;

  // Build coaches section
  const data = {
    description: rawData.description,
    items: rawData.items.map((item) => ({
      bio: item.bio,
      image: item.image,
      name: item.name,
      role: item.role,
    })),
    title: rawData.title,
  };

  return (
    <section
      className="border-border border-t px-4 py-24 sm:px-6 lg:px-8"
      id="coaches"
    >
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
            {data.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {data.items.map((coach) => (
            <div className="group" key={coach.name}>
              <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
                <Image
                  alt={`Foto de ${coach.name} - ${coach.role}`}
                  className="object-cover transition-all duration-300"
                  fill
                  src={coach.image || "/placeholder.svg"}
                />
              </div>
              <div className="mt-4">
                <h3 className="text-foreground font-semibold">{coach.name}</h3>
                <p className="text-muted-foreground text-sm">{coach.role}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {coach.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
