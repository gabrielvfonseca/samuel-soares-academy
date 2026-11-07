import { z } from "zod";

export const contactInfoSchema = z.object({
  href: z.string().optional(),
  label: z.string(),
  value: z.string(),
});

export const contactInfoListSchema = z.array(contactInfoSchema);

export const contactFormSchema = z.object({
  childAge: z.string().min(1, "A idade do atleta é obrigatória"),
  club: z.string().optional(),
  contactMethod: z.enum(["email", "whatsapp"]).default("email"),
  email: z.string().email("Email inválido"),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(9, "O telefone deve ter pelo menos 9 dígitos"),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;

export const contactSectionSchema = z.object({
  description: z.string(),
  form: z.object({
    ageLabel: z.string(),
    agePlaceholder: z.string(),
    clubLabel: z.string(),
    clubPlaceholder: z.string(),
    description: z.string(),
    emailLabel: z.string(),
    emailPlaceholder: z.string(),
    errorMessage: z.string(),
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
  }),
  info: contactInfoListSchema,
  title: z.string(),
});

export type ContactSection = z.infer<typeof contactSectionSchema>;
