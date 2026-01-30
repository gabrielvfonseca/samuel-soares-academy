import { HeaderClient } from "@/components/header-client";
import { fetchApi } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";
import type { Header as HeaderData } from "@/models/header";
import type { SectionProps } from "@/types";

export async function Header({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<HeaderData>("/api/header", lang as Locale);
  return <HeaderClient data={data} />;
}
