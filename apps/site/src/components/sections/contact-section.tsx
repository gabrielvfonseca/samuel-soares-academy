import { type Locale, localeSchema } from "@repo/validation/locale";
import type { JSX } from "react";
import { ContactForm } from "@/components/forms/contact-form";
import { env } from "@/env";
import { CONTACT_INFO } from "@/globals/constants";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";
import { parseContactSection } from "@/utils/contact-utils";

export async function ContactSection({
  lang = "pt",
}: SectionProps): Promise<JSX.Element> {
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
    <section
      className="border-border border-t px-4 py-24 sm:px-6 lg:px-8"
      id="contact"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              {data.title}
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
              {data.description}
            </p>

            <div className="mt-12 space-y-6">
              {data.info.map((info) => (
                <div key={info.label}>
                  <p className="text-muted-foreground text-sm">{info.label}</p>
                  {info.href ? (
                    <a
                      className="text-foreground mt-1 block hover:underline focus:underline focus:outline-none"
                      href={info.href}
                      rel={
                        info.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      target={
                        info.href.startsWith("http") ? "_blank" : undefined
                      }
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
