import Image from "next/image";
import { fetchApi } from "@/lib/api-client";
import type { CoachesSection as CoachesSectionData } from "@/models/coach";
import type { Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function CoachesSection({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<CoachesSectionData>("/api/coaches", lang as Locale);

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

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.items.map((coach) => (
            <div key={coach.name} className="group">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src={coach.image || "/placeholder.svg"}
                  alt={`Foto de ${coach.name} - ${coach.role}`}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
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
