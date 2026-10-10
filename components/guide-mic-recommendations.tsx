"use client"

import { useEffect, useMemo, useState } from "react"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GuideRecommendationsCardStack,
  GuideRecommendationsHeader,
  GuideRecommendationsListTitle,
  GuideRecommendationsSection,
  GuideRecommendationsTabs,
  guideRecommendationsEmptyStateClassName,
  guideRecommendationsMidGridClassName,
} from "@/components/guide-recommendations-layout"
import { cn } from "@/lib/utils"
import {
  GUIDE_MIC_LIST_TITLES,
  GUIDE_MIC_PLACEHOLDER_MESSAGE,
  GUIDE_MIC_RECOMMENDATIONS,
  GUIDE_MIC_TABS,
  type GuideMicRecommendationId,
} from "@/lib/guide-mic-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import {
  collectGuideRecommendationImageUrls,
  preloadGuideProductImages,
} from "@/lib/guide-image-preload"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideMicRecommendationsProps = {
  pool: Gadget[]
}

export function GuideMicRecommendations({ pool }: GuideMicRecommendationsProps) {
  const [micType, setMicType] = useState<GuideMicRecommendationId>("dynamic")

  const picks = GUIDE_MIC_RECOMMENDATIONS[micType]

  const resolvedGadgets = useMemo(
    () =>
      picks.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [picks, pool],
  )

  useEffect(() => {
    const resolve = (id: string) => resolveGadget(id, pool)
    const urls = collectGuideRecommendationImageUrls(
      [...GUIDE_MIC_RECOMMENDATIONS.dynamic, ...GUIDE_MIC_RECOMMENDATIONS.condenser],
      resolve,
    )
    return preloadGuideProductImages(urls, 10)
  }, [pool])

  useEffect(() => {
    const urls = collectGuideRecommendationImageUrls(picks, (id) => resolveGadget(id, pool))
    return preloadGuideProductImages(urls, 6)
  }, [picks, pool])

  return (
    <GuideRecommendationsSection>
      <GuideRecommendationsHeader categoryLabel="マイク" compareHref="/?category=mic" />
      <GuideRecommendationsTabs tabs={GUIDE_MIC_TABS} selectedId={micType} onSelect={setMicType} />
      <GuideRecommendationsListTitle>{GUIDE_MIC_LIST_TITLES[micType]}</GuideRecommendationsListTitle>
      <GuideRecommendationsCardStack>
        {resolvedGadgets.length > 0 ? (
          resolvedGadgets.map(({ pick, gadget }, index) => (
            <GuideRecommendationCard
              key={pick.id}
              pick={pick}
              category="mic"
              gadget={gadget}
              priority={index < 2}
            />
          ))
        ) : (
          <div className={guideRecommendationsMidGridClassName}>
            <div className={cn("md:col-span-12", guideRecommendationsEmptyStateClassName)}>
              {GUIDE_MIC_PLACEHOLDER_MESSAGE}
            </div>
          </div>
        )}
      </GuideRecommendationsCardStack>
    </GuideRecommendationsSection>
  )
}
