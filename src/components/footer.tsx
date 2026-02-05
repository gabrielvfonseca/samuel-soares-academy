import { FooterClient } from "@/components/footer-client";
import { getDictionary } from "@/lib/i18n";
import { localeSchema } from "@/schemas/locale-schema";
import type { SectionProps } from "@/types";

export async function Footer({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get footer data
  const data = dictionary.web.footer;

  // Return footer component
  return <FooterClient data={data} />;
}
