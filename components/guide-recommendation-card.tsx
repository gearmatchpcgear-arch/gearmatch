"use client"

import { useMemo } from "react"
import { ShopLink, SHOP_LINK_LABEL } from "@/components/shop-link"
import { GuideCardBadge } from "@/components/guide-card-badge"
import { GuideRecommendationProductSummary } from "@/components/guide-recommendation-product-summary"
import { ProductImageWithFallback } from "@/components/product-image-with-fallback"
import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"
import { getProductImageCandidates, isValidProductImage } from "@/lib/gadget-images"
import {
  INSTA360_LINK_2_AMAZON_IMAGES,
  INSTA360_LINK_2_IMAGE_URL,
  isInsta360Link2ProductRef,
} from "@/lib/camera-insta360-link-2-images"
import {
  getDisplayRating,
  getDisplayReviewCount,
  hasDisplayReviews,
  type CategoryId,
  type Gadget,
} from "@/lib/gadgets"
import { getGuideMonitorCardSpecs } from "@/lib/guide-monitor-card-specs"
import { resolveGuidePriceLabel } from "@/lib/guide-price-label"
import { GUIDE_RECOMMENDATION_IMAGE_SIZES } from "@/lib/guide-image-config"
import {
  guideRecommendationsInnerInsetClassName,
  guideRecommendationsMidGridClassName,
  guideRecommendationsProductColumnClassName,
  guideRecommendationsReasonColumnClassName,
} from "@/components/guide-recommendations-layout"
import {
  guideProductReasonHeadingClassName,
  guideProductSpecRowClassName,
  guideProductSpecValueClassName,
} from "@/lib/product-card-layout"
import { cleanAmazonPurchaseUrl } from "@/lib/amazon-purchase-url"
import { cn } from "@/lib/utils"

type GuideRecommendationCardProps = {
  pick: GuideCategoryRecommendation
  category: CategoryId
  gadget?: Gadget
  /** ファーストビュー付近のカード向け（LCP / 先読み） */
  priority?: boolean
}

function resolveImageCandidates(
  pick: GuideCategoryRecommendation,
  category: CategoryId,
  gadget?: Gadget,
): string[] {
  if (isInsta360Link2ProductRef(pick.id, gadget?.id)) {
    return getProductImageCandidates(INSTA360_LINK_2_IMAGE_URL, category, [
      ...INSTA360_LINK_2_AMAZON_IMAGES,
      ...(pick.imageFallbackUrls ?? []),
    ])
  }

  const primary =
    (pick.imageUrl && isValidProductImage(pick.imageUrl) ? pick.imageUrl : undefined) ??
    (gadget?.image && isValidProductImage(gadget.image) ? gadget.image : undefined)

  return getProductImageCandidates(primary, category, pick.imageFallbackUrls ?? [])
}

export function GuideRecommendationCard({
  pick,
  category,
  gadget,
  priority = false,
}: GuideRecommendationCardProps) {
  const priceLabel = resolveGuidePriceLabel(gadget, pick.priceLabel)

  const displayRating =
    pick.guideRating ?? (gadget ? getDisplayRating(gadget) : undefined)
  const displayReviews =
    pick.guideReviewCount ?? (gadget ? getDisplayReviewCount(gadget) : undefined)
  const showReviews = gadget
    ? hasDisplayReviews(gadget)
    : displayRating != null &&
      Number.isFinite(displayRating) &&
      displayReviews != null &&
      Number.isFinite(displayReviews) &&
      displayReviews > 0

  const imageCandidates = useMemo(
    () => resolveImageCandidates(pick, category, gadget),
    [pick, category, gadget],
  )

  const cardSpecs =
    category === "monitor" ? getGuideMonitorCardSpecs(pick.specs) : pick.specs

  return (
    <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
      <div className={guideRecommendationsProductColumnClassName}>
        <GuideRecommendationProductSummary
          badge={<GuideCardBadge>{pick.badge}</GuideCardBadge>}
          image={
            <ProductImageWithFallback
              candidates={imageCandidates}
              alt={pick.title}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes={GUIDE_RECOMMENDATION_IMAGE_SIZES}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
            />
          }
          title={pick.title}
          modelNumber={pick.modelNumber}
          reviewSlot={
            showReviews ? (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-chart-3">★ {displayRating!.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({displayReviews!.toLocaleString("ja-JP")}件のレビュー)
                </span>
              </div>
            ) : null
          }
          priceSlot={priceLabel}
          specsSlot={
            cardSpecs.length > 0 ? (
              <div className={cn(guideRecommendationsInnerInsetClassName, "text-xs text-muted-foreground")}>
                <div className="space-y-1.5">
                  {cardSpecs.map((spec) => (
                    <div key={spec.label} className={guideProductSpecRowClassName}>
                      <span className="shrink-0">{spec.label}</span>
                      <span className={guideProductSpecValueClassName}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div aria-hidden className="min-h-[5.5rem] sm:min-h-[6.75rem]" />
            )
          }
          shopSlot={
            gadget ? (
              pick.purchaseUrl ? (
                <a
                  href={cleanAmazonPurchaseUrl(pick.purchaseUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  {SHOP_LINK_LABEL}
                </a>
              ) : (
                <ShopLink
                  gadget={gadget}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:px-4 sm:py-2.5 sm:text-sm"
                />
              )
            ) : undefined
          }
        />
      </div>

      <div className={guideRecommendationsReasonColumnClassName}>
        <h4 className={guideProductReasonHeadingClassName}>{pick.heading}</h4>

        <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
          {pick.reasons.map((reason) => (
            <li key={reason.emphasis} className="flex min-w-0 items-start gap-2">
              <span className="shrink-0 text-primary" aria-hidden>
                ✔
              </span>
              <span className="min-w-0 break-words">
                <strong>{reason.emphasis}</strong> {reason.text}
              </span>
            </li>
          ))}
          {pick.concern ? (
            <li className="flex min-w-0 items-start gap-2 border-t border-slate-200 pt-2.5 text-amber-700 dark:text-amber-400">
              <span className="shrink-0 font-bold" aria-hidden>
                ⚠️
              </span>
              <span className="min-w-0 break-words">
                <strong>{pick.concern.emphasis}</strong> {pick.concern.text}
              </span>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}
