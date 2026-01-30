import { z } from "zod";

export const NavLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const HeaderSchema = z.object({
  nav: z.array(NavLinkSchema),
  cta: z.string(),
});

export type Header = z.infer<typeof HeaderSchema>;
export type NavLink = z.infer<typeof NavLinkSchema>;
