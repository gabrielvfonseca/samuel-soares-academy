"use server";

import { createMailer } from "@repo/email/mailer";
import { ContactConfirmationEmail } from "@repo/email/templates/contact-confirmation";
import { ContactNotificationEmail } from "@repo/email/templates/contact-notification";
import type { ContactSubmitResult } from "@repo/validation/contact";
import { type Locale, localeSchema } from "@repo/validation/locale";
import consola from "consola";
import { env } from "@/env";
import { parseError } from "@/lib/error";
import { getDictionary } from "@/lib/i18n";
import { type ContactForm, contactFormSchema } from "@/models/contact";
import { buildWhatsappMessage } from "@/utils/whatsapp-message";

const resend = createMailer(env.RESEND_API_KEY);

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
        details: result.error.flatten().fieldErrors,
        error: msg,
        message: msg,
        success: false,
      };
    }

    // Build WhatsApp message
    const encodedMessage = encodeURIComponent(
      buildWhatsappMessage(result.data)
    );
    const whatsappUrl = `https://wa.me/${env.WHATSAPP_BUSINESS_PHONE.replace(/[^\d]/gu, "")}?text=${encodedMessage}`;

    const { contactMethod, name, email } = result.data;
    const templates = dictionary.web.sections.contact.form.templates;

    if (templates) {
      try {
        // 1. Always send notification to admin
        await resend.emails.send({
          from: env.CONTACT_EMAIL_FROM,
          react: ContactNotificationEmail({
            data: {
              ...result.data,
              contactMethod: contactMethod === "email" ? "Email" : "WhatsApp",
            },
            message: templates.notification.message,
            title: templates.notification.title,
          }),
          subject: templates.notification.subject.replace("{{name}}", name),
          to: env.CONTACT_EMAIL_TO,
        });

        // 2. If email, send confirmation to user
        if (contactMethod === "email") {
          await resend.emails.send({
            from: env.CONTACT_EMAIL_FROM,
            react: ContactConfirmationEmail({
              data: result.data,
              detailsLabel: templates.confirmation.details,
              message: templates.confirmation.message,
              name,
              title: templates.confirmation.title.replace("{{name}}", name),
            }),
            subject: templates.confirmation.subject,
            to: email,
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
      message: successMessage,
      payload: result.data,
      success: true,
      whatsappUrl: contactMethod === "whatsapp" ? whatsappUrl : undefined,
    };
  } catch (error) {
    const errorMessage = parseError(error);
    consola.error("Error processing request:", errorMessage);
    const msg = "Erro ao processar o pedido.";
    return {
      error: msg,
      message: msg,
      success: false,
    };
  }
}
