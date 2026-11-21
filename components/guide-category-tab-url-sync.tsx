"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import type { CategoryId } from "@/lib/gadgets"
import { isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { GUIDE_RECOMMENDATION_TAB_PARAM, buildGuideRecommendationTabHref } from "@/lib/guide-recommendation-tab-url"
import { guideCategoryPath } from "@/lib/guide-routes"
import { isGuideTabSeoCategory, resolveGuideCategoryActiveTab, type GuideTabSeoCategory } from "@/lib/guide-tab-seo"
import { normalizeSitePath } from "@/lib/site-metadata"

type GuideCategoryTabUrlSyncProps = {
  category: CategoryId
}

/**
 * タブ付きガイドで `?tab=` が無い／不正なとき、正規のクエリ付きURLへ置換する（静的ホスト向け）。
 */
export function GuideCategoryTabUrlSync({ category }: GuideCategoryTabUrlSyncProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const guidePath = guideCategoryPath(category)

  useEffect(() => {
    if (normalizeSitePath(pathname ?? "") !== guidePath) return
    if (!isGuideTabSeoCategory(category) || !isGuideTabbedCategory(category)) return

    const seoCategory = category as GuideTabSeoCategory
    const raw = searchParams.get(GUIDE_RECOMMENDATION_TAB_PARAM)
    const tabId = resolveGuideCategoryActiveTab(seoCategory, raw)
    if (raw === tabId) return

    const href = buildGuideRecommendationTabHref(guidePath, tabId)
    router.replace(`${href}${window.location.hash}`, { scroll: false })
  }, [pathname, searchParams, category, guidePath, router])

  return null
}