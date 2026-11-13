import { z } from "zod";
import { ButtonSchema, SectionImageDataSchema } from "./cta";

export const HeroSchema = z.object({
  badge: z.string(),
  buttons: z.array(ButtonSchema),
  description: z.string(),
  image: SectionImageDataSchema,
  title: z.string(),
});

export type Hero = z.infer<typeof HeroSchema>;
