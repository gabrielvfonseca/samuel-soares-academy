import type { MetadataRoute } from "next";
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_SHORT_NAME,
  COLORS,
} from "@/globals/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: COLORS.background,
    description: BRAND_DESCRIPTION,
    display: "standalone",
    icons: [
      {
        sizes: "any",
        src: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        sizes: "180x180",
        src: "/apple-icon.svg",
        type: "image/svg+xml",
      },
    ],
    name: BRAND_NAME,
    short_name: BRAND_SHORT_NAME,
    start_url: "/",
    theme_color: COLORS.primary,
  };
}
