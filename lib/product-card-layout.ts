import { cn } from "@/lib/utils"

/** 一覧カード（中サイズ等）：商品名を常に2行分の高さで確保 */
export const productListCardTitleTwoLineClassName =
  "line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-[1.375rem] text-slate-900"

/** ガイドおすすめ小枠：縦方向の固定スロット */
export const guideProductSummaryPanelClassName = "flex h-full min-h-0 flex-col"

export const guideProductTitleTwoLineClassName =
  "line-clamp-2 min-h-[2.5rem] shrink-0 text-sm font-bold leading-snug text-foreground sm:min-h-[2.75rem] sm:text-base sm:leading-[1.375rem]"

export const guideProductMetaLineClassName =
  "mb-1 min-h-[1.125rem] shrink-0 text-[11px] leading-[1.125rem] text-muted-foreground sm:text-xs"

export const guideProductReviewSlotClassName = "mb-2 min-h-[1.25rem] shrink-0 sm:mb-3"

export const guideProductPriceSlotClassName =
  "mb-3 shrink-0 text-base font-bold leading-6 text-primary sm:mb-4 sm:text-lg sm:leading-7"

/** 主要4スペック + 区切り線分の最小高さ（カード間で位置を揃える） */
export const guideProductSpecSlotClassName =
  "mt-0 min-h-[5.5rem] shrink-0 sm:min-h-[6.75rem]"

export const guideProductShopButtonSlotClassName = "mt-3 shrink-0 sm:mt-4"

export const guideProductSpecRowClassName =
  "flex justify-between gap-2 text-[11px] sm:gap-3 sm:text-xs"

export const guideProductSpecValueClassName =
  "min-w-0 max-w-[58%] break-words text-right font-medium text-foreground sm:max-w-[65%]"

export const guideProductReasonHeadingClassName =
  "border-b border-slate-200 pb-2 text-sm font-bold text-foreground sm:text-base"

export function productListCardTitleClassName(isSmall: boolean, isMedium: boolean): string {
  return cn(
    "font-semibold text-slate-900",
    isSmall
      ? "line-clamp-2 min-h-[2.5rem] text-xs leading-[1.25rem]"
      : isMedium
        ? productListCardTitleTwoLineClassName
        : "line-clamp-1 text-sm leading-snug",
  )
}
