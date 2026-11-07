import { z } from "zod";
import { localeSchema } from "./locale";

export const contactInfoFallbacksSchema = z.object({
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  schedule: z.string(),
  facebook: z.string(),
  instagram: z.string(),
  facebookHandle: z.string(),
  instagramHandle: z.string(),
});

export type ContactInfoFallbacks = z.infer<typeof contactInfoFallbacksSchema>;

export const contactFormPropsSchema = z.object({
  title: z.string(),
  description: z.string(),
  nameLabel: z.string(),
  namePlaceholder: z.string(),
  emailLabel: z.string(),
  emailPlaceholder: z.string(),
  phoneLabel: z.string(),
  phonePlaceholder: z.string(),
  ageLabel: z.string(),
  agePlaceholder: z.string(),
  clubLabel: z.string(),
  clubPlaceholder: z.string(),
  messageLabel: z.string(),
  messagePlaceholder: z.string(),
  submitButton: z.string(),
  submitEmailButton: z.string(),
  submitWhatsappButton: z.string(),
  submittingButton: z.string(),
  successMessage: z.string(),
  errorMessage: z.string(),
  whatsappPhone: z.string().optional(),
  methodEmailLabel: z.string(),
  methodWhatsappLabel: z.string(),
  lang: localeSchema.optional(),
});

export type ContactFormProps = z.infer<typeof contactFormPropsSchema>;

export const contactSubmitResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  payload: z.record(z.unknown()).optional(),
  whatsappUrl: z.string().optional(),
  error: z.string().optional(),
  details: z.record(z.string(), z.union([z.array(z.string()), z.string()])).optional(),
});

export type ContactSubmitResult = z.infer<typeof contactSubmitResultSchema>;

/** @deprecated Use contactSubmitResultSchema */
export const ContactSubmitResultSchema = contactSubmitResultSchema;
