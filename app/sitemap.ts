import type { MetadataRoute } from "next";
import { docs } from "@/content/docs";
import { absoluteUrl } from "@/lib/site";

const LAST_CONTENT_UPDATE = new Date("2026-08-23T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...docs.map((page) => ({
      url: absoluteUrl(page.slug === "overview" ? "/docs" : `/docs/${page.slug}`),
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly" as const,
      priority: page.slug === "overview" ? 0.9 : page.group === "Getting started" ? 0.8 : 0.7,
    })),
  ];
}
