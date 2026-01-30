import { z } from "zod";

export const CoachSchema = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  image: z.string(),
});

export const CoachesSchema = z.array(CoachSchema);

export type Coach = z.infer<typeof CoachSchema>;
export type Coaches = z.infer<typeof CoachesSchema>;

export const CoachesSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: CoachesSchema,
});

export type CoachesSection = z.infer<typeof CoachesSectionSchema>;
