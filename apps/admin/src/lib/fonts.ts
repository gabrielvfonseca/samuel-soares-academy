import { cn } from "@ssa/ui/lib/utils";
import { Inconsolata, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

export const fonts = cn(
  inter.variable,
  inconsolata.variable,
  "touch-manipulation font-sans antialiased"
);
