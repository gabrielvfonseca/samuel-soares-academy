import { z } from "zod";

export const PricingPlanSchema = z.object({
  description: z.string(),
  features: z.array(z.string()),
  hidePeriod: z.boolean().default(false).optional(),
  name: z.string(),
  popular: z.boolean().default(false),
  price: z.string(),
});

export const PricingPlansSchema = z.array(PricingPlanSchema);

export type PricingPlan = z.infer<typeof PricingPlanSchema>;
export type PricingPlans = z.infer<typeof PricingPlansSchema>;

export const PricingSectionSchema = z
  .object({
    cta: z.string(),
    description: z.string(),
    footer: z.string().optional(),
    items: PricingPlansSchema,
    monthSuffix: z.string().optional(),
    note: z.string().optional(),
    popularBadge: z.string(),
    title: z.string(),
  })
  .transform((data) => ({
    ...data,
    note: data.note ?? data.footer ?? "",
  }));

export type PricingSection = z.infer<typeof PricingSectionSchema>;
