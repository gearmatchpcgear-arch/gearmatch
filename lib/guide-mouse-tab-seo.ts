import type { GuideMouseRecommendationId } from "@/lib/guide-mouse-recommendations"
import { GUIDE_MOUSE_TABS } from "@/lib/guide-mouse-recommendations"
import {
  buildGuideCategoryTabCanonical,
  getGuideCategoryTabSeo,
  getGuideCategoryTabSeoFromQuery,
  parseGuideCategoryTabId,
  resolveGuideCategoryActiveTab,
  type GuideTabSeoFaq,
} from "@/lib/guide-tab-seo"

export type GuideMouseTabSeoFaq = GuideTabSeoFaq

export const GUIDE_MOUSE_TAB_IDS = GUIDE_MOUSE_TABS.map((t) => t.id)

const CATEGORY = "mouse" as const

export function getGuideMouseTabSeo(tabId: GuideMouseRecommendationId) {
  return getGuideCategoryTabSeo(CATEGORY, tabId)
}

export function buildGuideMouseTabCanonical(tabId: GuideMouseRecommendationId): string {
  return buildGuideCategoryTabCanonical(CATEGORY, tabId)
}

export function getGuideMouseTabSeoFromQuery(rawTab: string | null | undefined) {
  return getGuideCategoryTabSeoFromQuery(CATEGORY, rawTab)
}

export function parseGuideMouseTabId(raw: string | null | undefined): GuideMouseRecommendationId | null {
  return parseGuideCategoryTabId(CATEGORY, raw) as GuideMouseRecommendationId | null
}

export function resolveGuideMouseActiveTab(raw: string | null | undefined): GuideMouseRecommendationId {
  return resolveGuideCategoryActiveTab(CATEGORY, raw) as GuideMouseRecommendationId
}