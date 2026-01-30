"use client";

import { type ReactNode, useEffect, useState } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  /** Rendered on server and until client mount; avoids Radix ID hydration mismatch */
  fallback?: ReactNode;
}

/**
 * Renders children only after mount. Use around Radix UI (Accordion, Dialog)
 * so dynamic IDs are generated only on the client and match.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps): ReactNode {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;
  return children;
}
