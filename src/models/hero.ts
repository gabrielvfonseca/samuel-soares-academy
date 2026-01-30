import { z } from "zod";
import { ButtonSchema, SectionImageDataSchema } from "./cta";

export const HeroSchema = z.object({
  badge: z.string(),
  title: z.string(),
  description: z.string(),
  buttons: z.array(ButtonSchema),
  image: SectionImageDataSchema,
});

export type Hero = z.infer<typeof HeroSchema>;
