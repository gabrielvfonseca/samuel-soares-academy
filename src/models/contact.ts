import { z } from "zod";

export const ContactInfoSchema = z.object({
  label: z.string(),
  value: z.string(),
  href: z.string().optional(),
});

export const ContactInfoListSchema = z.array(ContactInfoSchema);

export const ContactFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "O telefone deve ter pelo menos 9 dígitos"),
  childAge: z.string().min(1, "A idade do atleta é obrigatória"),
  club: z.string().optional(),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type ContactForm = z.infer<typeof ContactFormSchema>;

export const ContactSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  info: ContactInfoListSchema,
  form: z.object({
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
    submittingButton: z.string(),
    successMessage: z.string(),
    errorMessage: z.string(),
    whatsappPhone: z.string().optional(),
  }),
});

export type ContactSection = z.infer<typeof ContactSectionSchema>;
