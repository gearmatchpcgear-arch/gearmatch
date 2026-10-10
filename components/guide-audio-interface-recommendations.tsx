"use client"

import { useMemo, useState } from "react"
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
  GUIDE_AUDIO_INTERFACE_LIST_TITLES,
  GUIDE_AUDIO_INTERFACE_PLACEHOLDER_MESSAGES,
  GUIDE_AUDIO_INTERFACE_RECOMMENDATIONS,
  GUIDE_AUDIO_INTERFACE_TABS,
  type GuideAudioInterfaceRecommendationId,
} from "@/lib/guide-audio-interface-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideAudioInterfaceRecommendationsProps = {
  pool: Gadget[]
}

export function GuideAudioInterfaceRecommendations({
  pool,
}: GuideAudioInterfaceRecommendationsProps) {
  const [selectedType, setSelectedType] =
    useState<GuideAudioInterfaceRecommendationId>("beginner")

  const picks = GUIDE_AUDIO_INTERFACE_RECOMMENDATIONS[selectedType]

  const resolvedGadgets = useMemo(
    () =>
      picks.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [picks, pool],
  )

  const placeholderMessage =
    selectedType === "music" || selectedType === "streaming"
      ? GUIDE_AUDIO_INTERFACE_PLACEHOLDER_MESSAGES[selectedType]
      : null

  return (
    <GuideRecommendationsSection>
      <GuideRecommendationsHeader
        categoryLabel="オーディオインターフェイス"
        compareHref="/?category=audio-interface"
      />
      <GuideRecommendationsTabs
        tabs={GUIDE_AUDIO_INTERFACE_TABS}
        selectedId={selectedType}
        onSelect={setSelectedType}
      />
      <GuideRecommendationsListTitle>
        {GUIDE_AUDIO_INTERFACE_LIST_TITLES[selectedType]}
      </GuideRecommendationsListTitle>
      <GuideRecommendationsCardStack>
        {resolvedGadgets.length > 0 ? (
          resolvedGadgets.map(({ pick, gadget }, index) => (
            <GuideRecommendationCard
              key={pick.id}
              pick={pick}
              category="audio-interface"
              gadget={gadget}
              priority={index < 2}
            />
          ))
        ) : (
          <div className={guideRecommendationsMidGridClassName}>
            <div className={cn("md:col-span-12", guideRecommendationsEmptyStateClassName)}>
              {placeholderMessage}
            </div>
          </div>
        )}
      </GuideRecommendationsCardStack>
    </GuideRecommendationsSection>
  )
}
