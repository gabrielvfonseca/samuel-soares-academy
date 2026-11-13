import { z } from "zod";

export const FacilitySchema = z.object({
  description: z.string(),
  image: z.string(),
  title: z.string(),
});

export const FacilitiesSchema = z.array(FacilitySchema);

export type Facility = z.infer<typeof FacilitySchema>;
export type Facilities = z.infer<typeof FacilitiesSchema>;

export const FacilitiesSectionSchema = z.object({
  description: z.string(),
  items: FacilitiesSchema,
  title: z.string(),
});

export type FacilitiesSection = z.infer<typeof FacilitiesSectionSchema>;
