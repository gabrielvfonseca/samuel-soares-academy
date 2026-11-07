import type { MetadataRoute } from "next";
import { SITE_URL } from "@/globals/constants";
import { createRobots } from "@/lib/robots";

export default function robots(): MetadataRoute.Robots {
  return createRobots(SITE_URL, {
    allow: "/",
    disallow: "/private/",
    userAgent: "*",
  });
}
