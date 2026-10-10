"use client"

import { useMemo, useState } from "react"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GuideRecommendationsCardStack,
  GuideRecommendationsHeader,
  GuideRecommendationsListTitle,
  GuideRecommendationsSection,
  GuideRecommendationsTabs,
} from "@/components/guide-recommendations-layout"
import {
  GUIDE_KEYBOARD_LIST_TITLES,
  GUIDE_KEYBOARD_RECOMMENDATIONS,
  GUIDE_KEYBOARD_TABS,
  type GuideKeyboardRecommendationId,
} from "@/lib/guide-keyboard-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideKeyboardSectionProps = {
  pool: Gadget[]
}

export function GuideKeyboardSection({ pool }: GuideKeyboardSectionProps) {
  const [keyboardType, setKeyboardType] = useState<GuideKeyboardRecommendationId>("entry")

  const picks = GUIDE_KEYBOARD_RECOMMENDATIONS[keyboardType]

  const resolvedGadgets = useMemo(
    () =>
      picks.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [picks, pool],
  )

  return (
    <GuideRecommendationsSection>
      <GuideRecommendationsHeader categoryLabel="キーボード" compareHref="/?category=keyboard" />
      <GuideRecommendationsTabs
        tabs={GUIDE_KEYBOARD_TABS}
        selectedId={keyboardType}
        onSelect={setKeyboardType}
      />
      <GuideRecommendationsListTitle>{GUIDE_KEYBOARD_LIST_TITLES[keyboardType]}</GuideRecommendationsListTitle>
      <GuideRecommendationsCardStack>
        {resolvedGadgets.map(({ pick, gadget }, index) => (
          <GuideRecommendationCard
            key={pick.id}
            pick={pick}
            category="keyboard"
            gadget={gadget}
            priority={index < 2}
          />
        ))}
      </GuideRecommendationsCardStack>
    </GuideRecommendationsSection>
  )
}
