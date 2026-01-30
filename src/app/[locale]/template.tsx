import type { JSX, ReactNode } from "react";
import { TemplateMotion } from "@/components/template-motion";

interface TemplateProps {
  readonly children: ReactNode;
}

export default function Template({ children }: TemplateProps): JSX.Element {
  return <TemplateMotion>{children}</TemplateMotion>;
}
