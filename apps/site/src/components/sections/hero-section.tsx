import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "@repo/ui/icons";
import { localeSchema } from "@repo/validation/locale";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function HeroSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parseLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parseLang);

  // Get raw hero section
  const rawData = dictionary.web.sections.hero;

  // Format hero data
  const data = {
    badge: rawData.badge,
    buttons: [
      {
        href: "#contact",
        label: rawData.primaryCta,
        variant: "default" as const,
      },
      {
        href: "#training",
        label: rawData.secondaryCta,
        variant: "ghost" as const,
      },
    ],
    description: rawData.description,
    image: rawData.image,
    title: rawData.title,
  };

  return (
    <section className="bg-background px-4 pt-28 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-muted-foreground mb-4 text-sm font-medium tracking-widest uppercase">
            {data.badge}
          </p>
          <h1 className="text-foreground text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
            {data.description}
          </p>
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
            {data.buttons
              .filter((button) => button.label)
              .map((button, index) => (
                <Button asChild key={index} size="lg" variant={button.variant}>
                  <a className="gap-2" href={button.href}>
                    {button.label}
                    {index === 0 && <ArrowRight className="size-4" />}
                  </a>
                </Button>
              ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="bg-muted relative aspect-16/9 overflow-hidden rounded-lg">
            <Image
              alt={data.image.alt}
              className="object-cover"
              fill
              priority
              src={data.image.src}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
