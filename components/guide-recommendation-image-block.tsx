"use client"

import type { ReactNode } from "react"
import { areProductImagesHiddenForReview } from "@/lib/product-images-display"
import { cn } from "@/lib/utils"

type GuideRecommendationImageBlockProps = {
  badge?: ReactNode
  className?: string
  children: ReactNode
}

/** ガイドおすすめの商品画像エリア（審査中はバッジのみ表示） */
export function GuideRecommendationImageBlock({
  badge,
  className,
  children,
}: GuideRecommendationImageBlockProps) {
  const hideImages = areProductImagesHiddenForReview()

  if (hideImages) {
    return badge ? <div className="mb-2">{badge}</div> : null
  }

  return <div className={cn(className)}>{badge}{children}</div>
}
