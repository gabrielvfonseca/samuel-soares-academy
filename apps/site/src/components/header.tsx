import { localeSchema } from "@repo/validation/locale";
import { HeaderClient } from "@/components/header-client";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function Header({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get header data
  const data = dictionary.web.header;

  // Return header component
  return <HeaderClient data={data} />;
}
