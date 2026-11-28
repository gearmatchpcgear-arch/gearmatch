import { getGuideCategoryTabIds, isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { GUIDE_CATEGORY_IDS, guideCategoryPath } from "@/lib/guide-routes"
import {
  buildGuideCategoryTabCanonical,
  isGuideTabSeoCategory,
  type GuideTabSeoCategory,
} from "@/lib/guide-tab-seo"
import { absoluteSiteUrl } from "@/lib/site-metadata"

/**
 * ガイドカテゴリのサイトマップ用URL（`buildGuideCategoryPageMetadata` の canonical と同じ組み立て）。
 * タブ付きカテゴリは `?tab=` 付きのみ。パラメータ無しの `/guide/mouse` 等は含めない。
 */
export function buildGuideCategorySitemapUrls(): string[] {
  const seen = new Set<string>()
  const urls: string[] = []

  for (const categoryId of GUIDE_CATEGORY_IDS) {
    if (!isGuideTabSeoCategory(categoryId)) continue

    if (isGuideTabbedCategory(categoryId)) {
      const seoCategory = categoryId as GuideTabSeoCategory
      for (const tabId of getGuideCategoryTabIds(categoryId)) {
        const relative = buildGuideCategoryTabCanonical(seoCategory, tabId)
        const absolute = absoluteSiteUrl(relative)
        if (seen.has(absolute)) continue
        seen.add(absolute)
        urls.push(absolute)
      }
      continue
    }

    const absolute = absoluteSiteUrl(guideCategoryPath(categoryId))
    if (seen.has(absolute)) continue
    seen.add(absolute)
    urls.push(absolute)
  }

  return urls
}