import type { MetadataRoute } from "next";

export const createSitemap = (
  url: string | URL,
  items: (
    | string
    | {
        path: string;
        lastModified?: string | Date;
        changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
        priority?: number;
      }
  )[],
): MetadataRoute.Sitemap => {
  return items.map((item) => {
    if (typeof item === "string") {
      return {
        url: new URL(item, url).href.replace(/\/$/, ""),
        lastModified: new Date(),
      };
    }

    return {
      url: new URL(item.path, url).href.replace(/\/$/, ""),
      lastModified: item.lastModified ?? new Date(),
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    };
  });
};
