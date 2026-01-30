"use client";

import { ClientOnly } from "@/components/client-only";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqSection as FaqSectionData } from "@/models/faq";

interface FaqAccordionClientProps {
  items: FaqSectionData["items"];
}

/** Renders Accordion only after mount to avoid Radix ID hydration mismatch. */
export function FaqAccordionClient({ items }: FaqAccordionClientProps) {
  const fallback = (
    <div className="mt-12 space-y-4" data-slot="accordion-fallback">
      {items.map((faq, index) => (
        <div key={index} className="border-b border-border pb-4 last:border-b-0">
          <p className="text-left text-sm font-medium text-foreground py-2">{faq.question}</p>
          <p className="text-muted-foreground leading-relaxed pb-2 text-sm">{faq.answer}</p>
        </div>
      ))}
    </div>
  );

  return (
    <ClientOnly fallback={fallback}>
      <Accordion type="single" collapsible className="mt-12">
        {items.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-border">
            <AccordionTrigger className="text-left text-foreground hover:no-underline py-6">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ClientOnly>
  );
}
