import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@/schemas/locale-schema";
import type { SectionProps } from "@/types";
import type { JSX } from "react";

export async function CtaSection({ lang = "pt" }: SectionProps): Promise<JSX.Element> {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw cta section
  const rawData = dictionary.web.sections.cta;

  // Build cta section
  const data = {
    title: rawData.title,
    description: rawData.description,
    buttons: [
      { label: rawData.primaryCta, href: "#contact", variant: "secondary" as const },
      { label: rawData.secondaryCta, href: "tel:+351912345678", variant: "ghost" as const },
    ],
    image: {
      src: rawData.image?.src || "/images/team_cta.JPG",
      alt: rawData.image?.alt || rawData.title,
    },
  };

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
                  className={
                    button.variant === "ghost"
                      ? "text-background hover:text-background hover:bg-background/10"
                      : ""
                  }
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
            <div className="relative aspect-4/3 bg-background/10 rounded-lg overflow-hidden">
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
