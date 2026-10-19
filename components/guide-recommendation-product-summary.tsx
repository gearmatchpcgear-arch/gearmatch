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
  guideRecommendationsCardImageClassName,
  guideRecommendationsImageAreaClassName,
  guideRecommendationsProductSummaryClassName,
} from "@/components/guide-recommendations-layout"
import { GuideRecommendationImageBlock } from "@/components/guide-recommendation-image-block"
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
    <div
      className={cn(
        guideRecommendationsProductSummaryClassName,
        guideProductSummaryPanelClassName,
        "min-w-0 max-w-full",
      )}
    >
      <GuideRecommendationImageBlock
        badge={badge}
        className={cn(
          guideRecommendationsImageAreaClassName,
          guideRecommendationsCardImageClassName,
          imageAreaClassName,
        )}
      >
        {image}
      </GuideRecommendationImageBlock>

      <h3 className={guideProductTitleTwoLineClassName}>{title}</h3>

      <p className={guideProductMetaLineClassName}>{modelNumber?.trim() ? modelNumber : "\u00A0"}</p>

      <div className={guideProductReviewSlotClassName}>{reviewSlot ?? null}</div>

      <div className={guideProductPriceSlotClassName}>{priceSlot}</div>

      <div className={guideProductSpecSlotClassName}>{specsSlot}</div>

      {shopSlot ? <div className={guideProductShopButtonSlotClassName}>{shopSlot}</div> : null}
    </div>
  )
}
