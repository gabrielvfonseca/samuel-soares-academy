"use server";

import { getDictionary, type Locale } from "@/lib/i18n";
import { ContactFormSchema } from "@/models/contact";

export async function submitContactForm(formData: any, lang: Locale = "pt") {
  try {
    const dictionary = await getDictionary(lang);
    const successMessage = dictionary.web.sections.contact.form.success;

    const result = ContactFormSchema.safeParse(formData);

    if (!result.success) {
      return {
        success: false,
        error: "Validation error",
        details: result.error.flatten(),
      };
    }

    console.log("[Action/Contact] Received data:", result.data);

    return {
      success: true,
      message: successMessage,
    };
  } catch (err) {
    console.error("Error processing request:", err);
    return {
      success: false,
      error: "Erro ao processar o pedido.",
    };
  }
}
