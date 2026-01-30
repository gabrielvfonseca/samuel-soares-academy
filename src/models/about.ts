import { z } from "zod";
import { FeatureSchema } from "./feature";

export const AboutSchema = z.object({
  title: z.string(),
  description1: z.string(),
  description2: z.string(),
  features: z.array(FeatureSchema),
});

export type About = z.infer<typeof AboutSchema>;
