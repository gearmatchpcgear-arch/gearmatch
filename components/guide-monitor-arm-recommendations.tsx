"use client"

import { useEffect, useMemo } from "react"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GuideRecommendationsCardStack,
  GuideRecommendationsHeader,
  GuideRecommendationsSection,
  guideRecommendationsListOnlySubtitle,
} from "@/components/guide-recommendations-layout"
import { GUIDE_MONITOR_ARM_RECOMMENDATIONS } from "@/lib/guide-monitor-arm-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import {
  collectGuideRecommendationImageUrls,
  preloadGuideProductImages,
} from "@/lib/guide-image-preload"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideMonitorArmRecommendationsProps = {
  pool: Gadget[]
}

export function GuideMonitorArmRecommendations({ pool }: GuideMonitorArmRecommendationsProps) {
  const resolved = useMemo(
    () =>
      GUIDE_MONITOR_ARM_RECOMMENDATIONS.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [pool],
  )

  useEffect(() => {
    const urls = collectGuideRecommendationImageUrls(GUIDE_MONITOR_ARM_RECOMMENDATIONS, (id) =>
      resolveGadget(id, pool),
    )
    return preloadGuideProductImages(urls, 6)
  }, [pool])

  return (
    <GuideRecommendationsSection>
      <GuideRecommendationsHeader
        categoryLabel="モニターアーム"
        compareHref="/?category=monitor-arm"
        subtitle={guideRecommendationsListOnlySubtitle}
      />
      <GuideRecommendationsCardStack>
        {resolved.map(({ pick, gadget }, index) => (
          <GuideRecommendationCard
            key={pick.id}
            pick={pick}
            category="monitor-arm"
            gadget={gadget}
            priority={index < 2}
          />
        ))}
      </GuideRecommendationsCardStack>
    </GuideRecommendationsSection>
  )
}
