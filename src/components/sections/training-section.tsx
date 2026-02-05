import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@/schemas/locale-schema";
import type { SectionProps } from "@/types";

export async function TrainingSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Set data training section
  const data = dictionary.web.sections.training;

  return (
    <section id="training" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {data.title}
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {data.items.map((modalidade) => (
            <div
              key={modalidade.title}
              className="bg-background p-6 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-semibold text-foreground">{modalidade.title}</h3>
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {modalidade.age}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-mono">{modalidade.schedule}</p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {modalidade.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
