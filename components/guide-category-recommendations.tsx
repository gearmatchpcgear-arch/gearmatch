"use client"

import { Suspense, useMemo, type ReactNode } from "react"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GuideRecommendationsCardStack,
  GuideRecommendationsHeader,
  GuideRecommendationsSection,
  guideRecommendationsListOnlySubtitle,
} from "@/components/guide-recommendations-layout"
import {
  GUIDE_CATEGORY_RECOMMENDATIONS,
  type GuideCategoryRecommendationId,
} from "@/lib/guide-category-recommendations"
import { gadgets, type CategoryId, type Gadget } from "@/lib/gadgets"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideCategoryRecommendationsProps = {
  category: GuideCategoryRecommendationId
  categoryLabel: string
  pool: Gadget[]
  seoSlot?: ReactNode
}

export function GuideCategoryRecommendations({
  category,
  categoryLabel,
  pool,
  seoSlot,
}: GuideCategoryRecommendationsProps) {
  const picks = GUIDE_CATEGORY_RECOMMENDATIONS[category]

  const resolvedGadgets = useMemo(
    () =>
      picks.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [picks, pool],
  )

  const compareHref =
    category === "gaming-chair" ? "/?category=gaming-chair" : `/?category=${category as CategoryId}`

  return (
    <GuideRecommendationsSection>
      <GuideRecommendationsHeader
        categoryLabel={categoryLabel}
        compareHref={compareHref}
        subtitle={guideRecommendationsListOnlySubtitle}
      />
      {seoSlot ? <Suspense fallback={null}>{seoSlot}</Suspense> : null}
      <GuideRecommendationsCardStack>
        {resolvedGadgets.map(({ pick, gadget }, index) => (
          <GuideRecommendationCard
            key={pick.id}
            pick={pick}
            category={category}
            gadget={gadget}
            priority={index < 2}
          />
        ))}
      </GuideRecommendationsCardStack>
    </GuideRecommendationsSection>
  )
}
