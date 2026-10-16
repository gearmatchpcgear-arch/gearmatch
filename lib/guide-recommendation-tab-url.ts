/** ガイド用途タブ（おすすめセクション）のクエリ名 */
export const GUIDE_RECOMMENDATION_TAB_PARAM = "tab"

export function parseGuideRecommendationTab<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (raw && (allowed as readonly string[]).includes(raw)) {
    return raw as T
  }
  return fallback
}

export function buildGuideRecommendationTabHref(basePath: string, tabId: string): string {
  const params = new URLSearchParams()
  params.set(GUIDE_RECOMMENDATION_TAB_PARAM, tabId)
  return `${basePath}?${params.toString()}`
}
