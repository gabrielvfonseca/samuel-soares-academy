import type { JSX } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { AboutSection } from "@/components/sections/about-section";
import { CoachesSection } from "@/components/sections/coaches-section";
import { ContactSection } from "@/components/sections/contact-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FacilitiesSection } from "@/components/sections/facilities-section";
import { FaqSection } from "@/components/sections/faq-section";
// import { GallerySection } from "@/components/sections/gallery-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PricingSection } from "@/components/sections/pricing-section";
// NOTA: TestimonialsSection comentada temporariamente - para reativar, descomentar as linhas abaixo
// import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { SITE_URL } from "@/globals/constants";
import { JsonLd } from "@/lib/json-ld";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({
  params,
}: HomePageProps): Promise<JSX.Element> {
  const { locale } = await params;

  return (
    <main className="min-h-screen" id="main-content">
      <JsonLd
        code={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              item: SITE_URL,
              name: "Home",
              position: 1,
            },
          ],
        }}
      />
      <Header lang={locale} />
      <HeroSection lang={locale} />
      <AboutSection lang={locale} />
      <CoachesSection lang={locale} />
      <FacilitiesSection lang={locale} />
      {/* NOTA: TestimonialsSection comentada temporariamente - para reativar, descomentar a linha abaixo */}
      {/* <TestimonialsSection lang={locale} /> */}
      <FaqSection lang={locale} />
      <PricingSection lang={locale} />
      <CtaSection lang={locale} />
      <ContactSection lang={locale} />
      <Footer lang={locale} />
    </main>
  );
}
