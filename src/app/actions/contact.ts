"use server";

import { getDictionary } from "@/lib/i18n";
import { localeSchema, type Locale } from "@/schemas/locale-schema";
import { contactFormSchema, type ContactForm } from "@/models/contact";
import { env } from "@/env";
import type { ContactSubmitResult } from "@/schemas/contact-schema";
import { buildWhatsappMessage } from "@/utils/whatsapp-message";
import consola from "consola";
import { parseError } from "@/lib/error";

export async function submitContactForm(
  formData: ContactForm,
  lang: Locale = "pt"
): Promise<ContactSubmitResult> {
  try {
    // Parse language
    const parseLang = localeSchema.parse(lang);

    // Get success message from dictionary
    const dictionary = await getDictionary(parseLang);

    // Get success message from dictionary
    const successMessage = dictionary.web.sections.contact.form.success;

    // Validate form data
    const result = contactFormSchema.safeParse(formData);

    // If form data is invalid, return error
    if (!result.success) {
      const msg = "Erro de validação";
      return {
        success: false,
        message: msg,
        error: msg,
        details: result.error.flatten().fieldErrors,
      };
    }

    // Build WhatsApp message
    const encodedMessage = encodeURIComponent(buildWhatsappMessage(result.data));
    const whatsappUrl = `https://wa.me/${env.WHATSAPP_BUSINESS_PHONE.replace(/[^\d]/g, "")}?text=${encodedMessage}`;

    consola.success("WhatsApp message built successfully:", whatsappUrl);

    // Return success result
    return {
      success: true,
      message: successMessage,
      payload: result.data,
      whatsappUrl,
    };
  } catch (error) {
    const errorMessage = parseError(error);
    consola.error("Error processing request:", errorMessage);
    const msg = "Erro ao processar o pedido.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}
