import { z } from "zod";

export const ButtonSchema = z.object({
  href: z.string(),
  label: z.string(),
  variant: z
    .enum(["default", "secondary", "ghost", "outline", "destructive", "link"])
    .optional(),
});

export const SectionImageDataSchema = z.object({
  alt: z.string(),
  src: z.string(),
});

export const CtaSchema = z.object({
  buttons: z.array(ButtonSchema),
  description: z.string(),
  image: SectionImageDataSchema,
  title: z.string(),
});

export type Cta = z.infer<typeof CtaSchema>;
