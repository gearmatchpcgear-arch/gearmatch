"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import {
  buildGuideCategoryTabCanonical,
  getGuideCategoryTabSeoFromQuery,
  isGuideTabSeoCategory,
  type GuideTabSeoCategory,
} from "@/lib/guide-tab-seo"
import { isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { GUIDE_CATEGORY_IDS, guideCategoryPath } from "@/lib/guide-routes"
import { absoluteSiteUrl, normalizeSitePath } from "@/lib/site-metadata"

/**
 * クエリ付きURLでも正規URLを更新。用途タブ付きガイドは tab 付き canonical を維持する。
 */
export function CanonicalFromPathname() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const path = normalizeSitePath(pathname ?? "/")
    let href = absoluteSiteUrl(path)

    const category = GUIDE_CATEGORY_IDS.find((id) => path === guideCategoryPath(id))
    if (category && isGuideTabSeoCategory(category)) {
      const tabSeo = getGuideCategoryTabSeoFromQuery(
        category as GuideTabSeoCategory,
        searchParams.get("tab"),
      )
      if (tabSeo && isGuideTabbedCategory(category)) {
        href = absoluteSiteUrl(buildGuideCategoryTabCanonical(category as GuideTabSeoCategory, tabSeo.tabId))
      }
    }

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement("link")
      link.rel = "canonical"
      document.head.appendChild(link)
    }
    if (link.getAttribute("href") !== href) {
      link.setAttribute("href", href)
    }
  }, [pathname, searchParams])

  return null
}