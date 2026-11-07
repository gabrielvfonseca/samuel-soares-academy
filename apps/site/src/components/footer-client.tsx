"use client";

import Link from "next/link";
import { type JSX, useState } from "react";
import { ClientOnly } from "@/components/client-only";
import { BRAND_NAME } from "@/globals/constants";
import type { Footer as FooterData } from "@/models/footer";
import { PrivacyDialog } from "./dialogs/privacy-dialog";
import { TermsDialog } from "./dialogs/terms-dialog";

interface FooterClientProps {
  data: FooterData;
}

export function FooterClient({ data }: FooterClientProps): JSX.Element {
  const [privacyOpen, setPrivacyOpen] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <Link className="text-lg font-medium tracking-tight" href="/">
              {BRAND_NAME}
            </Link>
            <p className="text-background/60 mt-2 text-sm">{data.tagline}</p>
          </div>

          <nav className="flex flex-col gap-3 md:flex-row">
            {data.nav.map((link) => (
              <Link
                className="text-background/60 hover:text-background text-sm transition-colors"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-background/10 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-background/60 text-sm">
            {currentYear} {BRAND_NAME}. {data.rights}
          </p>
          <div className="flex items-center gap-6">
            <ClientOnly
              fallback={
                <>
                  <button
                    className="text-background/60 hover:text-background text-sm transition-colors"
                    type="button"
                  >
                    {data.privacy}
                  </button>
                  <button
                    className="text-background/60 hover:text-background text-sm transition-colors"
                    type="button"
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
                setTermsOpen={setTermsOpen}
                termsOpen={termsOpen}
                triggerLabel={data.terms}
              />
            </ClientOnly>
          </div>
        </div>
      </div>
    </footer>
  );
}
