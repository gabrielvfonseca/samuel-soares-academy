import type { NextRequest } from "next/server";
import { BRAND_NAME, CONTACT_INFO } from "@/globals/constants";
import { ContactSectionSchema, ContactFormSchema } from "@/models/contact";
import { resend } from "@/lib/email";
import { RecipientTemplate } from "@/templates/recipient-template";
import { SenderTemplate } from "@/templates/sender-template";
import { getDictionary, type Locale } from "@/lib/i18n";
import { success, internalError, badRequest, error } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") || request.headers.get("accept-language") || "en") as Locale;
  
  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.contact;

  const contactData = {
    title: data.title,
    description: data.description,
    info: [
      { label: data.info.address, value: CONTACT_INFO.address },
      { label: data.info.phone, value: CONTACT_INFO.phone },
      { label: data.info.email, value: CONTACT_INFO.email },
      { label: data.info.schedule, value: CONTACT_INFO.schedule },
    ],
    form: {
      title: "", // The section has a specific title for the form area in the design, but reusing section title/desc or leaving empty if not needed by component structure logic
      description: "", 
      nameLabel: data.form.name,
      namePlaceholder: data.form.namePlaceholder,
      emailLabel: data.form.email,
      emailPlaceholder: data.form.emailPlaceholder,
      phoneLabel: data.form.phone,
      phonePlaceholder: data.form.phonePlaceholder,
      ageLabel: data.form.childAge,
      agePlaceholder: data.form.childAgePlaceholder,
      messageLabel: data.form.message,
      messagePlaceholder: data.form.messagePlaceholder,
      submitButton: data.form.submit,
      submittingButton: "Enviando...",
      successMessage: data.form.success,
      errorMessage: "Erro ao enviar mensagem. Por favor, tente novamente."
    }
  };

  const result = ContactSectionSchema.safeParse(contactData);
  if (!result.success) {
    return internalError("Invalid data format", result.error.flatten());
  }
  return success(result.data);
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get("lang") || request.headers.get("accept-language") || "en") as Locale;
    const dictionary = await getDictionary(lang);
    const successMessage = dictionary.web.sections.contact.form.success;

    const body = await request.json();
    const result = ContactFormSchema.safeParse(body);
    
    if (!result.success) {
      return badRequest("Validation error", result.error.flatten());
    }

    const { name, email, phone, childAge, message } = result.data;

    // 1. Send notification email to the School (Recipient of the form)
    await resend.emails.send({
      from: `${BRAND_NAME} <onboarding@resend.dev>`, 
      to: CONTACT_INFO.email,
      subject: `Nova Inscrição: ${name} (${childAge})`,
      react: RecipientTemplate({ name, email, phone, childAge, message }),
    });

    // 2. Send confirmation email to the User (Sender of the form)
    await resend.emails.send({
      from: `${BRAND_NAME} <onboarding@resend.dev>`, 
      to: email,
      subject: `Recebemos o seu contacto - ${BRAND_NAME}`,
      react: SenderTemplate({ name }),
    });

    return success({ message: successMessage }, 200, { 'Cache-Control': 'no-store, max-age=0' });
  } catch (err) {
    console.error("Error processing request:", err);
    return error("Erro ao processar o pedido.");
  }
}
