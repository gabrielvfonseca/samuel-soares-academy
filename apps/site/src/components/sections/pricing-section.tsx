import { Check } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/button";
import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@repo/validation/locale";
import type { SectionProps } from "@/types";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

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
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50 overflow-x-hidden">
      <div className="max-w-5xl mx-auto min-w-0">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {data.title}
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          {data.items.map((plan, index) => {
            const isLast = index === data.items.length - 1;

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex min-w-0 flex-col overflow-hidden p-6 sm:p-7 bg-background border border-border rounded-xl",
                  isLast ? "md:col-span-2" : "col-span-1",
                )}
              >
                {isLast ? (
                  <>
                    <div className="flex min-w-0 flex-1 flex-col gap-6 md:flex-row md:items-start md:gap-0">
                      <div className="flex min-w-0 shrink-0 flex-col border-b border-border/60 pb-6 pr-0 md:border-b-0 md:border-r md:pb-0 md:pr-8 lg:pr-10">
                        <h3 className="text-xl font-semibold text-foreground wrap-break-word md:text-2xl">
                          {plan.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed wrap-break-word md:max-w-[280px]">
                          {plan.description}
                        </p>
                        <div className="mt-5 flex flex-wrap md:mb-6 items-baseline gap-1.5">
                          <span className="text-4xl font-bold tracking-tight text-foreground wrap-break-word md:text-4xl">
                            {plan.price}
                          </span>
                          {!plan.hidePeriod && data.monthSuffix && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {data.monthSuffix}
                            </span>
                          )}
                        </div>
                      </div>
                      <ul className="flex min-w-0 flex-1 flex-col gap-3 md:mt-6 md:pl-8 lg:grid">
                        {plan.features.map((feature: string) => (
                          <li key={feature} className="flex min-w-0 items-center gap-3 text-sm">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check
                                className="size-3 shrink-0 text-primary"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              />
                            </span>
                            <span className="min-w-0 wrap-break-word text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="min-w-0 md:border-t md:border-border/60 pt-6">
                      <Button
                        className="w-full min-w-0 md:w-fit md:min-w-[160px]"
                        variant="outline"
                        asChild
                      >
                        <Link href="#contact">{data.cta}</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <div className="flex min-w-0 flex-col border-b border-border/60 pb-6">
                        <h3 className="text-lg font-semibold text-foreground wrap-break-word">
                          {plan.name}
                        </h3>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed wrap-break-word">
                          {plan.description}
                        </p>
                        <div className="mt-5 flex flex-wrap items-baseline gap-1.5">
                          <span className="text-4xl font-bold tracking-tight text-foreground wrap-break-word">
                            {plan.price}
                          </span>
                          {!plan.hidePeriod && data.monthSuffix && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {data.monthSuffix}
                            </span>
                          )}
                        </div>
                      </div>
                      <ul className="mt-6 flex min-w-0 flex-1 flex-col gap-3">
                        {plan.features.map((feature: string) => (
                          <li key={feature} className="flex min-w-0 items-center gap-3 text-sm">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check
                                className="size-3 shrink-0 text-primary"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              />
                            </span>
                            <span className="min-w-0 wrap-break-word text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto min-w-0 pt-6">
                      <Button
                        className="w-full min-w-0 md:w-fit md:min-w-[160px]"
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
