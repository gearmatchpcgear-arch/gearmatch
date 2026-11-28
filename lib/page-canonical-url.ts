import { GADGET_DETAIL_QUERY_PARAM } from "@/lib/gadget-detail-url"
import {
  buildGuideCategoryTabCanonical,
  isGuideTabSeoCategory,
  resolveGuideCategoryActiveTab,
  type GuideTabSeoCategory,
} from "@/lib/guide-tab-seo"
import { isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { GUIDE_RECOMMENDATION_TAB_PARAM } from "@/lib/guide-recommendation-tab-url"
import { GUIDE_CATEGORY_IDS, guideCategoryPath } from "@/lib/guide-routes"
import { absoluteSiteUrl, normalizeSitePath } from "@/lib/site-metadata"

/** 一覧の UI 状態用クエリ（canonical・サイトマップに含めない） */
export const GADGET_EXPLORER_UI_QUERY_PARAMS = [
  "category",
  GADGET_DETAIL_QUERY_PARAM,
] as const

type SearchParamsLike = {
  get: (key: string) => string | null
}

/**
 * パスとクエリから正規 canonical 絶対URLを決定する。
 * - トップの `category` / `product` 等は常にパスのみ（例: `/`）
 * - タブ付きガイドのみ `?tab=` 付きURLを正規とする
 */
export function resolvePageCanonicalUrl(
  pathname: string | null | undefined,
  searchParams: SearchParamsLike,
): string {
  const path = normalizeSitePath(pathname ?? "/")

  const guideCategory = GUIDE_CATEGORY_IDS.find((id) => path === guideCategoryPath(id))
  if (guideCategory && isGuideTabSeoCategory(guideCategory) && isGuideTabbedCategory(guideCategory)) {
    const tabId = resolveGuideCategoryActiveTab(
      guideCategory as GuideTabSeoCategory,
      searchParams.get(GUIDE_RECOMMENDATION_TAB_PARAM),
    )
    return absoluteSiteUrl(buildGuideCategoryTabCanonical(guideCategory as GuideTabSeoCategory, tabId))
  }

  return absoluteSiteUrl(path)
}