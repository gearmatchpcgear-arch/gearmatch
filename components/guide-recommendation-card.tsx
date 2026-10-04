"use client"

import { useMemo } from "react"
import { ShopLink, SHOP_LINK_LABEL } from "@/components/shop-link"
import { GuideCardBadge } from "@/components/guide-card-badge"
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
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col items-start gap-6 md:flex-row">
        <div className="w-full rounded-lg border border-border/60 bg-background p-4 shadow-sm md:w-5/12">
          <div className="relative mb-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border bg-white p-3 shadow-inner">
            <GuideCardBadge>{pick.badge}</GuideCardBadge>
            <ProductImageWithFallback
              candidates={imageCandidates}
              alt={pick.title}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 768px) 80vw, 320px"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <h3 className="mb-1 text-base font-bold text-foreground">{pick.title}</h3>
          {pick.modelNumber ? (
            <p className="mb-1 text-xs text-muted-foreground">{pick.modelNumber}</p>
          ) : null}

          {showReviews ? (
            <div className="mb-3 flex items-center gap-1.5 text-xs">
              <span className="font-bold text-chart-3">★ {displayRating!.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({displayReviews!.toLocaleString("ja-JP")}件のレビュー)
              </span>
            </div>
          ) : null}

          <div className="mb-4 text-lg font-bold text-primary">{priceLabel}</div>

          <div className="mb-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            {cardSpecs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-3">
                <span>{spec.label}</span>
                <span className="text-right font-medium text-foreground">{spec.value}</span>
              </div>
            ))}
          </div>

          {gadget ? (
            pick.purchaseUrl ? (
              <a
                href={pick.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {SHOP_LINK_LABEL}
              </a>
            ) : (
              <ShopLink
                gadget={gadget}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              />
            )
          ) : null}
        </div>

        <div className="w-full space-y-3 md:w-7/12">
          <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
            {pick.heading}
          </h4>

          <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
            {pick.reasons.map((reason) => (
              <li key={reason.emphasis} className="flex items-start gap-2">
                <span className="shrink-0 text-primary" aria-hidden>
                  ✔
                </span>
                <span>
                  <strong>{reason.emphasis}</strong> {reason.text}
                </span>
              </li>
            ))}
            {pick.concern ? (
              <li className="flex items-start gap-2 border-t border-border/60 pt-2.5 text-amber-700 dark:text-amber-400">
                <span className="shrink-0 font-bold" aria-hidden>
                  ⚠️
                </span>
                <span>
                  <strong>{pick.concern.emphasis}</strong> {pick.concern.text}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  )
}
