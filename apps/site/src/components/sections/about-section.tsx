import { localeSchema } from "@repo/validation/locale";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function AboutSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw data for about section
  const data = dictionary.web.sections.about;

  return (
    <section
      className="border-border border-t px-4 py-24 sm:px-6 lg:px-8"
      id="about"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                alt="Samuel Soares - Fundador da Academia"
                className="object-cover"
                fill
                src="/images/samu_about.JPG"
              />
            </div>
          </div>

          <div>
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              {data.title}
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed text-pretty">
              {data.description1}
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
              {data.description2}
            </p>

            <div className="mt-10 space-y-6">
              {data.features.map((feature) => (
                <div className="flex gap-6" key={feature.title}>
                  <span className="text-muted-foreground font-mono text-sm">
                    {feature.number}
                  </span>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
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
