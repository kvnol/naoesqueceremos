import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { STATES } from "@/lib/states";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    ...STATES.map((s) => ({
      url: `${SITE_URL}/?uf=${s.uf}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
