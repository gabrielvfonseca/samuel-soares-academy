import { cn } from "@repo/ui/lib/utils";
import { Inconsolata, Inter, Montserrat } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const fonts = cn(
  inter.variable,
  inconsolata.variable,
  montserrat.variable,
  "touch-manipulation font-sans antialiased"
);
