import { FooterClient } from "@/components/footer-client";
import { fetchApi } from "@/lib/api-client";
import type { Footer as FooterData } from "@/models/footer";
import type { Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function Footer({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<FooterData>("/api/footer", lang as Locale);
  return <FooterClient data={data} />;
}
