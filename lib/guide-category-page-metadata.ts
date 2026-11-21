import type { Metadata } from "next"
import type { CategoryId } from "@/lib/gadgets"
import {
  getGuideCategoryTabSeo,
  isGuideTabSeoCategory,
  resolveGuideCategoryActiveTab,
  type GuideTabSeoCategory,
} from "@/lib/guide-tab-seo"
import { getGuideCategoryLabel, guideCategoryPath } from "@/lib/guide-routes"
import { SITE_NAME } from "@/lib/site-config"
import { sitePageMetadata } from "@/lib/site-metadata"
import { GUIDE_RECOMMENDATION_TAB_PARAM } from "@/lib/guide-recommendation-tab-url"
import { isGuideTabbedCategory } from "@/lib/guide-tab-config"

type SearchParamsInput = {
  [key: string]: string | string[] | undefined
}

export function buildGuideCategoryPageMetadata(
  category: CategoryId,
  searchParams?: SearchParamsInput,
): Metadata {
  const path = guideCategoryPath(category)
  const label = getGuideCategoryLabel(category)

  if (isGuideTabSeoCategory(category)) {
    const rawTab =
      searchParams && typeof searchParams[GUIDE_RECOMMENDATION_TAB_PARAM] === "string"
        ? searchParams[GUIDE_RECOMMENDATION_TAB_PARAM]
        : undefined
    const seoCategory = category as GuideTabSeoCategory
    const tabId = resolveGuideCategoryActiveTab(seoCategory, rawTab)
    const tabSeo = getGuideCategoryTabSeo(seoCategory, tabId)
    const canonicalParams = isGuideTabbedCategory(category)
      ? { [GUIDE_RECOMMENDATION_TAB_PARAM]: tabId }
      : undefined
    return sitePageMetadata({
      path,
      title: tabSeo.title,
      description: tabSeo.description,
      searchParams: canonicalParams,
    })
  }

  const title = `${label}の選び方 | デバイス購入のポイント | ${SITE_NAME}`
  const description = `${label}の失敗しない選び方とおすすめモデルを${SITE_NAME}が解説します。`
  return sitePageMetadata({ path, title, description })
}
