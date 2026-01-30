import { z } from "zod";

export const TestimonialSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string(),
  image: z.string(),
});

export const TestimonialsSchema = z.array(TestimonialSchema);

export type Testimonial = z.infer<typeof TestimonialSchema>;
export type Testimonials = z.infer<typeof TestimonialsSchema>;

export const TestimonialsSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: TestimonialsSchema,
});

export type TestimonialsSection = z.infer<typeof TestimonialsSectionSchema>;
