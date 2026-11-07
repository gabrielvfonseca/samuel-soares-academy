import { z } from "zod";

export const TestimonialSchema = z.object({
  author: z.string(),
  image: z.string(),
  quote: z.string(),
  role: z.string(),
});

export const TestimonialsSchema = z.array(TestimonialSchema);

export type Testimonial = z.infer<typeof TestimonialSchema>;
export type Testimonials = z.infer<typeof TestimonialsSchema>;

export const TestimonialsSectionSchema = z.object({
  description: z.string(),
  items: TestimonialsSchema,
  title: z.string(),
});

export type TestimonialsSection = z.infer<typeof TestimonialsSectionSchema>;
