import type { JSX } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { AboutSection } from "@/components/sections/about-section";
import { CoachesSection } from "@/components/sections/coaches-section";
import { ContactSection } from "@/components/sections/contact-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FacilitiesSection } from "@/components/sections/facilities-section";
import { FaqSection } from "@/components/sections/faq-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { TrainingSection } from "@/components/sections/training-section";
import { SITE_URL } from "@/globals/constants";
import { JsonLd } from "@/lib/json-ld";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps): Promise<JSX.Element> {
  const { locale } = await params;

  return (
    <main id="main-content" className="min-h-screen">
      <JsonLd
        code={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
          ],
        }}
      />
      <Header lang={locale} />
      <HeroSection lang={locale} />
      <StatsSection lang={locale} />
      <AboutSection lang={locale} />
      <CoachesSection lang={locale} />
      <TrainingSection lang={locale} />
      <FacilitiesSection lang={locale} />
      <GallerySection lang={locale} />
      <TestimonialsSection lang={locale} />
      <FaqSection lang={locale} />
      <PricingSection lang={locale} />
      <CtaSection lang={locale} />
      <ContactSection lang={locale} />
      <Footer lang={locale} />
    </main>
  );
}
