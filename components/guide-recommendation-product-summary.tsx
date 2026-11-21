"use client"

import Link from "next/link"
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
  /** PC GearMatch 一覧＋詳細への内部リンク */
  titleHref?: string
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
  titleHref,
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

      <h3 className={guideProductTitleTwoLineClassName}>
        {titleHref ? (
          <Link
            href={titleHref}
            className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>

      <p className={guideProductMetaLineClassName}>{modelNumber?.trim() ? modelNumber : "\u00A0"}</p>

      <div className={guideProductReviewSlotClassName}>{reviewSlot ?? null}</div>

      <div className={guideProductPriceSlotClassName}>{priceSlot}</div>

      <div className={guideProductSpecSlotClassName}>{specsSlot}</div>

      {shopSlot ? <div className={guideProductShopButtonSlotClassName}>{shopSlot}</div> : null}
    </div>
  )
}
