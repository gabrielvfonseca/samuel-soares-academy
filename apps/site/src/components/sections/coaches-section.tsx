import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";
import { localeSchema } from "@repo/validation/locale";
import type { JSX } from "react";

export async function CoachesSection({ lang = "pt" }: SectionProps): Promise<JSX.Element> {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw coaches section
  const rawData = dictionary.web.sections.coaches;

  // Build coaches section
  const data = {
    title: rawData.title,
    description: rawData.description,
    items: rawData.items.map((item) => ({
      name: item.name,
      role: item.role,
      bio: item.bio,
      image: item.image,
    })),
  };

  return (
    <section id="coaches" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {data.title}
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {data.items.map((coach) => (
            <div key={coach.name} className="group">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src={coach.image || "/placeholder.svg"}
                  alt={`Foto de ${coach.name} - ${coach.role}`}
                  fill
                  className="object-cover transition-all duration-300"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-foreground">{coach.name}</h3>
                <p className="text-sm text-muted-foreground">{coach.role}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{coach.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
