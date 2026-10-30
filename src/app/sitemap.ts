import type { MetadataRoute } from "next";
import { loadContent } from "@/lib/load-content";
import { SITE_URL } from "@/lib/site";
import { STATES } from "@/lib/states";
import type { ContentItem, UfCode } from "@/lib/types";
import { statePath } from "@/lib/url-state";

export const revalidate = 300;

/** Data da inclusão mais recente (ou do fato, se não houver createdAt). */
function latestUpdate(items: ContentItem[]): Date | undefined {
  let latest = 0;
  for (const item of items) {
    const t = Date.parse(item.createdAt ?? item.date);
    if (!Number.isNaN(t) && t > latest) latest = t;
  }
  return latest ? new Date(latest) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { items } = await loadContent();
  const byUf = new Map<UfCode, ContentItem[]>();
  for (const item of items) {
    byUf.set(item.uf, [...(byUf.get(item.uf) ?? []), item]);
  }

  return [
    {
      url: SITE_URL,
      lastModified: latestUpdate(items),
      changeFrequency: "daily",
      priority: 1,
    },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    ...STATES.map((s) => ({
      url: `${SITE_URL}${statePath(s.uf)}`,
      lastModified: latestUpdate(byUf.get(s.uf) ?? []),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
