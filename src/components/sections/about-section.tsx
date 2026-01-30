import Image from "next/image";
import { fetchApi } from "@/lib/api-client";
import type { About } from "@/models/about";
import type { Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function AboutSection({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<About>("/api/about", lang as Locale);

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="relative aspect-[4/5] bg-muted rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=600&width=480"
                alt="Treinador a ensinar criancas no campo"
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
