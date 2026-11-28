import type { MetadataRoute } from "next"
import { GUIDE_CATEGORY_DEFAULT_TAB, GUIDE_TABBED_CATEGORY_IDS } from "@/lib/guide-tab-config"
import type { GuideTabbedCategoryId } from "@/lib/guide-tab-config"
import { buildGuideCategorySitemapUrls } from "@/lib/guide-sitemap-urls"
import { buildGuideCategoryTabCanonical } from "@/lib/guide-tab-seo"
import { absoluteSiteUrl } from "@/lib/site-metadata"

/** `output: "export"`（静的ホスト）向け */
export const dynamic = "force-static"

/** 一覧の `?category=` / `?product=` や、タブ無しガイドURL（クライアント正規化対象）は含めない。 */
function guideEntryPriority(url: string): number {
  for (const categoryId of GUIDE_TABBED_CATEGORY_IDS) {
    const tabbed = categoryId as GuideTabbedCategoryId
    const defaultUrl = absoluteSiteUrl(buildGuideCategoryTabCanonical(tabbed, GUIDE_CATEGORY_DEFAULT_TAB[tabbed]))
    if (url === defaultUrl) return 0.85
    if (url.startsWith(absoluteSiteUrl(`/guide/${categoryId}`))) return 0.82
  }
  return 0.85
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const seen = new Set<string>()
  const entries: MetadataRoute.Sitemap = []

  const add = (entry: MetadataRoute.Sitemap[number]) => {
    if (seen.has(entry.url)) return
    seen.add(entry.url)
    entries.push(entry)
  }

  add({ url: absoluteSiteUrl("/"), lastModified, changeFrequency: "daily", priority: 1 })
  add({ url: absoluteSiteUrl("/guide"), lastModified, changeFrequency: "weekly", priority: 0.9 })
  add({ url: absoluteSiteUrl("/about"), lastModified, changeFrequency: "monthly", priority: 0.5 })
  add({ url: absoluteSiteUrl("/contact"), lastModified, changeFrequency: "monthly", priority: 0.5 })
  add({ url: absoluteSiteUrl("/privacy"), lastModified, changeFrequency: "yearly", priority: 0.3 })

  for (const url of buildGuideCategorySitemapUrls()) {
    add({
      url,
      lastModified,
      changeFrequency: "weekly",
      priority: guideEntryPriority(url),
    })
  }

  return entries
}