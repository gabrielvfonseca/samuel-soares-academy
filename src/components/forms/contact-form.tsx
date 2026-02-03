"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitContactForm } from "@/app/actions/contact";
import { getDictionary, type Locale } from "@/lib/i18n";

interface ContactFormProps {
  title: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  ageLabel: string;
  agePlaceholder: string;
  clubLabel: string;
  clubPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitButton: string;
  submittingButton: string;
  successMessage: string;
  errorMessage: string;
  whatsappPhone?: string;
  lang?: Locale;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  childAge: string;
  club: string;
  message: string;
}

export function ContactForm(props: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    childAge: "",
    club: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData, props.lang);

      if (!result.success) {
        // If we have validation details, show them
        if (result.details?.fieldErrors) {
          const fieldErrors = result.details.fieldErrors as Record<string, string[]>;
          const firstErrorField = Object.keys(fieldErrors)[0];
          const firstErrorMessage = fieldErrors[firstErrorField]?.[0];
          throw new Error(firstErrorMessage || result.error || "Algo correu mal.");
        }
        throw new Error(result.error || "Algo correu mal.");
      }

      toast.success(props.successMessage);

      // Construct and open WhatsApp link
      if (props.whatsappPhone) {
        const message = `*Nova Inscrição*

*Nome:* ${formData.name}
*Email:* ${formData.email}
*Telefone:* ${formData.phone}
*Idade do Atleta:* ${formData.childAge}
*Clube:* ${formData.club || "Não informado"}

*Mensagem:*
${formData.message}

---
Recebido via formulário de contacto - Samuel Soares Academy`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${props.whatsappPhone.replace(/[^\d]/g, "")}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
      }

      setFormData({ name: "", email: "", phone: "", childAge: "", club: "", message: "" });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error instanceof Error ? error.message : props.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm text-muted-foreground mb-2">
            {props.nameLabel}
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            aria-required="true"
            disabled={isSubmitting}
            value={formData.name}
            onChange={handleChange}
            placeholder={props.namePlaceholder}
            className="bg-background"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-muted-foreground mb-2">
            {props.emailLabel}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            aria-required="true"
            disabled={isSubmitting}
            value={formData.email}
            onChange={handleChange}
            placeholder={props.emailPlaceholder}
            className="bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm text-muted-foreground mb-2">
            {props.phoneLabel}
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            aria-required="true"
            disabled={isSubmitting}
            value={formData.phone}
            onChange={handleChange}
            placeholder={props.phonePlaceholder}
            className="bg-background"
          />
        </div>
        <div>
          <label htmlFor="childAge" className="block text-sm text-muted-foreground mb-2">
            {props.ageLabel}
          </label>
          <Input
            id="childAge"
            name="childAge"
            type="text"
            required
            aria-required="true"
            disabled={isSubmitting}
            value={formData.childAge}
            onChange={handleChange}
            placeholder={props.agePlaceholder}
            className="bg-background"
          />
        </div>
      </div>

      <div>
        <label htmlFor="club" className="block text-sm text-muted-foreground mb-2">
          {props.clubLabel}
        </label>
        <Input
          id="club"
          name="club"
          type="text"
          disabled={isSubmitting}
          value={formData.club}
          onChange={handleChange}
          placeholder={props.clubPlaceholder}
          className="bg-background"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-muted-foreground mb-2">
          {props.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          aria-required="true"
          disabled={isSubmitting}
          value={formData.message}
          onChange={handleChange}
          placeholder={props.messagePlaceholder}
          className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm disabled:opacity-50"
        />
      </div>

      <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            {props.submittingButton}
            <Loader2 className="size-4 animate-spin" />
          </>
        ) : (
          <>
            {props.submitButton}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
