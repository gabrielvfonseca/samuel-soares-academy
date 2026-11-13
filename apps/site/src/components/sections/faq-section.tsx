import { localeSchema } from "@repo/validation/locale";
import { FaqAccordionClient } from "@/components/sections/faq-accordion-client";
import { getDictionary } from "@/lib/i18n";
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
    <section
      className="border-border border-t px-4 py-24 sm:px-6 lg:px-8"
      id="faq"
    >
      <JsonLd
        code={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: data.items.map((faq) => ({
            "@type": "Question",
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
            name: faq.question,
          })),
        }}
      />
      <div className="mx-auto max-w-3xl">
        <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          {data.title}
        </h2>
        <p className="text-muted-foreground mt-4">{data.description}</p>

        <FaqAccordionClient items={data.items} />
      </div>
    </section>
  );
}
