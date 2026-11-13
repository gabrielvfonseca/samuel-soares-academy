import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "@repo/ui/icons";
import { localeSchema } from "@repo/validation/locale";
import Image from "next/image";
import type { JSX } from "react";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function CtaSection({
  lang = "pt",
}: SectionProps): Promise<JSX.Element> {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw cta section
  const rawData = dictionary.web.sections.cta;

  // Build cta section
  const data = {
    buttons: [
      {
        href: "#contact",
        label: rawData.primaryCta,
        variant: "secondary" as const,
      },
      {
        href: "tel:+351912345678",
        label: rawData.secondaryCta,
        variant: "ghost" as const,
      },
    ],
    description: rawData.description,
    image: {
      alt: rawData.image?.alt || rawData.title,
      src: rawData.image?.src || "/images/team_cta.JPG",
    },
    title: rawData.title,
  };

  return (
    <section className="bg-foreground text-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {data.title}
            </h2>
            <p className="text-background/70 mt-6 leading-relaxed text-pretty">
              {data.description}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {data.buttons.map((button, index) => (
                <Button
                  asChild
                  className={
                    button.variant === "ghost"
                      ? "text-background hover:text-background hover:bg-background/10"
                      : ""
                  }
                  key={index}
                  size="lg"
                  variant={button.variant}
                >
                  <a className="gap-2" href={button.href}>
                    {button.label}
                    {index === 0 && <ArrowRight className="size-4" />}
                  </a>
                </Button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-background/10 relative aspect-4/3 overflow-hidden rounded-lg">
              <Image
                alt={data.image.alt}
                className="object-cover"
                fill
                src={data.image.src || "/placeholder.svg?height=400&width=600"}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
