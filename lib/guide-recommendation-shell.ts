/** ガイドページ共通の階層スタイル（Server / Client 両方から import 可） */

export const guideRecommendationsSectionClassName =
  "mb-6 w-full min-w-0 max-w-full border-none bg-transparent p-0 shadow-none sm:mb-8 md:mb-12"

export const guideRecommendationsContentShellClassName =
  "min-w-0 w-full max-w-full overflow-x-clip rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5 md:p-6"

/** おすすめカード左：画像・商品名・価格・スペックを包む単一小枠 */
export const guideRecommendationsProductSummaryClassName =
  "min-w-0 max-w-full rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4"

/** おすすめカード内の商品画像枠（バッジは absolute） */
export const guideRecommendationsImageAreaClassName =
  "relative min-h-0 overflow-hidden rounded-lg bg-gradient-to-b from-slate-50 to-white"

/** @deprecated スペックは {@link guideRecommendationsProductSummaryClassName} 内に統合 */
export const guideRecommendationsInnerInsetClassName =
  "border-t border-slate-200 pt-3"

export const guideRecommendationsCardItemClassName =
  "border-t border-slate-200 pt-4 first:border-t-0 first:pt-0 sm:pt-6"

/** モバイルは flex 縦積み、md 以上で 12 カラムグリッド */
export const guideRecommendationsMidGridInnerClassName =
  "flex w-full min-w-0 max-w-full flex-col items-stretch gap-4 sm:gap-5 md:grid md:grid-cols-12 md:items-start md:gap-6"

export const guideRecommendationsProductColumnClassName = "w-full min-w-0 md:col-span-5"

/** マウスガイド等：ヒーロー商品画像（幅に連動するアスペクト比で全体を表示） */
export const guideRecommendationsHeroImageClassName =
  "mb-3 flex aspect-[4/3] w-full max-w-full items-center justify-center p-2 sm:mb-4 sm:p-3"

/** おすすめカード標準：商品サムネ枠 */
export const guideRecommendationsCardImageClassName =
  "mb-3 flex aspect-[4/3] w-full max-w-full shrink-0 items-center justify-center p-2 sm:mb-3 sm:aspect-[5/4] sm:p-3"

/** ガイド画像枠内：GadgetImage / ProductImageWithFallback 用 */
export const guideRecommendationsImageFitClassName =
  "h-full min-h-0 w-full max-w-full [&_img]:h-auto [&_img]:max-h-full [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain"

/** 選定理由・解説カラム */
export const guideRecommendationsReasonColumnClassName =
  "min-w-0 w-full space-y-3 sm:space-y-4 md:col-span-7"

export const guideRecommendationsEmptyStateClassName =
  "rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-xs text-muted-foreground sm:p-8 sm:text-sm"
