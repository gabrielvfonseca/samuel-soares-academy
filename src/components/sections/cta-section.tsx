import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { fetchApi } from "@/lib/api-client";
import type { Cta } from "@/models/cta";
import type { Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function CtaSection({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<Cta>("/api/cta", lang as Locale);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-foreground text-background">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              {data.title}
            </h2>
            <p className="mt-6 text-background/70 text-pretty leading-relaxed">
              {data.description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {data.buttons.map((button, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={button.variant}
                  className={button.variant === "ghost" ? "text-background hover:text-background hover:bg-background/10" : ""}
                  asChild
                >
                  <a href={button.href} className="gap-2">
                    {button.label}
                    {index === 0 && <ArrowRight className="size-4" />}
                  </a>
                </Button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] bg-background/10 rounded-lg overflow-hidden">
              <Image
                src={data.image.src || "/placeholder.svg?height=400&width=600"}
                alt={data.image.alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
