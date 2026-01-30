import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";
import type { PricingSection as PricingSectionData } from "@/models/pricing";
import type { SectionProps } from "@/types";

export async function PricingSection({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<PricingSectionData>("/api/pricing", lang as Locale);

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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.items.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 bg-background border ${plan.popular ? "border-foreground" : "border-border"} rounded-lg`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 bg-foreground text-background text-xs font-medium px-3 py-1">
                  <span className="sr-only">Plano recomendado:</span>
                  Mais Popular
                </span>
              )}
              <div>
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-semibold text-foreground tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">/mes</span>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="size-4 text-foreground shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-8"
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <a href="#contact">Inscrever Agora</a>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">{data.note}</p>
      </div>
    </section>
  );
}
