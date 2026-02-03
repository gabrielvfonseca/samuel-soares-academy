import { HeaderClient } from "@/components/header-client";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function Header({ lang = "pt" }: SectionProps) {
  const dictionary = await getDictionary(lang as Locale);
  const data = dictionary.web.header;
  return <HeaderClient data={data} />;
}
