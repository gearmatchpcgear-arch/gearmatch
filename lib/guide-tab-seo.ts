import { guideCategoryPath } from "@/lib/guide-routes"
import {
  GUIDE_CATEGORY_DEFAULT_TAB,
  getGuideCategoryTabIds,
  isGuideTabbedCategory,
  type GuideTabbedCategoryId,
} from "@/lib/guide-tab-config"
import { GUIDE_TAB_SEO_DATA, type GuideTabSeoCategory } from "@/lib/guide-tab-seo-data"
import type { GuideTabSeoContent } from "@/lib/guide-tab-seo-types"
import {
  GUIDE_RECOMMENDATION_TAB_PARAM,
  parseGuideRecommendationTab,
} from "@/lib/guide-recommendation-tab-url"

export type { GuideTabSeoContent, GuideTabSeoFaq } from "@/lib/guide-tab-seo-types"

export function isGuideTabSeoCategory(category: string): category is GuideTabSeoCategory {
  return category in GUIDE_TAB_SEO_DATA
}

export function parseGuideCategoryTabId(
  category: GuideTabSeoCategory,
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null
  const allowed = getGuideCategoryTabIdsForCategory(category)
  const fallback = getGuideCategoryDefaultTab(category)
  const parsed = parseGuideRecommendationTab(raw, allowed, fallback)
  return (allowed as readonly string[]).includes(raw.trim()) ? parsed : null
}

function getGuideCategoryTabIdsForCategory(category: GuideTabSeoCategory): readonly string[] {
  if (isGuideTabbedCategory(category)) {
    return getGuideCategoryTabIds(category)
  }
  return ["overview"]
}

export function getGuideCategoryDefaultTab(category: GuideTabSeoCategory): string {
  if (isGuideTabbedCategory(category)) {
    return GUIDE_CATEGORY_DEFAULT_TAB[category]
  }
  return "overview"
}

export function resolveGuideCategoryActiveTab(
  category: GuideTabSeoCategory,
  raw: string | null | undefined,
): string {
  return parseGuideCategoryTabId(category, raw) ?? getGuideCategoryDefaultTab(category)
}

export function getGuideCategoryTabSeo(category: GuideTabSeoCategory, tabId: string): GuideTabSeoContent {
  const map = GUIDE_TAB_SEO_DATA[category]
  const entry = map[tabId] ?? map[getGuideCategoryDefaultTab(category)]
  return { tabId, ...entry }
}

export function buildGuideCategoryTabCanonical(category: GuideTabSeoCategory, tabId: string): string {
  const path = guideCategoryPath(category)
  if (!isGuideTabbedCategory(category)) {
    return path
  }
  const params = new URLSearchParams()
  params.set(GUIDE_RECOMMENDATION_TAB_PARAM, tabId)
  return `${path}?${params.toString()}`
}

export function getGuideCategoryTabSeoFromQuery(
  category: GuideTabSeoCategory,
  rawTab: string | null | undefined,
): GuideTabSeoContent | null {
  const tabId = parseGuideCategoryTabId(category, rawTab)
  if (!tabId) return null
  return getGuideCategoryTabSeo(category, tabId)
}
