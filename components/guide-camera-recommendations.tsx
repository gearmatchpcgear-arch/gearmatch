"use client"

import { Suspense, useEffect, useMemo, type ReactNode } from "react"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GuideRecommendationsCardStack,
  GuideRecommendationsHeader,
  GuideRecommendationsSection,
  guideRecommendationsListOnlySubtitle,
} from "@/components/guide-recommendations-layout"
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
  seoSlot?: ReactNode
}

/** 「失敗しないカメラの選び方」の直下に表示するおすすめカード */
export function GuideCameraRecommendations({ pool, seoSlot }: GuideCameraRecommendationsProps) {
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
    <GuideRecommendationsSection>
      <GuideRecommendationsHeader
        categoryLabel="カメラ"
        compareHref="/?category=camera"
        subtitle={guideRecommendationsListOnlySubtitle}
      />
      {seoSlot ? <Suspense fallback={null}>{seoSlot}</Suspense> : null}
      <GuideRecommendationsCardStack>
        {resolved.map(({ pick, gadget }, index) => (
          <GuideRecommendationCard
            key={pick.id}
            pick={pick}
            category="camera"
            gadget={gadget}
            priority={index < 2}
          />
        ))}
      </GuideRecommendationsCardStack>
    </GuideRecommendationsSection>
  )
}
