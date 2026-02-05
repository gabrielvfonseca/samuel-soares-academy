import { FaqAccordionClient } from "@/components/sections/faq-accordion-client";
import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@/schemas/locale-schema";
import { JsonLd } from "@/lib/json-ld";
import type { SectionProps } from "@/types";

export async function FaqSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get faq section raw
  const data = dictionary.web.sections.faq;

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <JsonLd
        code={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: data.items.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
          {data.title}
        </h2>
        <p className="mt-4 text-muted-foreground">{data.description}</p>

        <FaqAccordionClient items={data.items} />
      </div>
    </section>
  );
}
