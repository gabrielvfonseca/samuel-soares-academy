import { localeSchema } from "@repo/validation/locale";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function StatsSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Set stat items data
  const stats = dictionary.web.sections.stats.items;

  return (
    <section className="bg-foreground text-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((stat) => (
            <div className="text-center" key={stat.label}>
              <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {stat.value}
              </dd>
              <dt className="text-background/60 mt-2 text-sm">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
