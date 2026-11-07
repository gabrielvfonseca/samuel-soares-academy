import { Button } from "@repo/ui/components/button";
import { Check } from "@repo/ui/icons";
import { cn } from "@repo/ui/lib/utils";
import { localeSchema } from "@repo/validation/locale";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function PricingSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw data for pricing section
  const rawData = dictionary.web.sections.pricing;

  // Set pricing section data
  const data = {
    cta: rawData.cta,
    description: rawData.description,
    items: rawData.items,
    monthSuffix: rawData.monthSuffix,
    note: rawData.footer || "",
    title: rawData.title,
  };

  return (
    <section
      className="bg-muted/50 overflow-x-hidden px-4 py-24 sm:px-6 lg:px-8"
      id="pricing"
    >
      <div className="mx-auto max-w-5xl min-w-0">
        <div className="max-w-xl">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
            {data.description}
          </p>
        </div>

        <div className="mt-12 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
          {data.items.map((plan, index) => {
            const isLast = index === data.items.length - 1;

            return (
              <div
                className={cn(
                  "bg-background border-border relative flex min-w-0 flex-col overflow-hidden rounded-xl border p-6 sm:p-7",
                  isLast ? "md:col-span-2" : "col-span-1"
                )}
                key={plan.name}
              >
                {isLast ? (
                  <>
                    <div className="flex min-w-0 flex-1 flex-col gap-6 md:flex-row md:items-start md:gap-0">
                      <div className="border-border/60 flex min-w-0 shrink-0 flex-col border-b pr-0 pb-6 md:border-r md:border-b-0 md:pr-8 md:pb-0 lg:pr-10">
                        <h3 className="text-foreground text-xl font-semibold wrap-break-word md:text-2xl">
                          {plan.name}
                        </h3>
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed wrap-break-word md:max-w-[280px]">
                          {plan.description}
                        </p>
                        <div className="mt-5 flex flex-wrap items-baseline gap-1.5 md:mb-6">
                          <span className="text-foreground text-4xl font-bold tracking-tight wrap-break-word md:text-4xl">
                            {plan.price}
                          </span>
                          {!plan.hidePeriod && data.monthSuffix && (
                            <span className="text-muted-foreground text-sm font-medium">
                              {data.monthSuffix}
                            </span>
                          )}
                        </div>
                      </div>
                      <ul className="flex min-w-0 flex-1 flex-col gap-3 md:mt-6 md:pl-8 lg:grid">
                        {plan.features.map((feature: string) => (
                          <li
                            className="flex min-w-0 items-center gap-3 text-sm"
                            key={feature}
                          >
                            <span className="bg-primary/10 flex size-5 shrink-0 items-center justify-center rounded-full">
                              <Check
                                aria-hidden="true"
                                className="text-primary size-3 shrink-0"
                                strokeWidth={2.5}
                              />
                            </span>
                            <span className="text-muted-foreground min-w-0 wrap-break-word">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:border-border/60 min-w-0 pt-6 md:border-t">
                      <Button
                        asChild
                        className="w-full min-w-0 md:w-fit md:min-w-[160px]"
                        variant="outline"
                      >
                        <Link href="#contact">{data.cta}</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <div className="border-border/60 flex min-w-0 flex-col border-b pb-6">
                        <h3 className="text-foreground text-lg font-semibold wrap-break-word">
                          {plan.name}
                        </h3>
                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed wrap-break-word">
                          {plan.description}
                        </p>
                        <div className="mt-5 flex flex-wrap items-baseline gap-1.5">
                          <span className="text-foreground text-4xl font-bold tracking-tight wrap-break-word">
                            {plan.price}
                          </span>
                          {!plan.hidePeriod && data.monthSuffix && (
                            <span className="text-muted-foreground text-sm font-medium">
                              {data.monthSuffix}
                            </span>
                          )}
                        </div>
                      </div>
                      <ul className="mt-6 flex min-w-0 flex-1 flex-col gap-3">
                        {plan.features.map((feature: string) => (
                          <li
                            className="flex min-w-0 items-center gap-3 text-sm"
                            key={feature}
                          >
                            <span className="bg-primary/10 flex size-5 shrink-0 items-center justify-center rounded-full">
                              <Check
                                aria-hidden="true"
                                className="text-primary size-3 shrink-0"
                                strokeWidth={2.5}
                              />
                            </span>
                            <span className="text-muted-foreground min-w-0 wrap-break-word">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto min-w-0 pt-6">
                      <Button
                        asChild
                        className="w-full min-w-0 md:w-fit md:min-w-[160px]"
                        variant="outline"
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

        <p className="text-muted-foreground mt-8 text-sm">{data.note}</p>
      </div>
    </section>
  );
}
