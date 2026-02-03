import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function HeroSection({ lang = "pt" }: SectionProps) {
  const dictionary = await getDictionary(lang as Locale);
  const rawData = dictionary.web.sections.hero;

  const data = {
    badge: rawData.badge,
    title: rawData.title,
    description: rawData.description,
    buttons: [
      { label: rawData.primaryCta, href: "#contact", variant: "default" as const },
      { label: rawData.secondaryCta, href: "#training", variant: "ghost" as const },
    ],
    image: rawData.image,
  };

  return (
    <section className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
            {data.badge}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight text-balance">
            {data.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl text-pretty leading-relaxed">
            {data.description}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
            {data.buttons
              .filter((button) => button.label)
              .map((button, index) => (
                <Button key={index} size="lg" variant={button.variant} asChild>
                  <a href={button.href} className="gap-2">
                    {button.label}
                    {index === 0 && <ArrowRight className="size-4" />}
                  </a>
                </Button>
              ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
            <Image
              src={data.image.src}
              alt={data.image.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
