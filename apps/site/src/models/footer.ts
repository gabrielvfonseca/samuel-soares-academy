import { z } from "zod";
import { NavLinkSchema } from "./header";

export const FooterSchema = z.object({
  nav: z.array(NavLinkSchema),
  privacy: z.string(),
  rights: z.string(),
  tagline: z.string(),
  terms: z.string(),
});

export type Footer = z.infer<typeof FooterSchema>;
