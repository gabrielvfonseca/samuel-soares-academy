import { z } from "zod";

export const FeatureSchema = z.object({
  description: z.string(),
  number: z.string(),
  title: z.string(),
});

export const FeaturesSchema = z.array(FeatureSchema);

export type Feature = z.infer<typeof FeatureSchema>;
