import type { MetadataRoute } from "next";

export const createSitemap = (
  url: string | URL,
  items: (
    | string
    | {
        path: string;
        lastModified?: string | Date;
        changeFrequency?:
          | "always"
          | "hourly"
          | "daily"
          | "weekly"
          | "monthly"
          | "yearly"
          | "never";
        priority?: number;
      }
  )[]
): MetadataRoute.Sitemap =>
  items.map((item) => {
    if (typeof item === "string") {
      return {
        lastModified: new Date(),
        url: new URL(item, url).href.replace(/\/$/u, ""),
      };
    }

    return {
      changeFrequency: item.changeFrequency,
      lastModified: item.lastModified ?? new Date(),
      priority: item.priority,
      url: new URL(item.path, url).href.replace(/\/$/u, ""),
    };
  });
