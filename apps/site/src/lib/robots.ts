import type { MetadataRoute } from "next";

export const createRobots = (
  url: string | URL,
  rules: MetadataRoute.Robots["rules"] = {
    allow: "/",
    userAgent: "*",
  }
): MetadataRoute.Robots => ({
  rules,
  sitemap: new URL("/sitemap.xml", url).href,
});
