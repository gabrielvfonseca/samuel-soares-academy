import { z } from "zod";
import { FeatureSchema } from "./feature";

export const AboutSchema = z.object({
  description1: z.string(),
  description2: z.string(),
  features: z.array(FeatureSchema),
  title: z.string(),
});

export type About = z.infer<typeof AboutSchema>;
