import type { MetadataRoute } from "next";
import { SITE_URL } from "@/globals/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 1,
      url: SITE_URL,
    },
  ];
}
