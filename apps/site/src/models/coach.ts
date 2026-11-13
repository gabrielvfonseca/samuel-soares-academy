import { z } from "zod";

export const CoachSchema = z.object({
  bio: z.string(),
  image: z.string(),
  name: z.string(),
  role: z.string(),
});

export const CoachesSchema = z.array(CoachSchema);

export type Coach = z.infer<typeof CoachSchema>;
export type Coaches = z.infer<typeof CoachesSchema>;

export const CoachesSectionSchema = z.object({
  description: z.string(),
  items: CoachesSchema,
  title: z.string(),
});

export type CoachesSection = z.infer<typeof CoachesSectionSchema>;
