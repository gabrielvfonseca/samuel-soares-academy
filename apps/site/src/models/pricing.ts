import { z } from "zod";

export const PricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  popular: z.boolean().default(false),
  hidePeriod: z.boolean().default(false).optional(),
});

export const PricingPlansSchema = z.array(PricingPlanSchema);

export type PricingPlan = z.infer<typeof PricingPlanSchema>;
export type PricingPlans = z.infer<typeof PricingPlansSchema>;

export const PricingSectionSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    items: PricingPlansSchema,
    note: z.string().optional(),
    footer: z.string().optional(),
    cta: z.string(),
    popularBadge: z.string(),
    monthSuffix: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    note: data.note ?? data.footer ?? "",
  }));

export type PricingSection = z.infer<typeof PricingSectionSchema>;
