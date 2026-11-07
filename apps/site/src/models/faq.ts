import { z } from "zod";

export const FaqSchema = z.object({
  answer: z.string(),
  question: z.string(),
});

export const FaqsSchema = z.array(FaqSchema);

export type Faq = z.infer<typeof FaqSchema>;
export type Faqs = z.infer<typeof FaqsSchema>;

export const FaqSectionSchema = z.object({
  description: z.string(),
  items: FaqsSchema,
  title: z.string(),
});

export type FaqSection = z.infer<typeof FaqSectionSchema>;
