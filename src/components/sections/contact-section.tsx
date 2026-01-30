import { fetchApi } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";
import type { ContactSection as ContactSectionData } from "@/models/contact";
import type { SectionProps } from "@/types";
import { ContactForm } from "../forms/contact-form";

export async function ContactSection({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<ContactSectionData>("/api/contact", lang as Locale);

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
                  <p className="text-foreground mt-1">{info.value}</p>
                </div>
              ))}
            </div>
          </div>

          <ContactForm {...data.form} />
        </div>
      </div>
    </section>
  );
}
