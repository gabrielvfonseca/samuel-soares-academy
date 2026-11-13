import { z } from "zod";
import { localeSchema } from "./locale";

export const contactInfoFallbacksSchema = z.object({
  address: z.string(),
  email: z.string(),
  facebook: z.string(),
  facebookHandle: z.string(),
  instagram: z.string(),
  instagramHandle: z.string(),
  phone: z.string(),
  schedule: z.string(),
});

export type ContactInfoFallbacks = z.infer<typeof contactInfoFallbacksSchema>;

export const contactFormPropsSchema = z.object({
  ageLabel: z.string(),
  agePlaceholder: z.string(),
  clubLabel: z.string(),
  clubPlaceholder: z.string(),
  description: z.string(),
  emailLabel: z.string(),
  emailPlaceholder: z.string(),
  errorMessage: z.string(),
  lang: localeSchema.optional(),
  messageLabel: z.string(),
  messagePlaceholder: z.string(),
  methodEmailLabel: z.string(),
  methodWhatsappLabel: z.string(),
  nameLabel: z.string(),
  namePlaceholder: z.string(),
  phoneLabel: z.string(),
  phonePlaceholder: z.string(),
  submitButton: z.string(),
  submitEmailButton: z.string(),
  submittingButton: z.string(),
  submitWhatsappButton: z.string(),
  successMessage: z.string(),
  title: z.string(),
  whatsappPhone: z.string().optional(),
});

export type ContactFormProps = z.infer<typeof contactFormPropsSchema>;

export const contactSubmitResultSchema = z.object({
  details: z
    .record(z.string(), z.union([z.array(z.string()), z.string()]))
    .optional(),
  error: z.string().optional(),
  message: z.string(),
  payload: z.record(z.unknown()).optional(),
  success: z.boolean(),
  whatsappUrl: z.string().optional(),
});

export type ContactSubmitResult = z.infer<typeof contactSubmitResultSchema>;

/** @deprecated Use contactSubmitResultSchema */
export const ContactSubmitResultSchema = contactSubmitResultSchema;
