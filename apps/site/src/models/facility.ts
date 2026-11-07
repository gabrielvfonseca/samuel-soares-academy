import { z } from "zod";

export const FacilitySchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string(),
});

export const FacilitiesSchema = z.array(FacilitySchema);

export type Facility = z.infer<typeof FacilitySchema>;
export type Facilities = z.infer<typeof FacilitiesSchema>;

export const FacilitiesSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: FacilitiesSchema,
});

export type FacilitiesSection = z.infer<typeof FacilitiesSectionSchema>;
