"use server";

import { getDictionary } from "@/lib/i18n";
import { localeSchema, type Locale } from "@/schemas/locale-schema";
import { contactFormSchema, type ContactForm } from "@/models/contact";
import { env } from "@/env";
import type { ContactSubmitResult } from "@/schemas/contact-schema";
import { buildWhatsappMessage } from "@/utils/whatsapp-message";
import consola from "consola";
import { parseError } from "@/lib/error";
import { Resend } from "resend";
import { ContactConfirmationEmail } from "@/emails/contact-confirmation";
import { ContactNotificationEmail } from "@/emails/contact-notification";

const resend = new Resend(env.RESEND_API_KEY);

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

    const { contactMethod, name, email } = result.data;
    const templates = dictionary.web.sections.contact.form.templates;

    if (templates) {
      try {
        // 1. Always send notification to admin
        await resend.emails.send({
          from: env.CONTACT_EMAIL_FROM,
          to: env.CONTACT_EMAIL_TO,
          subject: templates.notification.subject.replace("{{name}}", name),
          react: ContactNotificationEmail({
            title: templates.notification.title,
            message: templates.notification.message,
            data: {
              ...result.data,
              contactMethod: contactMethod === "email" ? "Email" : "WhatsApp",
            },
          }),
        });

        // 2. If email, send confirmation to user
        if (contactMethod === "email") {
          await resend.emails.send({
            from: env.CONTACT_EMAIL_FROM,
            to: email,
            subject: templates.confirmation.subject,
            react: ContactConfirmationEmail({
              name,
              title: templates.confirmation.title.replace("{{name}}", name),
              message: templates.confirmation.message,
              detailsLabel: templates.confirmation.details,
              data: result.data,
            }),
          });
        }
      } catch (emailError) {
        consola.error("Error sending emails:", emailError);
        // We don't fail the whole request if email sending fails, but we log it.
      }
    }

    consola.success("Contact request processed successfully");

    // Return success result
    return {
      success: true,
      message: successMessage,
      payload: result.data,
      whatsappUrl: contactMethod === "whatsapp" ? whatsappUrl : undefined,
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
