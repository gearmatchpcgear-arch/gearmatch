"use client"

import type { ReactNode } from "react"
import {
  guideProductMetaLineClassName,
  guideProductPriceSlotClassName,
  guideProductReviewSlotClassName,
  guideProductShopButtonSlotClassName,
  guideProductSpecSlotClassName,
  guideProductSummaryPanelClassName,
  guideProductTitleTwoLineClassName,
} from "@/lib/product-card-layout"
import {
  guideRecommendationsImageAreaClassName,
  guideRecommendationsProductSummaryClassName,
} from "@/components/guide-recommendations-layout"
import { cn } from "@/lib/utils"

type GuideRecommendationProductSummaryProps = {
  badge: ReactNode
  image: ReactNode
  title: string
  modelNumber?: string
  reviewSlot?: ReactNode
  priceSlot: ReactNode
  specsSlot: ReactNode
  shopSlot?: ReactNode
  imageAreaClassName?: string
}

export function GuideRecommendationProductSummary({
  badge,
  image,
  title,
  modelNumber,
  reviewSlot,
  priceSlot,
  specsSlot,
  shopSlot,
  imageAreaClassName,
}: GuideRecommendationProductSummaryProps) {
  return (
    <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
      <div
        className={cn(
          guideRecommendationsImageAreaClassName,
          "mb-3 flex h-48 w-full shrink-0 items-center justify-center p-3",
          imageAreaClassName,
        )}
      >
        {badge}
        {image}
      </div>

      <h3 className={guideProductTitleTwoLineClassName}>{title}</h3>

      <p className={guideProductMetaLineClassName}>{modelNumber?.trim() ? modelNumber : "\u00A0"}</p>

      <div className={guideProductReviewSlotClassName}>{reviewSlot ?? null}</div>

      <div className={guideProductPriceSlotClassName}>{priceSlot}</div>

      <div className={guideProductSpecSlotClassName}>{specsSlot}</div>

      {shopSlot ? <div className={guideProductShopButtonSlotClassName}>{shopSlot}</div> : null}
    </div>
  )
}
