import { z } from "zod";

export const FaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const FaqsSchema = z.array(FaqSchema);

export type Faq = z.infer<typeof FaqSchema>;
export type Faqs = z.infer<typeof FaqsSchema>;

export const FaqSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: FaqsSchema,
});

export type FaqSection = z.infer<typeof FaqSectionSchema>;
