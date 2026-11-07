import { z } from "zod";

export const TrainingModalitySchema = z.object({
  age: z.string(),
  description: z.string(),
  schedule: z.string(),
  title: z.string(),
});

export const TrainingModalitiesSchema = z.array(TrainingModalitySchema);

export type TrainingModality = z.infer<typeof TrainingModalitySchema>;
export type TrainingModalities = z.infer<typeof TrainingModalitiesSchema>;

export const TrainingSectionSchema = z.object({
  description: z.string(),
  items: TrainingModalitiesSchema,
  title: z.string(),
});

export type TrainingSection = z.infer<typeof TrainingSectionSchema>;
