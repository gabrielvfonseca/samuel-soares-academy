"use client";

import { useState, type JSX } from "react";
import { BRAND_NAME } from "@/globals/constants";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import { PrivacyDialog } from "./dialogs/privacy-dialog";
import { TermsDialog } from "./dialogs/terms-dialog";
import type { Footer as FooterData } from "@/models/footer";

interface FooterClientProps {
  data: FooterData;
}

export function FooterClient({ data }: FooterClientProps): JSX.Element {
  const [privacyOpen, setPrivacyOpen] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-foreground text-background">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <Link href="/" className="text-lg font-medium tracking-tight">
              {BRAND_NAME}
            </Link>
            <p className="mt-2 text-sm text-background/60">{data.tagline}</p>
          </div>

          <nav className="flex flex-col md:flex-row gap-3">
            {data.nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-background/60 hover:text-background transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            {currentYear} {BRAND_NAME}. {data.rights}
          </p>
          <div className="flex items-center gap-6">
            <ClientOnly
              fallback={
                <>
                  <button
                    type="button"
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {data.privacy}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {data.terms}
                  </button>
                </>
              }
            >
              <PrivacyDialog
                privacyOpen={privacyOpen}
                setPrivacyOpen={setPrivacyOpen}
                triggerLabel={data.privacy}
              />
              <TermsDialog
                termsOpen={termsOpen}
                setTermsOpen={setTermsOpen}
                triggerLabel={data.terms}
              />
            </ClientOnly>
          </div>
        </div>
      </div>
    </footer>
  );
}
