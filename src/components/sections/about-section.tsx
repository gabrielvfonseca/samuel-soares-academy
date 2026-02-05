import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@/schemas/locale-schema";
import type { SectionProps } from "@/types";

export async function AboutSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw data for about section
  const data = dictionary.web.sections.about;

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="relative aspect-[4/5] bg-muted rounded-lg overflow-hidden">
              <Image
                src="/images/samu_about.JPG"
                alt="Samuel Soares - Fundador da Academia"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              {data.title}
            </h2>
            <p className="mt-6 text-muted-foreground text-pretty leading-relaxed">
              {data.description1}
            </p>
            <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">
              {data.description2}
            </p>

            <div className="mt-10 space-y-6">
              {data.features.map((feature) => (
                <div key={feature.title} className="flex gap-6">
                  <span className="text-sm font-mono text-muted-foreground">{feature.number}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
