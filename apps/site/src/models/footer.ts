import { z } from "zod";
import { NavLinkSchema } from "./header";

export const FooterSchema = z.object({
  tagline: z.string(),
  rights: z.string(),
  privacy: z.string(),
  terms: z.string(),
  nav: z.array(NavLinkSchema),
});

export type Footer = z.infer<typeof FooterSchema>;
