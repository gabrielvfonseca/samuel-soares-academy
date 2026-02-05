import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@/schemas/locale-schema";
import type { SectionProps } from "@/types";
import { parse } from "path";

export async function StatsSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Set stat items data
  const stats = dictionary.web.sections.stats.items;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-foreground text-background">
      <div className="max-w-5xl mx-auto">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-4xl sm:text-5xl font-semibold tracking-tight">{stat.value}</dd>
              <dt className="mt-2 text-sm text-background/60">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
