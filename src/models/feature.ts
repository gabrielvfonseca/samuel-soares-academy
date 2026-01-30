import { z } from "zod";

export const FeatureSchema = z.object({
  number: z.string(),
  title: z.string(),
  description: z.string(),
});

export const FeaturesSchema = z.array(FeatureSchema);

export type Feature = z.infer<typeof FeatureSchema>;
