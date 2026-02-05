import { env } from "@/env";
import { CONTACT_INFO } from "@/globals/constants";
import { getDictionary } from "@/lib/i18n";
import { localeSchema, type Locale } from "@/schemas/locale-schema";
import { parseContactSection } from "@/utils/contact-utils";
import type { SectionProps } from "@/types";
import type { JSX } from "react";
import { ContactForm } from "@/components/forms/contact-form";

export async function ContactSection({ lang = "pt" }: SectionProps): Promise<JSX.Element> {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw contact section
  const raw = dictionary.web.sections.contact;

  // Get WhatsApp business phone
  const whatsappPhone = env.WHATSAPP_BUSINESS_PHONE;

  // Validate WhatsApp business phone
  if (!whatsappPhone) {
    throw new Error("WhatsApp business phone is not set");
  }

  // Build contact section
  const data = parseContactSection(raw, CONTACT_INFO, whatsappPhone);

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

          {/* Render contact form with data */}
          <ContactForm {...data.form} lang={lang as Locale} />
        </div>
      </div>
    </section>
  );
}
