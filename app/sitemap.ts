import type { MetadataRoute } from "next"
import {
  GUIDE_CATEGORY_DEFAULT_TAB,
  GUIDE_TABBED_CATEGORY_IDS,
  getGuideCategoryTabIds,
  isGuideTabbedCategory,
} from "@/lib/guide-tab-config"
import { GUIDE_CATEGORY_IDS, guideCategoryPath } from "@/lib/guide-routes"
import { getSiteOrigin } from "@/lib/site-config"
import { GUIDE_RECOMMENDATION_TAB_PARAM } from "@/lib/guide-recommendation-tab-url"

/** `output: "export"`（静的ホスト）向け */
export const dynamic = "force-static"

function absolute(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${getSiteOrigin()}${normalized}`
}

function guideUrlWithTab(categoryPath: string, tabId: string): string {
  const params = new URLSearchParams()
  params.set(GUIDE_RECOMMENDATION_TAB_PARAM, tabId)
  return absolute(`${categoryPath}?${params.toString()}`)
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absolute("/"),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absolute("/guide"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absolute("/about"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absolute("/contact"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absolute("/privacy"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  const guideCategoryPages: MetadataRoute.Sitemap = []

  for (const categoryId of GUIDE_CATEGORY_IDS) {
    const path = guideCategoryPath(categoryId)

    if (isGuideTabbedCategory(categoryId)) {
      const tabbed = categoryId as (typeof GUIDE_TABBED_CATEGORY_IDS)[number]
      for (const tabId of getGuideCategoryTabIds(tabbed)) {
        guideCategoryPages.push({
          url: guideUrlWithTab(path, tabId),
          lastModified,
          changeFrequency: "weekly",
          priority: tabId === GUIDE_CATEGORY_DEFAULT_TAB[tabbed] ? 0.85 : 0.82,
        })
      }
    } else {
      guideCategoryPages.push({
        url: absolute(path),
        lastModified,
        changeFrequency: "weekly",
        priority: 0.85,
      })
    }
  }

  return [...staticPages, ...guideCategoryPages]
}