import { z } from "zod";

export const ButtonSchema = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(["default", "secondary", "ghost", "outline", "destructive", "link"]).optional(),
});

export const SectionImageDataSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

export const CtaSchema = z.object({
  title: z.string(),
  description: z.string(),
  buttons: z.array(ButtonSchema),
  image: SectionImageDataSchema,
});

export type Cta = z.infer<typeof CtaSchema>;
