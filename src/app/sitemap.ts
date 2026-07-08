import type { MetadataRoute } from "next";
import { seoPages } from "@/lib/site-content";
import { getAppUrl } from "@/lib/env";

const corePaths = [
  "/",
  "/send",
  "/pricing",
  "/templates",
  "/archive",
  "/settings",
  "/admin",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl().replace(/\/$/, "");
  return [
    ...corePaths.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "/" ? 1 : 0.8,
      lastModified: new Date(),
    })),
    ...seoPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: new Date(),
    })),
  ];
}
