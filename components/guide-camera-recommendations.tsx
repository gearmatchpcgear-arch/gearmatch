"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import { GUIDE_CAMERA_RECOMMENDATIONS } from "@/lib/guide-camera-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import {
  collectGuideRecommendationImageUrls,
  preloadGuideProductImages,
} from "@/lib/guide-image-preload"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideCameraRecommendationsProps = {
  pool: Gadget[]
}

/** 「失敗しないカメラの選び方」の直下に表示するおすすめカード */
export function GuideCameraRecommendations({ pool }: GuideCameraRecommendationsProps) {
  const resolved = useMemo(
    () =>
      GUIDE_CAMERA_RECOMMENDATIONS.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [pool],
  )

  useEffect(() => {
    const urls = collectGuideRecommendationImageUrls(GUIDE_CAMERA_RECOMMENDATIONS, (id) =>
      resolveGadget(id, pool),
    )
    return preloadGuideProductImages(urls, 6)
  }, [pool])

  return (
    <section className="mb-12 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Link
          href="/?category=camera"
          className="ml-auto text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          トップの一覧で比較する →
        </Link>
      </div>

      {resolved.map(({ pick, gadget }, index) => (
        <GuideRecommendationCard
          key={pick.id}
          pick={pick}
          category="camera"
          gadget={gadget}
          priority={index < 2}
        />
      ))}
    </section>
  )
}
