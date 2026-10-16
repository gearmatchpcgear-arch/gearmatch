"use client"

import { useSearchParams } from "next/navigation"
import {
  GUIDE_RECOMMENDATION_TAB_PARAM,
  parseGuideRecommendationTab,
} from "@/lib/guide-recommendation-tab-url"

export function useGuideRecommendationTabId<T extends string>(
  allowed: readonly T[],
  defaultTab: T,
): T {
  const searchParams = useSearchParams()
  return parseGuideRecommendationTab(
    searchParams.get(GUIDE_RECOMMENDATION_TAB_PARAM),
    allowed,
    defaultTab,
  )
}
