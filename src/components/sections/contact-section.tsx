import { CONTACT_INFO } from "@/globals/constants";
import { env } from "@/env";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";
import { ContactForm } from "../forms/contact-form";

export async function ContactSection({ lang = "pt" }: SectionProps) {
  const dictionary = await getDictionary(lang as Locale);
  const rawData = dictionary.web.sections.contact;
  const values = rawData.values ?? {};

  const addressValue = values.address ?? CONTACT_INFO.address;
  const phoneValue = values.phone ?? CONTACT_INFO.phone;
  const emailValue = values.email ?? CONTACT_INFO.email;
  const scheduleValue = values.schedule ?? CONTACT_INFO.schedule;

  const data = {
    title: rawData.title,
    description: rawData.description,
    info: [
      {
        label: rawData.info.address,
        value: addressValue,
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressValue)}`,
      },
      {
        label: rawData.info.schedule,
        value: scheduleValue,
      },
      {
        label: rawData.info.phone,
        value: phoneValue,
        href: `tel:${phoneValue.replace(/\s/g, "")}`,
      },
      {
        label: rawData.info.email,
        value: emailValue,
        href: `mailto:${emailValue}`,
      },
    ],
    form: {
      title: "",
      description: "",
      nameLabel: rawData.form.name,
      namePlaceholder: rawData.form.namePlaceholder,
      emailLabel: rawData.form.email,
      emailPlaceholder: rawData.form.emailPlaceholder,
      phoneLabel: rawData.form.phone,
      phonePlaceholder: rawData.form.phonePlaceholder,
      ageLabel: rawData.form.childAge,
      agePlaceholder: rawData.form.childAgePlaceholder,
      clubLabel: rawData.form.club,
      clubPlaceholder: rawData.form.clubPlaceholder,
      messageLabel: rawData.form.message,
      messagePlaceholder: rawData.form.messagePlaceholder,
      submitButton: rawData.form.submit,
      submittingButton: rawData.form.submitting ?? "Enviando...",
      successMessage: rawData.form.success,
      errorMessage: rawData.form.error ?? "Erro ao enviar mensagem. Por favor, tente novamente.",
      whatsappPhone: env.WHATSAPP_BUSINESS_PHONE,
    },
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              {data.title}
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">
              {data.description}
            </p>

            <div className="mt-12 space-y-6">
              {data.info.map((info) => (
                <div key={info.label}>
                  <p className="text-sm text-muted-foreground">{info.label}</p>
                  {info.href ? (
                    <a
                      href={info.href}
                      target={info.href.startsWith("http") ? "_blank" : undefined}
                      rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-foreground mt-1 block hover:underline focus:underline focus:outline-none"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-foreground mt-1">{info.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <ContactForm {...data.form} lang={lang as Locale} />
        </div>
      </div>
    </section>
  );
}
