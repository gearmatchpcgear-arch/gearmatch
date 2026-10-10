import { cn } from "@/lib/utils"

/** 一覧カード（中サイズ等）：商品名を常に2行分の高さで確保 */
export const productListCardTitleTwoLineClassName =
  "line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-[1.375rem] text-slate-900"

/** ガイドおすすめ小枠：縦方向の固定スロット */
export const guideProductSummaryPanelClassName = "flex h-full min-h-0 flex-col"

export const guideProductTitleTwoLineClassName =
  "line-clamp-2 min-h-[2.75rem] shrink-0 text-base font-bold leading-[1.375rem] text-foreground"

export const guideProductMetaLineClassName =
  "mb-1 min-h-[1.125rem] shrink-0 text-xs leading-[1.125rem] text-muted-foreground"

export const guideProductReviewSlotClassName = "mb-3 min-h-[1.25rem] shrink-0"

export const guideProductPriceSlotClassName = "mb-4 shrink-0 text-lg font-bold leading-7 text-primary"

/** 主要4スペック + 区切り線分の最小高さ（カード間で位置を揃える） */
export const guideProductSpecSlotClassName = "mt-0 min-h-[6.75rem] shrink-0"

export const guideProductShopButtonSlotClassName = "mt-4 shrink-0"

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
