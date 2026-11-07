"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { ClientOnly } from "@/components/client-only";
import type { FaqSection } from "@/models/faq";

interface FaqAccordionClientProps {
  items: FaqSection["items"];
}

/** Renders Accordion only after mount to avoid Radix ID hydration mismatch. */
export function FaqAccordionClient({ items }: FaqAccordionClientProps) {
  // Accordion client fallback
  const fallback = (
    <div className="mt-12 space-y-4" data-slot="accordion-fallback">
      {items.map((faq, index) => (
        <div
          className="border-border border-b pb-4 last:border-b-0"
          key={index}
        >
          <p className="text-foreground py-2 text-left text-sm font-medium">
            {faq.question}
          </p>
          <p className="text-muted-foreground pb-2 text-sm leading-relaxed">
            {faq.answer}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <ClientOnly fallback={fallback}>
      <Accordion className="mt-12" collapsible type="single">
        {items.map((faq, index) => (
          <AccordionItem
            className="border-border"
            key={index}
            value={`item-${index}`}
          >
            <AccordionTrigger className="text-foreground py-6 text-left hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ClientOnly>
  );
}
