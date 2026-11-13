import { z } from "zod";

export const NavLinkSchema = z.object({
  href: z.string(),
  label: z.string(),
});

export const HeaderSchema = z.object({
  cta: z.string(),
  nav: z.array(NavLinkSchema),
});

export type Header = z.infer<typeof HeaderSchema>;
export type NavLink = z.infer<typeof NavLinkSchema>;
