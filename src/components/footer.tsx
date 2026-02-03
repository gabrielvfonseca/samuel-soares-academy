import { FooterClient } from "@/components/footer-client";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function Footer({ lang = "pt" }: SectionProps) {
  const dictionary = await getDictionary(lang as Locale);
  const data = dictionary.web.footer;
  return <FooterClient data={data} />;
}
