import type { MetadataRoute } from "next";
import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_SHORT_NAME, COLORS } from "@/globals/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_SHORT_NAME,
    description: BRAND_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: COLORS.background,
    theme_color: COLORS.primary,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
