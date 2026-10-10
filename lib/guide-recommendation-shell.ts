/** ガイドページ共通の階層スタイル（Server / Client 両方から import 可） */

export const guideRecommendationsSectionClassName =
  "mb-12 border-none bg-transparent p-0 shadow-none"

export const guideRecommendationsContentShellClassName =
  "rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"

/** おすすめカード左：画像・商品名・価格・スペックを包む単一小枠 */
export const guideRecommendationsProductSummaryClassName =
  "rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm"

/** @deprecated {@link guideRecommendationsProductSummaryClassName} 内の画像用（枠なし） */
export const guideRecommendationsImageAreaClassName =
  "relative overflow-hidden rounded-lg bg-slate-50/80"

/** @deprecated スペックは {@link guideRecommendationsProductSummaryClassName} 内に統合 */
export const guideRecommendationsInnerInsetClassName =
  "border-t border-slate-200 pt-3"

export const guideRecommendationsCardItemClassName =
  "border-t border-slate-200 pt-6 first:border-t-0 first:pt-0"

export const guideRecommendationsMidGridInnerClassName =
  "grid items-start gap-6 md:grid-cols-12 md:gap-6"

export const guideRecommendationsEmptyStateClassName =
  "rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-sm text-muted-foreground"
