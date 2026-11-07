import { z } from "zod";

export const TrainingModalitySchema = z.object({
  title: z.string(),
  age: z.string(),
  description: z.string(),
  schedule: z.string(),
});

export const TrainingModalitiesSchema = z.array(TrainingModalitySchema);

export type TrainingModality = z.infer<typeof TrainingModalitySchema>;
export type TrainingModalities = z.infer<typeof TrainingModalitiesSchema>;

export const TrainingSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: TrainingModalitiesSchema,
});

export type TrainingSection = z.infer<typeof TrainingSectionSchema>;
