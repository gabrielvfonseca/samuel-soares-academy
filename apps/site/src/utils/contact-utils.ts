import type { ContactInfoFallbacks } from "@repo/validation/contact";
import { z } from "zod";
import { type ContactSection, contactSectionSchema } from "@/models/contact";

/** Raw contact section shape from i18n dictionaries (optional values). */
const contactSectionDictionarySchema = z.object({
  description: z.string(),
  form: z.object({
    childAge: z.string(),
    childAgePlaceholder: z.string(),
    club: z.string(),
    clubPlaceholder: z.string(),
    email: z.string(),
    emailPlaceholder: z.string(),
    error: z.string().optional(),
    message: z.string(),
    messagePlaceholder: z.string(),
    method: z
      .object({
        email: z.string().default("Email"),
        whatsapp: z.string().default("WhatsApp"),
      })
      .default({ email: "Email", whatsapp: "WhatsApp" }),
    name: z.string(),
    namePlaceholder: z.string(),
    phone: z.string(),
    phonePlaceholder: z.string(),
    submit: z.string(),
    submitEmail: z.string().optional(),
    submitting: z.string().optional(),
    submitWhatsapp: z.string().optional(),
    success: z.string(),
  }),
  info: z.object({
    address: z.string(),
    email: z.string(),
    facebook: z.string(),
    instagram: z.string(),
    phone: z.string(),
    schedule: z.string(),
  }),
  title: z.string(),
  values: z
    .object({
      address: z.string().optional(),
      email: z.string().optional(),
      facebook: z.string().optional(),
      facebookHandle: z.string().optional(),
      instagram: z.string().optional(),
      instagramHandle: z.string().optional(),
      phone: z.string().optional(),
      schedule: z.string().optional(),
    })
    .optional(),
});

export type ContactSectionDictionary = z.infer<
  typeof contactSectionDictionarySchema
>;

const FORM_MESSAGE_DEFAULTS = {
  error: "Erro ao enviar mensagem. Por favor, tente novamente.",
  submitting: "Enviando...",
} as const;

/**
 * Parses raw dictionary contact section and builds a validated ContactSection
 * with fallbacks for missing values and derived hrefs for info items.
 */
export function parseContactSection(
  raw: unknown,
  fallbacks: ContactInfoFallbacks,
  whatsappPhone: string | undefined
): ContactSection {
  const parsed = contactSectionDictionarySchema.parse(raw);
  const values = parsed.values ?? {};
  const address = values.address ?? fallbacks.address;
  const phone = values.phone ?? fallbacks.phone;
  const email = values.email ?? fallbacks.email;
  const schedule = values.schedule ?? fallbacks.schedule;
  const facebook = values.facebook ?? fallbacks.facebook;
  const instagram = values.instagram ?? fallbacks.instagram;
  const facebookHandle = values.facebookHandle ?? fallbacks.facebookHandle;
  const instagramHandle = values.instagramHandle ?? fallbacks.instagramHandle;

  const section: ContactSection = {
    description: parsed.description,
    form: {
      ageLabel: parsed.form.childAge,
      agePlaceholder: parsed.form.childAgePlaceholder,
      clubLabel: parsed.form.club,
      clubPlaceholder: parsed.form.clubPlaceholder,
      description: "",
      emailLabel: parsed.form.email,
      emailPlaceholder: parsed.form.emailPlaceholder,
      errorMessage: parsed.form.error ?? FORM_MESSAGE_DEFAULTS.error,
      messageLabel: parsed.form.message,
      messagePlaceholder: parsed.form.messagePlaceholder,
      methodEmailLabel: parsed.form.method.email,
      methodWhatsappLabel: parsed.form.method.whatsapp,
      nameLabel: parsed.form.name,
      namePlaceholder: parsed.form.namePlaceholder,
      phoneLabel: parsed.form.phone,
      phonePlaceholder: parsed.form.phonePlaceholder,
      submitButton: parsed.form.submit,
      submitEmailButton: parsed.form.submitEmail ?? parsed.form.submit,
      submittingButton:
        parsed.form.submitting ?? FORM_MESSAGE_DEFAULTS.submitting,
      submitWhatsappButton: parsed.form.submitWhatsapp ?? parsed.form.submit,
      successMessage: parsed.form.success,
      title: "",
      whatsappPhone,
    },
    info: [
      {
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        label: parsed.info.address,
        value: address,
      },
      {
        label: parsed.info.schedule,
        value: schedule,
      },
      {
        href: `tel:${phone.replace(/\s/gu, "")}`,
        label: parsed.info.phone,
        value: phone,
      },
      {
        href: `mailto:${email}`,
        label: parsed.info.email,
        value: email,
      },
      {
        href: facebook,
        label: parsed.info.facebook,
        value: facebookHandle,
      },
      {
        href: instagram,
        label: parsed.info.instagram,
        value: instagramHandle,
      },
    ],
    title: parsed.title,
  };

  return contactSectionSchema.parse(section);
}
