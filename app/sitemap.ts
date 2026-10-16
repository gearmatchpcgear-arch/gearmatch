import type { MetadataRoute } from "next"
import { GUIDE_CATEGORY_IDS, guideCategoryPath } from "@/lib/guide-routes"
import { getSiteOrigin } from "@/lib/site-config"

/** `output: "export"`（静的ホスト）向け */
export const dynamic = "force-static"

function absolute(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${getSiteOrigin()}${normalized}`
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

  const guideCategoryPages: MetadataRoute.Sitemap = GUIDE_CATEGORY_IDS.map((categoryId) => ({
    url: absolute(guideCategoryPath(categoryId)),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }))

  return [...staticPages, ...guideCategoryPages]
}
