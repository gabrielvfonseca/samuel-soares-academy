import { ContactInfoFallbacks } from "@/schemas/contact-schema";
import { contactSectionSchema, type ContactSection } from "@/models/contact";
import { z } from "zod";

/** Raw contact section shape from i18n dictionaries (optional values). */
const contactSectionDictionarySchema = z.object({
  title: z.string(),
  description: z.string(),
  info: z.object({
    address: z.string(),
    phone: z.string(),
    email: z.string(),
    schedule: z.string(),
    facebook: z.string(),
    instagram: z.string(),
  }),
  values: z
    .object({
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      schedule: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      facebookHandle: z.string().optional(),
      instagramHandle: z.string().optional(),
    })
    .optional(),
  form: z.object({
    method: z
      .object({
        email: z.string().default("Email"),
        whatsapp: z.string().default("WhatsApp"),
      })
      .default({ email: "Email", whatsapp: "WhatsApp" }),
    name: z.string(),
    namePlaceholder: z.string(),
    email: z.string(),
    emailPlaceholder: z.string(),
    phone: z.string(),
    phonePlaceholder: z.string(),
    childAge: z.string(),
    childAgePlaceholder: z.string(),
    club: z.string(),
    clubPlaceholder: z.string(),
    message: z.string(),
    messagePlaceholder: z.string(),
    submit: z.string(),
    submitEmail: z.string().optional(),
    submitWhatsapp: z.string().optional(),
    submitting: z.string().optional(),
    success: z.string(),
    error: z.string().optional(),
  }),
});

export type ContactSectionDictionary = z.infer<typeof contactSectionDictionarySchema>;

const FORM_MESSAGE_DEFAULTS = {
  submitting: "Enviando...",
  error: "Erro ao enviar mensagem. Por favor, tente novamente.",
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
    title: parsed.title,
    description: parsed.description,
    info: [
      {
        label: parsed.info.address,
        value: address,
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      },
      {
        label: parsed.info.schedule,
        value: schedule,
      },
      {
        label: parsed.info.phone,
        value: phone,
        href: `tel:${phone.replace(/\s/g, "")}`,
      },
      {
        label: parsed.info.email,
        value: email,
        href: `mailto:${email}`,
      },
      {
        label: parsed.info.facebook,
        value: facebookHandle,
        href: facebook,
      },
      {
        label: parsed.info.instagram,
        value: instagramHandle,
        href: instagram,
      },
    ],
    form: {
      title: "",
      description: "",
      nameLabel: parsed.form.name,
      namePlaceholder: parsed.form.namePlaceholder,
      emailLabel: parsed.form.email,
      emailPlaceholder: parsed.form.emailPlaceholder,
      phoneLabel: parsed.form.phone,
      phonePlaceholder: parsed.form.phonePlaceholder,
      ageLabel: parsed.form.childAge,
      agePlaceholder: parsed.form.childAgePlaceholder,
      clubLabel: parsed.form.club,
      clubPlaceholder: parsed.form.clubPlaceholder,
      messageLabel: parsed.form.message,
      messagePlaceholder: parsed.form.messagePlaceholder,
      submitButton: parsed.form.submit,
      submitEmailButton: parsed.form.submitEmail ?? parsed.form.submit,
      submitWhatsappButton: parsed.form.submitWhatsapp ?? parsed.form.submit,
      submittingButton: parsed.form.submitting ?? FORM_MESSAGE_DEFAULTS.submitting,
      successMessage: parsed.form.success,
      errorMessage: parsed.form.error ?? FORM_MESSAGE_DEFAULTS.error,
      whatsappPhone,
      methodEmailLabel: parsed.form.method.email,
      methodWhatsappLabel: parsed.form.method.whatsapp,
    },
  };

  return contactSectionSchema.parse(section);
}
