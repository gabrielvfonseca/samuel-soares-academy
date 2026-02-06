import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@/schemas/locale-schema";
import type { SectionProps } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export async function PricingSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw data for pricing section
  const rawData = dictionary.web.sections.pricing;

  // Set pricing section data
  const data = {
    title: rawData.title,
    description: rawData.description,
    cta: rawData.cta,
    monthSuffix: rawData.monthSuffix,
    note: rawData.footer || "",
    items: rawData.items,
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {data.title}
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.items.map((plan, index) => {
            const isLast = index === data.items.length - 1;

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col p-6 sm:p-7 bg-background border border-border rounded-xl",
                  isLast ? "col-span-2" : "col-span-1"
                )}
              >
                {isLast ? (
                  <>
                    <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
                      <div className="flex shrink-0 flex-col border-border/60 pr-0 sm:border-r sm:pr-8 md:pr-10">
                        <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                          {plan.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed sm:max-w-[280px]">
                          {plan.description}
                        </p>
                        <div className="mt-5 pb-6 flex items-baseline gap-1.5">
                          <span className="text-4xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {plan.price}
                          </span>
                          {!plan.hidePeriod && data.monthSuffix && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {data.monthSuffix}
                            </span>
                          )}
                        </div>
                      </div>
                      <ul className="flex flex-1 flex-col gap-3 sm:pl-8 md:grid">
                        {plan.features.map((feature: string) => (
                          <li key={feature} className="flex items-center gap-3 text-sm">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check
                                className="size-3 text-primary"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              />
                            </span>
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t border-border/60 pt-6">
                      <Button
                        className="w-full sm:w-fit sm:min-w-[160px]"
                        variant="outline"
                        asChild
                      >
                        <Link href="#contact">{data.cta}</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="flex flex-col border-b border-border/60 pb-6">
                        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                          {plan.description}
                        </p>
                        <div className="mt-5 flex items-baseline gap-1.5">
                          <span className="text-4xl font-bold tracking-tight text-foreground">
                            {plan.price}
                          </span>
                          {!plan.hidePeriod && data.monthSuffix && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {data.monthSuffix}
                            </span>
                          )}
                        </div>
                      </div>
                      <ul className="mt-6 flex flex-1 flex-col gap-3">
                        {plan.features.map((feature: string) => (
                          <li key={feature} className="flex items-center gap-3 text-sm">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check
                                className="size-3 text-primary"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              />
                            </span>
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto pt-6">
                      <Button
                        className="w-full sm:w-fit sm:min-w-[160px]"
                        variant="outline"
                        asChild
                      >
                        <Link href="#contact">{data.cta}</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">{data.note}</p>
      </div>
    </section>
  );
}
