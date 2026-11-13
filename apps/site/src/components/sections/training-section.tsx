import { localeSchema } from "@repo/validation/locale";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function TrainingSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Set data training section
  const data = dictionary.web.sections.training;

  return (
    <section className="bg-muted/50 px-4 py-24 sm:px-6 lg:px-8" id="training">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
            {data.description}
          </p>
        </div>

        <div className="bg-border mt-12 grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((modalidade) => (
            <div
              className="bg-background hover:bg-muted/30 p-6 transition-colors"
              key={modalidade.title}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-foreground font-semibold">
                  {modalidade.title}
                </h3>
                <span className="text-muted-foreground shrink-0 text-xs font-medium">
                  {modalidade.age}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                {modalidade.schedule}
              </p>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                {modalidade.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
