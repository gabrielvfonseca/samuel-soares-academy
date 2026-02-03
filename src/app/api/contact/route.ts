import type { NextRequest } from "next/server";
import { BRAND_NAME, CONTACT_INFO } from "@/globals/constants";
import { env } from "@/env";
import { getDictionary, type Locale } from "@/lib/i18n";
import { badRequest, error, internalError, success } from "@/lib/response";
import { ContactFormSchema, ContactSectionSchema } from "@/models/contact";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") ||
    request.headers.get("accept-language") ||
    "en") as Locale;

  const dictionary = await getDictionary(lang);
  const data = dictionary.web.sections.contact;
  const values = data.values ?? {};

  const addressValue = values.address ?? CONTACT_INFO.address;
  const phoneValue = values.phone ?? CONTACT_INFO.phone;
  const emailValue = values.email ?? CONTACT_INFO.email;
  const scheduleValue = values.schedule ?? CONTACT_INFO.schedule;

  const contactData = {
    title: data.title,
    description: data.description,
    info: [
      {
        label: data.info.address,
        value: addressValue,
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressValue)}`,
      },
      {
        label: data.info.schedule,
        value: scheduleValue,
      },
      {
        label: data.info.phone,
        value: phoneValue,
        href: `tel:${phoneValue.replace(/\s/g, "")}`,
      },
      {
        label: data.info.email,
        value: emailValue,
        href: `mailto:${emailValue}`,
      },
    ],
    form: {
      title: "",
      description: "",
      nameLabel: data.form.name,
      namePlaceholder: data.form.namePlaceholder,
      emailLabel: data.form.email,
      emailPlaceholder: data.form.emailPlaceholder,
      phoneLabel: data.form.phone,
      phonePlaceholder: data.form.phonePlaceholder,
      ageLabel: data.form.childAge,
      agePlaceholder: data.form.childAgePlaceholder,
      clubLabel: data.form.club,
      clubPlaceholder: data.form.clubPlaceholder,
      messageLabel: data.form.message,
      messagePlaceholder: data.form.messagePlaceholder,
      submitButton: data.form.submit,
      submittingButton: data.form.submitting ?? "Enviando...",
      successMessage: data.form.success,
      errorMessage: data.form.error ?? "Erro ao enviar mensagem. Por favor, tente novamente.",
      whatsappPhone: env.WHATSAPP_BUSINESS_PHONE,
    },
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
    const lang = (searchParams.get("lang") ||
      request.headers.get("accept-language") ||
      "en") as Locale;
    const dictionary = await getDictionary(lang);
    const successMessage = dictionary.web.sections.contact.form.success;

    const body = await request.json();
    console.log("[API/Contact] Received request body:", body);

    const result = ContactFormSchema.safeParse(body);

    if (!result.success) {
      console.error("[API/Contact] Validation failed:", result.error.flatten());
      return badRequest("Validation error", result.error.flatten());
    }

    const { name, email, phone, childAge, club, message } = result.data;

    return success({ message: successMessage });
  } catch (err) {
    console.error("Error processing request:", err);
    return error("Erro ao processar o pedido.");
  }
}
