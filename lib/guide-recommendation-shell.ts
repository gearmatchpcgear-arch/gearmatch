/** ガイドページ共通の階層スタイル（Server / Client 両方から import 可） */

export const guideRecommendationsSectionClassName =
  "mb-8 border-none bg-transparent p-0 shadow-none sm:mb-12"

export const guideRecommendationsContentShellClassName =
  "min-w-0 max-w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5 md:p-6"

/** おすすめカード左：画像・商品名・価格・スペックを包む単一小枠 */
export const guideRecommendationsProductSummaryClassName =
  "min-w-0 max-w-full rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4"

/** @deprecated {@link guideRecommendationsProductSummaryClassName} 内の画像用（枠なし） */
export const guideRecommendationsImageAreaClassName =
  "relative overflow-hidden rounded-lg bg-slate-50/80"

/** @deprecated スペックは {@link guideRecommendationsProductSummaryClassName} 内に統合 */
export const guideRecommendationsInnerInsetClassName =
  "border-t border-slate-200 pt-3"

export const guideRecommendationsCardItemClassName =
  "border-t border-slate-200 pt-4 first:border-t-0 first:pt-0 sm:pt-6"

export const guideRecommendationsMidGridInnerClassName =
  "grid min-w-0 max-w-full grid-cols-1 items-start gap-4 sm:gap-6 md:grid-cols-12 md:gap-6"

/** マウスガイド等：商品画像エリア（モバイルは高さ上限） */
export const guideRecommendationsHeroImageClassName =
  "relative mb-3 max-h-36 w-full overflow-hidden sm:mb-4 sm:max-h-none sm:aspect-[4/3]"

/** おすすめカード標準：商品サムネ枠 */
export const guideRecommendationsCardImageClassName =
  "mb-3 flex h-36 w-full max-w-full shrink-0 items-center justify-center overflow-hidden p-2 sm:mb-3 sm:h-48 sm:p-3"

/** 選定理由・解説カラム */
export const guideRecommendationsReasonColumnClassName = "min-w-0 space-y-3 sm:space-y-4 md:col-span-7"

export const guideRecommendationsEmptyStateClassName =
  "rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-xs text-muted-foreground sm:p-8 sm:text-sm"
